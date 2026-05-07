from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
from config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,
)


def create_db_and_tables() -> None:
    """Create all tables defined by SQLModel metadata."""
    SQLModel.metadata.create_all(engine)


def get_db() -> Generator:
    """FastAPI dependency — yields a SQLModel Session per request."""
    with Session(engine) as session:
        yield session
