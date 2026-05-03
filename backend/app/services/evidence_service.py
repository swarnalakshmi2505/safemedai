import asyncio
from datetime import datetime, timezone

import httpx
from sqlalchemy.orm import Session

from app.models.drug import ExternalEvidenceSignal

PUBMED_SEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
REDDIT_SEARCH_URL = "https://www.reddit.com/search.json"

ADVERSE_TERMS = [
    "adverse event",
    "adverse reaction",
    "side effect",
    "toxicity",
    "hospitalization",
    "death",
]


async def fetch_pubmed_signal(drug_name: str) -> dict:
    term = (
        f'("{drug_name}"[Title/Abstract]) AND '
        '("adverse effects"[Subheading] OR "adverse event"[Title/Abstract] OR '
        '"adverse reaction"[Title/Abstract] OR "side effect"[Title/Abstract] OR '
        'toxicity[Title/Abstract])'
    )
    params = {
        "db": "pubmed",
        "term": term,
        "retmode": "json",
        "retmax": 0,
        "tool": "SafeMedAI",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(PUBMED_SEARCH_URL, params=params)
            response.raise_for_status()
            count = int(response.json().get("esearchresult", {}).get("count", 0))
            return {
                "source": "pubmed",
                "mention_count": count,
                "matched_terms": ADVERSE_TERMS,
                "sample_items": [],
            }
        except (httpx.HTTPError, ValueError, KeyError) as exc:
            print(f"PubMed evidence error for {drug_name}: {exc}")
            return {"source": "pubmed", "mention_count": 0, "matched_terms": ADVERSE_TERMS, "sample_items": []}


async def fetch_reddit_signal(drug_name: str, limit: int = 25) -> dict:
    query = f'"{drug_name}" "side effect" OR "{drug_name}" "adverse reaction" OR "{drug_name}" toxicity'
    params = {"q": query, "sort": "new", "t": "year", "limit": limit}
    headers = {"User-Agent": "SafeMedAI/0.1 drug-safety-research"}

    async with httpx.AsyncClient(timeout=15.0, headers=headers, follow_redirects=True) as client:
        try:
            response = await client.get(REDDIT_SEARCH_URL, params=params)
            response.raise_for_status()
            children = response.json().get("data", {}).get("children", [])
            drug_lower = drug_name.lower()
            filtered_items = []

            for item in children:
                data = item.get("data", {})
                haystack = f"{data.get('title', '')} {data.get('selftext', '')}".lower()
                has_drug = drug_lower in haystack
                has_adverse_term = any(term in haystack for term in ADVERSE_TERMS)
                if has_drug and has_adverse_term:
                    filtered_items.append(data)

            sample_items = [
                {
                    "title": item.get("title", ""),
                    "subreddit": item.get("subreddit", ""),
                    "url": f"https://www.reddit.com{item.get('permalink', '')}",
                }
                for item in filtered_items[:5]
            ]
            return {
                "source": "reddit",
                "mention_count": len(filtered_items),
                "matched_terms": ADVERSE_TERMS,
                "sample_items": sample_items,
            }
        except (httpx.HTTPError, ValueError, KeyError) as exc:
            print(f"Reddit evidence error for {drug_name}: {exc}")
            return {"source": "reddit", "mention_count": 0, "matched_terms": ADVERSE_TERMS, "sample_items": []}


async def fetch_external_signals(drug_name: str) -> list[dict]:
    pubmed, reddit = await asyncio.gather(
        fetch_pubmed_signal(drug_name),
        fetch_reddit_signal(drug_name),
    )
    return [pubmed, reddit]


def save_external_signals(db: Session, drug_name: str, signals: list[dict]) -> None:
    drug_lower = drug_name.lower()

    for signal in signals:
        source = signal["source"]
        existing = (
            db.query(ExternalEvidenceSignal)
            .filter(ExternalEvidenceSignal.drug_name == drug_lower, ExternalEvidenceSignal.source == source)
            .first()
        )

        if existing:
            existing.mention_count = signal["mention_count"]
            existing.matched_terms = signal.get("matched_terms")
            existing.sample_items = signal.get("sample_items")
            existing.last_updated = datetime.now(timezone.utc)
        else:
            db.add(
                ExternalEvidenceSignal(
                    drug_name=drug_lower,
                    source=source,
                    mention_count=signal["mention_count"],
                    matched_terms=signal.get("matched_terms"),
                    sample_items=signal.get("sample_items"),
                )
            )

    db.commit()
