import re
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from pydantic import field_validator
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlmodel import Field, Relationship, SQLModel

from models.links import BookmarkTag

if TYPE_CHECKING:
    from models.bookmark import Bookmark
    from models.user import User


# ── Shared fields ─────────────────────────────────────────────────

class TagBase(SQLModel):
    name: str = Field(max_length=100)
    color: str = Field(default="#14b8a6", max_length=7)


# ── Table model ───────────────────────────────────────────────────

class Tag(TagBase, table=True):
    __tablename__ = "tags"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
    )
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)),
    )

    # Relationships
    user: Optional["User"] = Relationship(back_populates="tags")
    bookmarks: List["Bookmark"] = Relationship(back_populates="tags", link_model=BookmarkTag)


# ── API schemas ───────────────────────────────────────────────────

def _validate_hex_color(v: str) -> str:
    if not re.match(r"^#[0-9a-fA-F]{6}$", v):
        raise ValueError("Color must be a valid 6-digit hex (e.g. #6366f1)")
    return v


class TagCreate(SQLModel):
    name: str = Field(min_length=1, max_length=100)
    color: str = Field(default="#6366f1")

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str) -> str:
        return _validate_hex_color(v)


class TagUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    color: Optional[str] = Field(default=None)

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return _validate_hex_color(v)
        return v


class TagRead(TagBase):
    id: uuid.UUID
    bookmark_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}  # type: ignore[assignment]
