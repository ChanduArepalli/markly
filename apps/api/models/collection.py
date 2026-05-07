import re
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from pydantic import field_validator
from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from models.bookmark import Bookmark
    from models.user import User


# ── Shared fields ─────────────────────────────────────────────────

class CollectionBase(SQLModel):
    name: str = Field(max_length=255)
    description: Optional[str] = Field(default=None)
    icon: str = Field(default="📁", max_length=10)
    color: str = Field(default="#14b8a6", max_length=7)
    is_public: bool = Field(default=False)


# ── Table model ───────────────────────────────────────────────────

class Collection(CollectionBase, table=True):
    __tablename__ = "collections"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
    )
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
    user: Optional["User"] = Relationship(back_populates="collections")
    bookmarks: List["Bookmark"] = Relationship(back_populates="collection")


# ── API schemas ───────────────────────────────────────────────────

def _validate_hex_color(v: str) -> str:
    if not re.match(r"^#[0-9a-fA-F]{6}$", v):
        raise ValueError("Color must be a valid 6-digit hex (e.g. #6366f1)")
    return v


class CollectionCreate(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    icon: str = Field(default="📁", max_length=10)
    color: str = Field(default="#6366f1")
    is_public: bool = False

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str) -> str:
        return _validate_hex_color(v)


class CollectionUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    icon: Optional[str] = Field(default=None, max_length=10)
    color: Optional[str] = Field(default=None)
    is_public: Optional[bool] = None

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return _validate_hex_color(v)
        return v


class CollectionRead(CollectionBase):
    id: uuid.UUID
    bookmark_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # type: ignore[assignment]
