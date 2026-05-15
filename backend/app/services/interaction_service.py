from sqlalchemy.orm import Session
from app.models.drug import DrugStatistics, DrugReport
from collections import Counter
import math

SERIOUS_REACTIONS = {
    "death", "cardiac arrest", "liver failure", "renal failure",
    "anaphylaxis", "stroke", "seizure", "respiratory failure",
    "myocardial infarction", "pulmonary embolism"
}

def check_interaction(drug1: str, drug2: str, db: Session):
    d1 = db.query(DrugStatistics).filter(
        DrugStatistics.drug_name == drug1.lower().strip()
    ).first()

    d2 = db.query(DrugStatistics).filter(
        DrugStatistics.drug_name == drug2.lower().strip()
    ).first()

    if not d1:
        return {"error": f"Drug not found: {drug1}"}
    if not d2:
        return {"error": f"Drug not found: {drug2}"}

    r1 = db.query(DrugReport.reaction).filter(
        DrugReport.drug_name == drug1.lower().strip()
    ).all()
    r2 = db.query(DrugReport.reaction).filter(
        DrugReport.drug_name == drug2.lower().strip()
    ).all()

    set1 = set(r[0].lower() for r in r1 if r[0])
    set2 = set(r[0].lower() for r in r2 if r[0])

    common_reactions = list(set1.intersection(set2))
    serious_common   = [r for r in common_reactions if r in SERIOUS_REACTIONS]

    # Compute Risk Amplification Score
    # Base amplification is 1.0. 
    # Each common reaction adds 0.1.
    # Each serious common reaction adds 0.5.
    # High base scores add to amplification.
    amplification = 1.0 + (len(common_reactions) * 0.1) + (len(serious_common) * 0.5)
    
    # If both drugs are high risk, multiply amplification
    if d1.risk_score > 50 and d2.risk_score > 50:
        amplification *= 1.2

    amplification = round(amplification, 2)

    # Determine Severity Level: None, Mild, Moderate, Severe
    if serious_common or amplification >= 3.0:
        severity = "severe"
        summary = f"CRITICAL INTERACTION DETECTED. Synergistic toxicity risk amplified by {amplification}x. Shared critical signals: {', '.join(serious_common[:3])}."
    elif amplification >= 2.0 or (d1.risk_score > 55 and d2.risk_score > 55):
        severity = "moderate"
        summary = f"Significant clinical intersection. Combined adverse profile suggests a {amplification}x risk amplification."
    elif common_reactions or amplification > 1.2:
        severity = "mild"
        summary = "Mild signal overlap detected. Monitoring for common adverse reactions is recommended."
    else:
        severity = "none"
        summary = "No significant synergy or antagonistic interaction signals identified in current FAERS clusters."

    return {
        "drug_a": drug1.lower(),
        "drug_b": drug2.lower(),
        "drug_a_score": d1.risk_score,
        "drug_b_score": d2.risk_score,
        "drug_a_reactions": list(set1)[:5],
        "drug_b_reactions": list(set2)[:5],
        "risk_amplification": amplification,
        "severity": severity,
        "summary": summary,
        "shared_reactions": common_reactions[:15],
        "serious_shared": serious_common
    }
