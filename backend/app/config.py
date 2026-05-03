import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


def _get_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    API_TITLE: str = "SafeMedAI API"
    API_DESCRIPTION: str = "AI-powered pharmacovigilance platform"
    API_VERSION: str = "0.1.0"

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/safemedai",
    )

    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    ALLOWED_ORIGINS: list[str] = field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]
    )

    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = _get_bool("DEBUG", True)
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")


settings = Settings()
