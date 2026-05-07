import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column, DateTime, String
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from models.bookmark import Bookmark
    from models.collection import Collection
    from models.refresh_token import RefreshToken
    from models.tag import Tag


# ── Shared fields ─────────────────────────────────────────────────

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True, max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)
    avatar_url: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)


# ── Table model ───────────────────────────────────────────────────

class User(UserBase, table=True):
    __tablename__ = "users"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    hashed_password: Optional[str] = Field(default=None, max_length=255)
    google_id: Optional[str] = Field(default=None, unique=True, index=True, max_length=255)

    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)),
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            default=lambda: datetime.now(timezone.utc),
            onupdate=lambda: datetime.now(timezone.utc),
        ),
    )

    # Relationships
    bookmarks: List["Bookmark"] = Relationship(back_populates="user")
    tags: List["Tag"] = Relationship(back_populates="user")
    collections: List["Collection"] = Relationship(back_populates="user")
    refresh_tokens: List["RefreshToken"] = Relationship(back_populates="user")


# ── API schemas (no table=True) ───────────────────────────────────

class UserRead(UserBase):
    id: uuid.UUID
    google_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # type: ignore[assignment]


class UserUpdate(SQLModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
