import math
from dataclasses import dataclass
from typing import List

from app.ml.ror_calculator import RORResult


@dataclass
class RiskProfile:
    drug_name: str
    risk_score: float
    risk_level: str
    signal_count: int
    strongest_ror: float
    death_rate: float
    serious_rate: float
    trend_direction: str
    trend_magnitude: float
    explanation: str


WEIGHTS = {
    "ror_signal": 0.35,
    "death_rate": 0.25,
    "serious_rate": 0.20,
    "trend": 0.15,
    "volume": 0.05,
}


def score_ror_signals(signals: List[RORResult]) -> float:
    if not signals:
        return 0.0

    confirmed = [signal for signal in signals if signal.is_signal]
    strong = [signal for signal in confirmed if signal.signal == "strong"]
    moderate = [signal for signal in confirmed if signal.signal == "moderate"]
    weak = [signal for signal in confirmed if signal.signal == "weak"]
    raw = (len(strong) * 30) + (len(moderate) * 15) + (len(weak) * 5)
    return min(raw, 100.0)


def score_trend(trend_data: list) -> tuple[float, str, float]:
    if len(trend_data) < 2:
        return 0.0, "stable", 0.0

    sorted_data = sorted(trend_data, key=lambda item: item["year"])
    recent_years = sorted_data[-3:]

    if len(recent_years) < 2:
        return 0.0, "stable", 0.0

    first_count = recent_years[0]["report_count"] or 1
    last_count = recent_years[-1]["report_count"] or 0
    pct_change = ((last_count - first_count) / first_count) * 100

    if pct_change > 30:
        return min(pct_change, 100), "increasing", round(pct_change, 1)
    if pct_change < -20:
        return 0.0, "decreasing", round(pct_change, 1)
    return 20.0, "stable", round(pct_change, 1)


def compute_full_risk_profile(
    drug_name: str,
    total_reports: int,
    serious_count: int,
    death_count: int,
    ror_signals: List[RORResult],
    trend_data: list,
) -> RiskProfile:
    death_rate = death_count / total_reports if total_reports else 0
    serious_rate = serious_count / total_reports if total_reports else 0

    ror_score = score_ror_signals(ror_signals)
    trend_score, direction, pct_change = score_trend(trend_data)
    volume_score = min(math.log10(total_reports + 1) * 20, 100) if total_reports else 0

    final = (
        ror_score * WEIGHTS["ror_signal"]
        + death_rate * 100 * WEIGHTS["death_rate"]
        + serious_rate * 100 * WEIGHTS["serious_rate"]
        + trend_score * WEIGHTS["trend"]
        + volume_score * WEIGHTS["volume"]
    )
    final = round(min(final, 100.0), 2)

    if final >= 70:
        level = "critical"
    elif final >= 45:
        level = "high"
    elif final >= 20:
        level = "medium"
    else:
        level = "low"

    confirmed = [signal for signal in ror_signals if signal.is_signal]
    strongest_ror = max((signal.ror for signal in confirmed), default=0.0)
    signal_count = len(confirmed)

    explanation = build_explanation(
        drug_name,
        final,
        level,
        signal_count,
        strongest_ror,
        death_rate * 100,
        serious_rate * 100,
        direction,
        pct_change,
    )

    return RiskProfile(
        drug_name=drug_name,
        risk_score=final,
        risk_level=level,
        signal_count=signal_count,
        strongest_ror=round(strongest_ror, 2),
        death_rate=round(death_rate * 100, 2),
        serious_rate=round(serious_rate * 100, 2),
        trend_direction=direction,
        trend_magnitude=pct_change,
        explanation=explanation,
    )


def build_explanation(
    drug: str,
    score: float,
    level: str,
    signals: int,
    ror: float,
    death_rate: float,
    serious_rate: float,
    trend: str,
    pct_change: float,
) -> str:
    parts = [f"{drug.capitalize()} has a {level} risk score of {score}/100."]

    if signals > 0:
        parts.append(
            f"Statistical analysis detected {signals} confirmed adverse signal(s) "
            f"(strongest ROR: {ror:.1f}x above baseline)."
        )
    if death_rate > 5:
        parts.append(f"Fatality rate is elevated at {death_rate:.1f}% of reports.")
    if serious_rate > 20:
        parts.append(f"{serious_rate:.1f}% of reports involve serious outcomes requiring medical attention.")
    if trend == "increasing":
        parts.append(
            f"Reporting frequency has increased by {pct_change:.1f}% over recent years, "
            "which may indicate an emerging safety signal."
        )
    elif trend == "decreasing":
        parts.append(f"Reports have decreased by {abs(pct_change):.1f}%, suggesting improved safety management.")

    return " ".join(parts)
