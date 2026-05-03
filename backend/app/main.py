from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.connection import Base, engine
from app.models import alert, drug, user  # noqa: F401
from app.routers.health import router as health_router
from app.routers import analytics as analytics_router
from app.routers import auth as auth_router
from app.routers import alerts as alerts_router
from app.routers import data as data_router
from app.routers import drugs as drugs_router

app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "SafeMedAI API is running"}


app.include_router(health_router)
app.include_router(auth_router.router)
app.include_router(alerts_router.router)
app.include_router(data_router.router)
app.include_router(analytics_router.router)
app.include_router(drugs_router.router)
