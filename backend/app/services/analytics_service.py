from collections import Counter

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.ml.risk_scorer import RiskProfile, compute_full_risk_profile
from app.ml.ror_calculator import RORResult, compute_ror_for_drug_reaction
from app.models.drug import DrugReport, DrugStatistics, YearlyTrend


def get_ror_signals_for_drug(db: Session, drug_name: str, limit: int = 10) -> list[RORResult]:
    drug_lower = drug_name.lower()
    stat = db.query(DrugStatistics).filter(DrugStatistics.drug_name == drug_lower).first()
    if not stat:
        return []

    total_all = db.query(func.count(DrugReport.id)).scalar() or 0
    reactions = db.query(DrugReport.reaction).filter(DrugReport.drug_name == drug_lower).all()
    top_reactions = Counter(row[0] for row in reactions).most_common(limit)

    signals = []
    for reaction_name, count_in_drug in top_reactions:
        count_in_all = (
            db.query(func.count(DrugReport.id)).filter(DrugReport.reaction == reaction_name).scalar() or 0
        )
        signals.append(
            compute_ror_for_drug_reaction(
                drug_name=drug_lower,
                reaction=reaction_name,
                total_drug_reports=stat.total_reports,
                total_all_reports=total_all,
                reaction_in_drug=count_in_drug,
                reaction_in_all=count_in_all,
            )
        )

    return signals


def get_trend_data_for_drug(db: Session, drug_name: str) -> list[dict]:
    drug_lower = drug_name.lower()
    trends = (
        db.query(YearlyTrend)
        .filter(YearlyTrend.drug_name == drug_lower)
        .order_by(YearlyTrend.year)
        .all()
    )
    return [
        {
            "year": trend.year,
            "report_count": trend.report_count,
            "serious_count": trend.serious_count,
        }
        for trend in trends
    ]


def compute_profile_for_drug(db: Session, drug_name: str) -> tuple[RiskProfile | None, list[RORResult], list[dict]]:
    drug_lower = drug_name.lower()
    stat = db.query(DrugStatistics).filter(DrugStatistics.drug_name == drug_lower).first()
    if not stat:
        return None, [], []

    ror_signals = get_ror_signals_for_drug(db, drug_lower)
    trend_data = get_trend_data_for_drug(db, drug_lower)
    profile = compute_full_risk_profile(
        drug_name=drug_lower,
        total_reports=stat.total_reports,
        serious_count=stat.serious_reports,
        death_count=stat.death_reports,
        ror_signals=ror_signals,
        trend_data=trend_data,
    )
    return profile, ror_signals, trend_data


def recalculate_score_for_drug(db: Session, stat: DrugStatistics) -> RiskProfile | None:
    profile, _, _ = compute_profile_for_drug(db, stat.drug_name)
    if not profile:
        return None

    stat.risk_score = profile.risk_score
    return profile
