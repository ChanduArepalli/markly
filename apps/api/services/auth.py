import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from jose import JWTError, jwt
from fastapi import HTTPException, Request, status
from sqlmodel import Session, select

from config import settings
from models.user import User
from models.refresh_token import RefreshToken

# Argon2id — winner of the Password Hashing Competition, no 72-byte limit
_ph = PasswordHasher(
    time_cost=2,        # iterations
    memory_cost=65536,  # 64 MB RAM
    parallelism=2,
    hash_len=32,
    salt_len=16,
)


# ── Password ──────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _ph.verify(hashed, plain)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


# ── JWT ───────────────────────────────────────────────────────────

def create_access_token(user_id: UUID, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "email": email, "type": "access", "exp": expire},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalid or expired")


# ── Refresh Token ─────────────────────────────────────────────────

def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def create_refresh_token_record(db: Session, user_id: UUID, request: Optional[Request] = None) -> str:
    raw = secrets.token_urlsafe(48)
    record = RefreshToken(
        user_id=user_id,
        token_hash=_hash_token(raw),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=request.headers.get("user-agent") if request else None,
        ip_address=request.client.host if (request and request.client) else None,
    )
    db.add(record)
    db.commit()
    return raw


def rotate_refresh_token(db: Session, raw: str, request: Optional[Request] = None) -> tuple[str, UUID]:
    record = db.exec(
        select(RefreshToken).where(RefreshToken.token_hash == _hash_token(raw), RefreshToken.is_revoked == False)
    ).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    if record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    record.is_revoked = True
    record.last_used_at = datetime.now(timezone.utc)
    db.add(record)
    db.commit()

    new_raw = create_refresh_token_record(db, record.user_id, request)
    return new_raw, record.user_id


def revoke_refresh_token(db: Session, raw: str) -> None:
    record = db.exec(select(RefreshToken).where(RefreshToken.token_hash == _hash_token(raw))).first()
    if record:
        record.is_revoked = True
        db.add(record)
        db.commit()


# ── Current User Dependency ───────────────────────────────────────

def get_current_user(request: Request, db: Session) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_access_token(token)
    user = db.exec(select(User).where(User.id == payload["sub"], User.is_active == True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


# ── Cookie helpers ────────────────────────────────────────────────

def set_auth_cookies(response, access_token: str, refresh_token: str) -> None:
    response.set_cookie("access_token", access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True, secure=settings.COOKIE_SECURE, samesite=settings.COOKIE_SAMESITE)
    response.set_cookie("refresh_token", refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=True, secure=settings.COOKIE_SECURE, samesite=settings.COOKIE_SAMESITE)


def clear_auth_cookies(response) -> None:
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
