from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from database import get_db
from models.tag import Tag, TagCreate, TagUpdate, TagRead
from services.auth import get_current_user

router = APIRouter()


@router.get("", response_model=list[TagRead])
async def list_tags(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    tags = db.exec(select(Tag).where(Tag.user_id == user.id)).all()
    return [TagRead(id=t.id, name=t.name, color=t.color, bookmark_count=len(t.bookmarks), created_at=t.created_at) for t in tags]


@router.post("", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def create_tag(body: TagCreate, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    existing = db.exec(select(Tag).where(Tag.user_id == user.id, Tag.name == body.name)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tag with this name already exists")
    tag = Tag(user_id=user.id, name=body.name, color=body.color)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return TagRead(id=tag.id, name=tag.name, color=tag.color, bookmark_count=0, created_at=tag.created_at)


@router.patch("/{tag_id}", response_model=TagRead)
async def update_tag(tag_id: UUID, body: TagUpdate, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    tag = db.exec(select(Tag).where(Tag.id == tag_id, Tag.user_id == user.id)).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(tag, k, v)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return TagRead(id=tag.id, name=tag.name, color=tag.color, bookmark_count=len(tag.bookmarks), created_at=tag.created_at)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(tag_id: UUID, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    tag = db.exec(select(Tag).where(Tag.id == tag_id, Tag.user_id == user.id)).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    db.delete(tag)
    db.commit()
