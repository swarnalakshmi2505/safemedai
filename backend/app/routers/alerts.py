from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.alert import Alert
from app.models.drug import DrugStatistics
from app.models.user import User
from app.routers.auth import get_current_user, require_officer

router = APIRouter(prefix="/alerts", tags=["Alerts"])

THRESHOLDS = {"medium": 30, "high": 55, "critical": 70}


@router.post("/generate")
def generate_alerts(db: Session = Depends(get_db), _: User = Depends(require_officer)):
    """Auto-generate alerts for drugs crossing risk thresholds."""
    created = 0
    stats = db.query(DrugStatistics).all()

    for stat in stats:
        level = None
        if stat.risk_score >= THRESHOLDS["critical"]:
            level = "critical"
        elif stat.risk_score >= THRESHOLDS["high"]:
            level = "high"
        elif stat.risk_score >= THRESHOLDS["medium"]:
            level = "medium"

        if not level:
            continue

        existing = (
            db.query(Alert)
            .filter(Alert.drug_name == stat.drug_name, Alert.is_validated.is_(False))
            .first()
        )
        if existing:
            continue

        top_reactions = stat.top_reactions or []
        reaction_text = ", ".join(top_reactions[:3]) if top_reactions else "no top reactions available"

        db.add(
            Alert(
                drug_name=stat.drug_name,
                level=level,
                risk_score=stat.risk_score,
                message=(
                    f"{stat.drug_name.capitalize()} crossed the {level} threshold with a risk score of "
                    f"{stat.risk_score}. Top reactions: {reaction_text}."
                ),
            )
        )
        created += 1

    db.commit()
    return {"message": f"Generated {created} new alerts"}


@router.get("/")
def list_alerts(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(50).all()
    return [
        {
            "id": alert.id,
            "drug_name": alert.drug_name,
            "level": alert.level,
            "risk_score": alert.risk_score,
            "message": alert.message,
            "is_validated": alert.is_validated,
            "is_sent": alert.is_sent,
            "created_at": str(alert.created_at),
        }
        for alert in alerts
    ]


@router.patch("/{alert_id}/validate")
def validate_alert(alert_id: int, db: Session = Depends(get_db), _: User = Depends(require_officer)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_validated = True
    alert.validated_at = datetime.utcnow()
    db.commit()
    return {"message": "Alert validated"}


@router.patch("/{alert_id}/send")
def send_alert(alert_id: int, db: Session = Depends(get_db), _: User = Depends(require_officer)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if not alert.is_validated:
        raise HTTPException(status_code=400, detail="Validate alert before sending")

    alert.is_sent = True
    db.commit()
    return {"message": "Alert sent to doctors"}