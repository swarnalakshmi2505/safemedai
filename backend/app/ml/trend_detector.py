from dataclasses import dataclass
from typing import Dict, List


@dataclass
class TrendAlert:
    drug_name: str
    alert_type: str
    severity: str
    message: str
    year_data: list


def detect_spike(trend_data: list, drug_name: str) -> TrendAlert | None:
    if len(trend_data) < 2:
        return None

    sorted_data = sorted(trend_data, key=lambda item: item["year"])
    for index in range(1, len(sorted_data)):
        previous = sorted_data[index - 1]["report_count"] or 1
        current = sorted_data[index]["report_count"]
        change = ((current - previous) / previous) * 100
        if change > 50:
            return TrendAlert(
                drug_name=drug_name,
                alert_type="spike",
                severity="high" if change > 100 else "medium",
                message=(
                    f"{drug_name.capitalize()} reports spiked {change:.1f}% in "
                    f"{sorted_data[index]['year']} vs {sorted_data[index - 1]['year']}. "
                    "This may indicate a new safety issue or increased prescribing."
                ),
                year_data=sorted_data,
            )
    return None


def detect_sustained_increase(trend_data: list, drug_name: str) -> TrendAlert | None:
    if len(trend_data) < 3:
        return None

    sorted_data = sorted(trend_data, key=lambda item: item["year"])
    counts = [row["report_count"] for row in sorted_data[-4:]]

    if len(counts) >= 3 and all(counts[index] < counts[index + 1] for index in range(len(counts) - 1)):
        total_change = ((counts[-1] - counts[0]) / (counts[0] or 1)) * 100
        return TrendAlert(
            drug_name=drug_name,
            alert_type="sustained_increase",
            severity="medium",
            message=(
                f"{drug_name.capitalize()} has shown {len(counts)} consecutive years of increasing adverse reports "
                f"(total +{total_change:.1f}%). Recommend enhanced monitoring."
            ),
            year_data=sorted_data,
        )
    return None


def analyze_all_trends(drug_trend_map: Dict[str, list]) -> List[TrendAlert]:
    alerts = []
    for drug_name, trend_data in drug_trend_map.items():
        spike = detect_spike(trend_data, drug_name)
        if spike:
            alerts.append(spike)

        sustained = detect_sustained_increase(trend_data, drug_name)
        if sustained:
            alerts.append(sustained)

    return alerts
