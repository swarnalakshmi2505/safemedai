import math
from dataclasses import dataclass


@dataclass
class RORResult:
    drug_name: str
    reaction: str
    a: int
    b: int
    c: int
    d: int
    ror: float
    ror_lower: float
    ror_upper: float
    signal: str
    is_signal: bool


def calculate_ror(a: int, b: int, c: int, d: int) -> tuple[float, float, float]:
    a, b, c, d = a + 0.5, b + 0.5, c + 0.5, d + 0.5
    ror = (a * d) / (b * c)
    se = math.sqrt(1 / a + 1 / b + 1 / c + 1 / d)
    log_ror = math.log(ror)
    lower = math.exp(log_ror - 1.96 * se)
    upper = math.exp(log_ror + 1.96 * se)
    return round(ror, 3), round(lower, 3), round(upper, 3)


def classify_signal(ror: float, lower_ci: float) -> tuple[str, bool]:
    is_confirmed = lower_ci > 1.0 and ror > 1.0
    if ror < 1:
        return "none", False
    if ror < 2:
        return "weak", is_confirmed
    if ror < 5:
        return "moderate", is_confirmed
    return "strong", is_confirmed


def compute_ror_for_drug_reaction(
    drug_name: str,
    reaction: str,
    total_drug_reports: int,
    total_all_reports: int,
    reaction_in_drug: int,
    reaction_in_all: int,
) -> RORResult:
    a = max(0, reaction_in_drug)
    b = max(0, total_drug_reports - reaction_in_drug)
    c = max(0, reaction_in_all - reaction_in_drug)
    d = max(0, total_all_reports - total_drug_reports - c)

    ror, lower, upper = calculate_ror(a, b, c, d)
    signal, is_signal = classify_signal(ror, lower)

    return RORResult(
        drug_name=drug_name,
        reaction=reaction,
        a=a,
        b=b,
        c=c,
        d=d,
        ror=ror,
        ror_lower=lower,
        ror_upper=upper,
        signal=signal,
        is_signal=is_signal,
    )
