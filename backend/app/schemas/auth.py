from pydantic import BaseModel, EmailStr
from enum import Enum
from typing import Optional


class UserRole(str, Enum):
    officer = "officer"
    doctor = "doctor"


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole
    license_number: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    is_verified: bool


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_verified: bool
    license_number: Optional[str]

    model_config = {"from_attributes": True}
