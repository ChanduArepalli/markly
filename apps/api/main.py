from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
from database import create_db_and_tables

# Import all models so SQLModel metadata is complete before create_all
import models  # noqa: F401

from routers import auth, bookmarks, tags, collections
from admin import create_admin

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Markly API",
    description="Modern bookmarking application API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# SessionMiddleware must be added BEFORE SQLAdmin is mounted
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# ── SQLAdmin ──────────────────────────────────────────────────────

create_admin(app)


# ── Routers ───────────────────────────────────────────────────────

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(bookmarks.router, prefix="/api/v1/bookmarks", tags=["bookmarks"])
app.include_router(tags.router, prefix="/api/v1/tags", tags=["tags"])
app.include_router(collections.router, prefix="/api/v1/collections", tags=["collections"])


# ── Health ────────────────────────────────────────────────────────

@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.APP_ENV}
