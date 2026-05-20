import re
from typing import Optional
from pydantic import EmailStr
from sqlmodel import SQLModel, Field
from models.user import UserRead


class RegisterRequest(SQLModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    full_name: str = Field(min_length=1, max_length=255)
    recaptcha_token: Optional[str] = None

    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        errors = []
        if not re.search(r"[A-Z]", v):
            errors.append("one uppercase letter")
        if not re.search(r"[a-z]", v):
            errors.append("one lowercase letter")
        if not re.search(r"\d", v):
            errors.append("one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            errors.append("one special character")
        if errors:
            raise ValueError(f"Password must contain: {', '.join(errors)}")
        return v


class LoginRequest(SQLModel):
    email: EmailStr
    password: str
    recaptcha_token: Optional[str] = None


class GoogleAuthURL(SQLModel):
    auth_url: str


class TokenResponse(SQLModel):
    token_type: str = "bearer"
    message: str = "Authentication successful"
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    user: Optional[UserRead] = None


class ChangePasswordRequest(SQLModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=100)
