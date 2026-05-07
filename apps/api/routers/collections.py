from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from database import get_db
from models.collection import Collection, CollectionCreate, CollectionUpdate, CollectionRead
from services.auth import get_current_user

router = APIRouter()


@router.get("", response_model=list[CollectionRead])
async def list_collections(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    cols = db.exec(select(Collection).where(Collection.user_id == user.id)).all()
    return [
        CollectionRead(
            id=c.id, name=c.name, description=c.description, icon=c.icon,
            color=c.color, is_public=c.is_public,
            bookmark_count=len(c.bookmarks),
            created_at=c.created_at, updated_at=c.updated_at,
        )
        for c in cols
    ]


@router.post("", response_model=CollectionRead, status_code=status.HTTP_201_CREATED)
async def create_collection(body: CollectionCreate, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    col = Collection(user_id=user.id, **body.model_dump())
    db.add(col)
    db.commit()
    db.refresh(col)
    return CollectionRead(
        id=col.id, name=col.name, description=col.description, icon=col.icon,
        color=col.color, is_public=col.is_public, bookmark_count=0,
        created_at=col.created_at, updated_at=col.updated_at,
    )


@router.get("/{collection_id}", response_model=CollectionRead)
async def get_collection(collection_id: UUID, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    col = db.exec(select(Collection).where(Collection.id == collection_id, Collection.user_id == user.id)).first()
    if not col:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    return CollectionRead(
        id=col.id, name=col.name, description=col.description, icon=col.icon,
        color=col.color, is_public=col.is_public, bookmark_count=len(col.bookmarks),
        created_at=col.created_at, updated_at=col.updated_at,
    )


@router.patch("/{collection_id}", response_model=CollectionRead)
async def update_collection(collection_id: UUID, body: CollectionUpdate, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    col = db.exec(select(Collection).where(Collection.id == collection_id, Collection.user_id == user.id)).first()
    if not col:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(col, k, v)
    db.add(col)
    db.commit()
    db.refresh(col)
    return CollectionRead(
        id=col.id, name=col.name, description=col.description, icon=col.icon,
        color=col.color, is_public=col.is_public, bookmark_count=len(col.bookmarks),
        created_at=col.created_at, updated_at=col.updated_at,
    )


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(collection_id: UUID, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    col = db.exec(select(Collection).where(Collection.id == collection_id, Collection.user_id == user.id)).first()
    if not col:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    db.delete(col)
    db.commit()
