from collections import Counter
from datetime import datetime, timezone

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.drug import DrugReport, DrugStatistics, ExternalEvidenceSignal, YearlyTrend
from app.services.analytics_service import recalculate_score_for_drug
from app.services.evidence_service import fetch_external_signals, save_external_signals
from app.services.faers_service import fetch_all_monitored_drugs


def compute_risk_score(
    total: int,
    serious: int,
    deaths: int,
    hospitalizations: int,
    pubmed_mentions: int = 0,
    reddit_mentions: int = 0,
) -> float:
    if total == 0:
        faers_score = 0.0
    else:
        serious_rate = serious / total
        death_rate = deaths / total
        hospitalization_rate = hospitalizations / total
        severity_score = (death_rate * 55) + (hospitalization_rate * 25) + (serious_rate * 20)
        sample_confidence = min(1.0, (total / 50) ** 0.5)
        faers_score = severity_score * sample_confidence

    pubmed_modifier = min(pubmed_mentions, 200) / 200 * 6
    reddit_modifier = min(reddit_mentions, 50) / 50 * 4
    return round(min(faers_score + pubmed_modifier + reddit_modifier, 100.0), 2)


def save_reports_to_db(db: Session, drug_name: str, reports: list[dict]) -> int:
    saved = 0

    for report in reports:
        report_id = report.get("faers_report_id")
        if not report_id:
            continue

        exists = db.query(DrugReport).filter(DrugReport.faers_report_id == report_id).first()
        if exists:
            continue

        db.add(DrugReport(**report))
        saved += 1

    db.commit()
    return saved


def update_drug_statistics(db: Session, drug_name: str) -> None:
    drug_lower = drug_name.lower()

    total = db.query(func.count(DrugReport.id)).filter(DrugReport.drug_name == drug_lower).scalar() or 0
    serious = (
        db.query(func.count(DrugReport.id))
        .filter(DrugReport.drug_name == drug_lower, DrugReport.serious == "1")
        .scalar()
        or 0
    )
    deaths = (
        db.query(func.count(DrugReport.id))
        .filter(DrugReport.drug_name == drug_lower, DrugReport.outcome == "fatal")
        .scalar()
        or 0
    )
    hospitalizations = (
        db.query(func.count(DrugReport.id))
        .filter(DrugReport.drug_name == drug_lower, DrugReport.outcome == "hospitalization")
        .scalar()
        or 0
    )

    reaction_rows = db.query(DrugReport.reaction).filter(DrugReport.drug_name == drug_lower).all()
    top_reactions = [reaction for reaction, _ in Counter(row[0] for row in reaction_rows).most_common(5)]

    signals = {
        signal.source: signal.mention_count
        for signal in db.query(ExternalEvidenceSignal).filter(ExternalEvidenceSignal.drug_name == drug_lower).all()
    }
    risk_score = compute_risk_score(
        total,
        serious,
        deaths,
        hospitalizations,
        pubmed_mentions=signals.get("pubmed", 0),
        reddit_mentions=signals.get("reddit", 0),
    )

    stat = db.query(DrugStatistics).filter(DrugStatistics.drug_name == drug_lower).first()
    if stat:
        stat.total_reports = total
        stat.serious_reports = serious
        stat.death_reports = deaths
        stat.hospitalization_reports = hospitalizations
        stat.risk_score = risk_score
        stat.top_reactions = top_reactions
        stat.last_updated = datetime.now(timezone.utc)
    else:
        db.add(
            DrugStatistics(
                drug_name=drug_lower,
                total_reports=total,
                serious_reports=serious,
                death_reports=deaths,
                hospitalization_reports=hospitalizations,
                risk_score=risk_score,
                top_reactions=top_reactions,
            )
        )

    db.commit()


def update_yearly_trends(db: Session, drug_name: str) -> None:
    drug_lower = drug_name.lower()

    yearly = (
        db.query(
            DrugReport.report_year,
            func.count(DrugReport.id).label("report_count"),
            func.sum(case((DrugReport.serious == "1", 1), else_=0)).label("serious_count"),
        )
        .filter(DrugReport.drug_name == drug_lower, DrugReport.report_year.is_not(None))
        .group_by(DrugReport.report_year)
        .all()
    )

    seen_years = set()
    for row in yearly:
        seen_years.add(row.report_year)
        trend = (
            db.query(YearlyTrend)
            .filter(YearlyTrend.drug_name == drug_lower, YearlyTrend.year == row.report_year)
            .first()
        )

        if trend:
            trend.report_count = row.report_count
            trend.serious_count = row.serious_count or 0
        else:
            db.add(
                YearlyTrend(
                    drug_name=drug_lower,
                    year=row.report_year,
                    report_count=row.report_count,
                    serious_count=row.serious_count or 0,
                )
            )

    (
        db.query(YearlyTrend)
        .filter(YearlyTrend.drug_name == drug_lower, YearlyTrend.year.not_in(seen_years))
        .delete(synchronize_session=False)
    )
    db.commit()


async def run_full_ingestion(db: Session, limit_per_drug: int = 100) -> dict:
    print("Starting FAERS data ingestion...")
    all_data = await fetch_all_monitored_drugs(limit_per_drug)
    summary = {}

    for drug_name, reports in all_data.items():
        saved = save_reports_to_db(db, drug_name, reports)
        signals = await fetch_external_signals(drug_name)
        save_external_signals(db, drug_name, signals)
        update_drug_statistics(db, drug_name)
        update_yearly_trends(db, drug_name)
        stat = db.query(DrugStatistics).filter(DrugStatistics.drug_name == drug_name.lower()).first()
        if stat:
            recalculate_score_for_drug(db, stat)
            db.commit()
        summary[drug_name] = {"fetched": len(reports), "saved": saved, "signals": signals}
        print(f"{drug_name}: fetched={len(reports)}, new={saved}")

    print("Ingestion complete.")
    return summary
