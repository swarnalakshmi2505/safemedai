from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from app.database.connection import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, index=True, nullable=False)
    level = Column(String, nullable=False)
    risk_score = Column(Float)
    message = Column(Text)
    is_validated = Column(Boolean, default=False)
    is_sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    validated_at = Column(DateTime(timezone=True), nullable=True)