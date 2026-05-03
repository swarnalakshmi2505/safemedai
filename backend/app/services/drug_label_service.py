import re

import httpx

OPENFDA_LABEL_URL = "https://api.fda.gov/drug/label.json"

DRUG_LABEL_ALIASES = {
    "paracetamol": "acetaminophen",
}


def _first_text(label: dict, *keys: str) -> str | None:
    for key in keys:
        value = label.get(key)
        if isinstance(value, list) and value:
            return value[0]
        if isinstance(value, str) and value:
            return value
    return None


def _clean_text(value: str | None, max_length: int = 700) -> str:
    if not value:
        return "No FDA label text found for this section."

    cleaned = re.sub(r"\s+", " ", value).strip()
    return cleaned[:max_length].rstrip() + ("..." if len(cleaned) > max_length else "")


def _label_query(drug_name: str) -> str:
    search_name = DRUG_LABEL_ALIASES.get(drug_name.lower(), drug_name.lower())
    return (
        f'openfda.generic_name:"{search_name}" OR '
        f'openfda.brand_name:"{search_name}" OR '
        f'openfda.substance_name:"{search_name}"'
    )


def fetch_drug_label_summary(drug_name: str) -> dict:
    params = {
        "search": _label_query(drug_name),
        "limit": 1,
    }

    fallback = {
        "uses": "FDA label context was not available for this drug.",
        "pros": [
            "Clinical benefits should be assessed from official labeling and patient-specific context.",
        ],
        "cons": [
            "Risks vary by patient, dose, indication, interactions, and comorbidities.",
        ],
        "label_source": "openFDA Drug Label API",
        "source_url": OPENFDA_LABEL_URL,
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.get(OPENFDA_LABEL_URL, params=params)
            if response.status_code != 200:
                return fallback

            result = response.json().get("results", [])[0]
    except (httpx.HTTPError, ValueError, IndexError, KeyError):
        return fallback

    uses = _clean_text(_first_text(result, "indications_and_usage", "purpose", "description"))
    benefits = _clean_text(_first_text(result, "clinical_studies", "indications_and_usage", "purpose"), 500)

    boxed_warning = _clean_text(_first_text(result, "boxed_warning"), 500)
    warnings = _clean_text(_first_text(result, "warnings_and_cautions", "warnings"), 500)
    adverse_reactions = _clean_text(_first_text(result, "adverse_reactions"), 500)

    cons = []
    if boxed_warning != "No FDA label text found for this section.":
        cons.append(f"Boxed warning: {boxed_warning}")
    if warnings != "No FDA label text found for this section.":
        cons.append(f"Warnings: {warnings}")
    if adverse_reactions != "No FDA label text found for this section.":
        cons.append(f"Adverse reactions: {adverse_reactions}")
    if not cons:
        cons = fallback["cons"]

    openfda = result.get("openfda", {})
    return {
        "uses": uses,
        "pros": [benefits],
        "cons": cons[:3],
        "brand_names": openfda.get("brand_name", [])[:5],
        "generic_names": openfda.get("generic_name", [])[:5],
        "label_source": "openFDA Drug Label API",
        "source_url": f"{OPENFDA_LABEL_URL}?search={_label_query(drug_name)}&limit=1",
    }
