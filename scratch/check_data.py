from app.database.connection import SessionLocal
from app.models.user import User
from app.models.alert import Alert
from app.models.doctor_report import DoctorReport

db = SessionLocal()

print("--- ALERTS ---")
alerts = db.query(Alert).all()
for a in alerts:
    print(f"ID: {a.id}, Drug: {a.drug_name}, Sent: {a.is_sent}, Monitored: {a.is_monitored}")

print("\n--- DOCTOR REPORTS ---")
reports = db.query(DoctorReport).all()
for r in reports:
    print(f"ID: {r.report_id}, Drug: {r.drug_name}, Status: {r.status}")

db.close()
