from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class TagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(default="#6366f1", pattern=r"^#[0-9a-fA-F]{6}$")


class TagUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")


class TagResponse(BaseModel):
    id: UUID
    name: str
    color: str
    bookmark_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
