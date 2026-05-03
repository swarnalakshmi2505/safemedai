import asyncio
from datetime import datetime
from typing import Dict, List

import httpx

FAERS_BASE = "https://api.fda.gov/drug/event.json"

MONITORED_DRUGS = [
    "aspirin",
    "ibuprofen",
    "metformin",
    "atorvastatin",
    "amoxicillin",
    "lisinopril",
    "omeprazole",
    "amlodipine",
    "metoprolol",
    "levothyroxine",
    "warfarin",
    "gabapentin",
    "sertraline",
    "tramadol",
    "paracetamol",
]


def parse_age_group(age_value) -> str:
    try:
        age = float(age_value)
        if age < 18:
            return "pediatric"
        if age < 60:
            return "adult"
        return "elderly"
    except (TypeError, ValueError):
        return "unknown"


def parse_year(date_str: str) -> int:
    try:
        return int(str(date_str)[:4])
    except (TypeError, ValueError):
        return datetime.now().year


def clean_report(raw: dict, drug_name: str) -> dict | None:
    try:
        patient = raw.get("patient", {})
        reactions = patient.get("reaction", [])

        if not reactions:
            return None

        report_id = str(raw.get("safetyreportid", "")).strip()
        if not report_id:
            return None

        if patient.get("patientdeath") or raw.get("seriousnessdeath") == "1":
            outcome = "fatal"
        elif raw.get("seriousnesshospitalization") == "1":
            outcome = "hospitalization"
        else:
            outcome = "unknown"

        gender_code = str(patient.get("patientsex", "0"))
        gender = {"1": "male", "2": "female"}.get(gender_code, "unknown")

        return {
            "drug_name": drug_name.lower(),
            "reaction": reactions[0].get("reactionmeddrapt", "Unknown reaction"),
            "outcome": outcome,
            "report_date": str(raw.get("receiptdate", "")),
            "report_year": parse_year(str(raw.get("receiptdate", ""))),
            "age_group": parse_age_group(patient.get("patientonsetage")),
            "gender": gender,
            "country": raw.get("primarysource", {}).get("reportercountry", "unknown"),
            "serious": str(raw.get("serious", "2")),
            "faers_report_id": report_id,
        }
    except (AttributeError, KeyError, TypeError, ValueError):
        return None


async def fetch_drug_reports(drug_name: str, limit: int = 100) -> List[dict]:
    params = {
        "search": f'patient.drug.medicinalproduct:"{drug_name}"',
        "limit": limit,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(FAERS_BASE, params=params)
            if response.status_code != 200:
                print(f"FAERS error for {drug_name}: {response.status_code}")
                return []

            reports = []
            for raw in response.json().get("results", []):
                parsed = clean_report(raw, drug_name)
                if parsed:
                    reports.append(parsed)
            return reports
        except httpx.HTTPError as exc:
            print(f"Error fetching {drug_name}: {exc}")
            return []


async def fetch_all_monitored_drugs(limit_per_drug: int = 100) -> Dict[str, List[dict]]:
    results = {}
    for drug in MONITORED_DRUGS:
        results[drug] = await fetch_drug_reports(drug, limit_per_drug)
        await asyncio.sleep(0.3)
    return results
