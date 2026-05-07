from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class CollectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    icon: str = Field(default="📁", max_length=10)
    color: str = Field(default="#6366f1", pattern=r"^#[0-9a-fA-F]{6}$")
    is_public: bool = False


class CollectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=10)
    color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    is_public: Optional[bool] = None


class CollectionResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    icon: str
    color: str
    is_public: bool
    bookmark_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
