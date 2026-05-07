from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class TagInBookmark(BaseModel):
    id: UUID
    name: str
    color: str
    model_config = {"from_attributes": True}


class BookmarkCreate(BaseModel):
    url: str = Field(..., max_length=2048)
    title: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    collection_id: Optional[UUID] = None
    tag_ids: List[UUID] = []


class BookmarkUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    collection_id: Optional[UUID] = None
    tag_ids: Optional[List[UUID]] = None
    is_read: Optional[bool] = None
    is_pinned: Optional[bool] = None


class BookmarkResponse(BaseModel):
    id: UUID
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    favicon_url: Optional[str] = None
    og_image_url: Optional[str] = None
    domain: Optional[str] = None
    is_read: bool
    is_pinned: bool
    collection_id: Optional[UUID] = None
    tags: List[TagInBookmark] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BookmarkListResponse(BaseModel):
    data: List[BookmarkResponse]
    total: int
    page: int
    limit: int
