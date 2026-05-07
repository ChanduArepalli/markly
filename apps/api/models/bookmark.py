import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlmodel import Field, Relationship, SQLModel

from models.links import BookmarkTag

if TYPE_CHECKING:
    from models.collection import Collection
    from models.tag import Tag
    from models.user import User


# ── Shared fields ─────────────────────────────────────────────────

class BookmarkBase(SQLModel):
    url: str = Field(max_length=2048)
    title: Optional[str] = Field(default=None, max_length=500)
    description: Optional[str] = Field(default=None)
    favicon_url: Optional[str] = Field(default=None)
    og_image_url: Optional[str] = Field(default=None)
    domain: Optional[str] = Field(default=None, max_length=255, index=True)
    is_read: bool = Field(default=False)
    is_pinned: bool = Field(default=False)


# ── Table model ───────────────────────────────────────────────────

class Bookmark(BookmarkBase, table=True):
    __tablename__ = "bookmarks"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
    )
    collection_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(PGUUID(as_uuid=True), ForeignKey("collections.id", ondelete="SET NULL"), nullable=True, index=True),
    )

    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True),
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
    user: Optional["User"] = Relationship(back_populates="bookmarks")
    collection: Optional["Collection"] = Relationship(back_populates="bookmarks")
    tags: List["Tag"] = Relationship(back_populates="bookmarks", link_model=BookmarkTag)


# ── API schemas ───────────────────────────────────────────────────

class TagInBookmark(SQLModel):
    id: uuid.UUID
    name: str
    color: str
    model_config = {"from_attributes": True}  # type: ignore[assignment]


class CollectionInBookmark(SQLModel):
    id: uuid.UUID
    name: str
    color: str
    icon: str
    model_config = {"from_attributes": True}  # type: ignore[assignment]


class BookmarkCreate(SQLModel):
    url: str = Field(max_length=2048)
    title: Optional[str] = Field(default=None, max_length=500)
    description: Optional[str] = None
    collection_id: Optional[uuid.UUID] = None
    tag_ids: List[uuid.UUID] = []


class BookmarkUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=500)
    description: Optional[str] = None
    collection_id: Optional[uuid.UUID] = None
    tag_ids: Optional[List[uuid.UUID]] = None
    is_read: Optional[bool] = None
    is_pinned: Optional[bool] = None


class BookmarkRead(BookmarkBase):
    id: uuid.UUID
    user_id: uuid.UUID
    collection_id: Optional[uuid.UUID] = None
    collection: Optional[CollectionInBookmark] = None
    tags: List[TagInBookmark] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # type: ignore[assignment]


class BookmarkListResponse(SQLModel):
    data: List[BookmarkRead]
    total: int
    page: int
    limit: int
