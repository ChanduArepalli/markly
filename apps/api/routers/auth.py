from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from pydantic import EmailStr
from sqlmodel import Session, select

from database import get_db
from models.user import User, UserRead
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, GoogleAuthURL, ChangePasswordRequest
from services.auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token_record,
    rotate_refresh_token, revoke_refresh_token,
    get_current_user, set_auth_cookies, clear_auth_cookies,
)
from services.oauth import get_google_auth_url, exchange_google_code
from config import settings

router = APIRouter()


# ── Register (email/password) ─────────────────────────────────────

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    existing = db.exec(select(User).where(User.email == body.email)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # Validate password strength
    RegisterRequest.validate_password_strength(body.password)

    user = User(
        email=body.email,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token_record(db, user.id)
    set_auth_cookies(response, access_token, refresh_token)
    return user


# ── Login (email/password) ────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.exec(select(User).where(User.email == body.email)).first()
    if not user or not user.hashed_password or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token_record(db, user.id)
    set_auth_cookies(response, access_token, refresh_token)
    return TokenResponse()


# ── Google OAuth ──────────────────────────────────────────────────

@router.get("/google", response_model=GoogleAuthURL)
async def google_login():
    try:
        auth_url = get_google_auth_url()
        return GoogleAuthURL(auth_url=auth_url)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))


@router.get("/google/callback")
async def google_callback(code: str, response: Response, db: Session = Depends(get_db)):
    try:
        google_user = await exchange_google_code(code)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"OAuth failed: {e}")

    # Find or create user
    user = db.exec(select(User).where(User.google_id == google_user["google_id"])).first()
    if not user:
        user = db.exec(select(User).where(User.email == google_user["email"])).first()

    if user:
        # Link Google account to existing user
        if not user.google_id:
            user.google_id = google_user["google_id"]
        if not user.avatar_url:
            user.avatar_url = google_user.get("avatar_url")
        user.is_verified = google_user.get("email_verified", False)
        db.add(user)
    else:
        user = User(
            email=google_user["email"],
            full_name=google_user.get("full_name"),
            avatar_url=google_user.get("avatar_url"),
            google_id=google_user["google_id"],
            is_verified=google_user.get("email_verified", False),
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token_record(db, user.id)

    redirect = RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard", status_code=302)
    set_auth_cookies(redirect, access_token, refresh_token)
    return redirect


# ── Refresh ───────────────────────────────────────────────────────

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_token = request.cookies.get("refresh_token")
    if not raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    new_raw, user_id = rotate_refresh_token(db, raw_token, request)
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    access_token = create_access_token(user.id, user.email)
    set_auth_cookies(response, access_token, new_raw)
    return TokenResponse(message="Token refreshed")


# ── Logout ────────────────────────────────────────────────────────

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_token = request.cookies.get("refresh_token")
    if raw_token:
        revoke_refresh_token(db, raw_token)
    clear_auth_cookies(response)


# ── Me ────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserRead)
async def me(request: Request, db: Session = Depends(get_db)):
    return get_current_user(request, db)


# ── Change Password ───────────────────────────────────────────────

@router.put("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    body: ChangePasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = get_current_user(request, db)
    if not user.hashed_password:
        raise HTTPException(status_code=400, detail="Account uses Google login — no password to change")
    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    RegisterRequest.validate_password_strength(body.new_password)
    user.hashed_password = hash_password(body.new_password)
    db.add(user)
    db.commit()
