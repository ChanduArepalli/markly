import asyncio
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from sqlmodel import Session, select, func, col

from database import get_db
from models.bookmark import Bookmark, BookmarkCreate, BookmarkUpdate, BookmarkRead, BookmarkListResponse
from models.tag import Tag
from models.links import BookmarkTag
from services.auth import get_current_user
from services.metadata import fetch_url_metadata

router = APIRouter()


def _get_bookmark_or_404(db: Session, bookmark_id: UUID, user_id: UUID) -> Bookmark:
    bm = db.exec(
        select(Bookmark).where(Bookmark.id == bookmark_id, Bookmark.user_id == user_id)
    ).first()
    if not bm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found")
    return bm


async def _enrich_bookmark(db: Session, bookmark: Bookmark) -> None:
    """Background task: fetch and persist URL metadata."""
    meta = await fetch_url_metadata(str(bookmark.url))
    if not bookmark.title:
        bookmark.title = meta.get("title")
    if not bookmark.description:
        bookmark.description = meta.get("description")
    bookmark.favicon_url = meta.get("favicon_url")
    bookmark.og_image_url = meta.get("og_image_url")
    if not bookmark.domain:
        bookmark.domain = meta.get("domain")
    db.add(bookmark)
    db.commit()


# ── List bookmarks ────────────────────────────────────────────────

@router.get("", response_model=BookmarkListResponse)
async def list_bookmarks(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    collection_id: Optional[UUID] = None,
    tag: Optional[str] = None,
    is_read: Optional[bool] = None,
    is_pinned: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    user = get_current_user(request, db)
    query = select(Bookmark).where(Bookmark.user_id == user.id)

    if collection_id:
        query = query.where(Bookmark.collection_id == collection_id)
    if is_read is not None:
        query = query.where(Bookmark.is_read == is_read)
    if is_pinned is not None:
        query = query.where(Bookmark.is_pinned == is_pinned)
    if tag:
        query = query.join(BookmarkTag).join(Tag).where(Tag.name == tag)

    total = len(db.exec(query).all())
    bookmarks = db.exec(query.order_by(col(Bookmark.created_at).desc()).offset((page - 1) * limit).limit(limit)).all()

    return BookmarkListResponse(
        data=[BookmarkRead.model_validate(bm) for bm in bookmarks],
        total=total, page=page, limit=limit,
    )


# ── Search ────────────────────────────────────────────────────────

@router.get("/search", response_model=BookmarkListResponse)
async def search_bookmarks(
    request: Request,
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    collection_id: Optional[UUID] = None,
    tag: Optional[str] = None,
    is_pinned: Optional[bool] = None,
    is_read: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    user = get_current_user(request, db)
    pattern = f"%{q}%"
    query = select(Bookmark).where(
        Bookmark.user_id == user.id,
        (col(Bookmark.title).ilike(pattern) | col(Bookmark.url).ilike(pattern) | col(Bookmark.description).ilike(pattern))
    )
    if collection_id:
        query = query.where(Bookmark.collection_id == collection_id)
    if tag:
        query = query.join(BookmarkTag).join(Tag).where(Tag.name == tag)
    if is_pinned is not None:
        query = query.where(Bookmark.is_pinned == is_pinned)
    if is_read is not None:
        query = query.where(Bookmark.is_read == is_read)
    total = len(db.exec(query).all())
    bookmarks = db.exec(query.offset((page - 1) * limit).limit(limit)).all()
    return BookmarkListResponse(
        data=[BookmarkRead.model_validate(bm) for bm in bookmarks],
        total=total, page=page, limit=limit,
    )


# ── Create ────────────────────────────────────────────────────────

@router.post("", response_model=BookmarkRead, status_code=status.HTTP_201_CREATED)
async def create_bookmark(
    body: BookmarkCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = get_current_user(request, db)
    bookmark = Bookmark(
        user_id=user.id,
        url=body.url,
        title=body.title,
        description=body.description,
        collection_id=body.collection_id,
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)

    # Assign tags
    if body.tag_ids:
        tags = db.exec(select(Tag).where(Tag.id.in_(body.tag_ids), Tag.user_id == user.id)).all()
        bookmark.tags = list(tags)
        db.add(bookmark)
        db.commit()
        db.refresh(bookmark)

    # Async metadata enrichment in background
    background_tasks.add_task(_enrich_bookmark, db, bookmark)

    return BookmarkRead.model_validate(bookmark)


# ── Get single ───────────────────────────────────────────────────

@router.get("/{bookmark_id}", response_model=BookmarkRead)
async def get_bookmark(bookmark_id: UUID, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    return BookmarkRead.model_validate(_get_bookmark_or_404(db, bookmark_id, user.id))


# ── Update ────────────────────────────────────────────────────────

@router.patch("/{bookmark_id}", response_model=BookmarkRead)
async def update_bookmark(
    bookmark_id: UUID,
    body: BookmarkUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    user = get_current_user(request, db)
    bookmark = _get_bookmark_or_404(db, bookmark_id, user.id)

    update_data = body.model_dump(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)

    for k, v in update_data.items():
        setattr(bookmark, k, v)

    if tag_ids is not None:
        tags = db.exec(select(Tag).where(Tag.id.in_(tag_ids), Tag.user_id == user.id)).all()
        bookmark.tags = list(tags)

    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return BookmarkRead.model_validate(bookmark)


# ── Delete ────────────────────────────────────────────────────────

@router.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(bookmark_id: UUID, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    bookmark = _get_bookmark_or_404(db, bookmark_id, user.id)
    db.delete(bookmark)
    db.commit()
