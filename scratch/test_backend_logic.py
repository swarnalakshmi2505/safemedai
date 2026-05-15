import os
import sys

# Add the backend directory to the Python path so we can import the 'app' package
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.database.connection import SessionLocal
from app.models.alert import Alert
from app.models.doctor_report import DoctorReport
from app.models.user import User

def test_queries():
    db = SessionLocal()
    try:
        print("Testing Alerts query...")
        alerts = db.query(Alert).all()
        print(f"Found {len(alerts)} alerts.")
        for a in alerts:
            print(f"Alert: {a.drug_name}, reviewed: {a.is_reviewed}, monitored: {a.is_monitored}")
        
        print("\nTesting Doctor Reports query...")
        reports = db.query(DoctorReport).all()
        print(f"Found {len(reports)} reports.")
        for r in reports:
            doctor_name = r.doctor.full_name if r.doctor else "Unknown"
            print(f"Report: {r.report_id}, drug: {r.drug_name}, doctor: {doctor_name}")
            
    except Exception as e:
        print(f"Query failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_queries()
