from sqlalchemy import JSON, Column, DateTime, Float, Integer, String, UniqueConstraint
from sqlalchemy.sql import func

from app.database.connection import Base


class DrugReport(Base):
    __tablename__ = "drug_reports"

    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, index=True, nullable=False)
    reaction = Column(String, nullable=False)
    outcome = Column(String, nullable=True)
    report_date = Column(String, nullable=True)
    report_year = Column(Integer, index=True)
    age_group = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    country = Column(String, nullable=True)
    serious = Column(String, nullable=True)
    faers_report_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DrugStatistics(Base):
    __tablename__ = "drug_statistics"

    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, unique=True, index=True, nullable=False)
    total_reports = Column(Integer, default=0)
    serious_reports = Column(Integer, default=0)
    death_reports = Column(Integer, default=0)
    hospitalization_reports = Column(Integer, default=0)
    risk_score = Column(Float, default=0.0)
    top_reactions = Column(JSON, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ExternalEvidenceSignal(Base):
    __tablename__ = "external_evidence_signals"
    __table_args__ = (UniqueConstraint("drug_name", "source", name="uq_drug_evidence_source"),)

    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, index=True, nullable=False)
    source = Column(String, index=True, nullable=False)
    mention_count = Column(Integer, default=0)
    matched_terms = Column(JSON, nullable=True)
    sample_items = Column(JSON, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class YearlyTrend(Base):
    __tablename__ = "yearly_trends"

    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, index=True, nullable=False)
    year = Column(Integer, nullable=False)
    report_count = Column(Integer, default=0)
    serious_count = Column(Integer, default=0)
