import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from models.bookmark import Bookmark
    from models.tag import Tag


# ── Link table (many-to-many) ─────────────────────────────────────

class BookmarkTag(SQLModel, table=True):
    __tablename__ = "bookmark_tags"

    bookmark_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(
            PGUUID(as_uuid=True),
            ForeignKey("bookmarks.id", ondelete="CASCADE"),
            primary_key=True,
        ),
    )
    tag_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(
            PGUUID(as_uuid=True),
            ForeignKey("tags.id", ondelete="CASCADE"),
            primary_key=True,
        ),
    )
