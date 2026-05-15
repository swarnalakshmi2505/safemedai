from app.database.connection import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(f"Email: {u.email}, Verified: {u.is_verified}, Role: {u.role}")
db.close()
