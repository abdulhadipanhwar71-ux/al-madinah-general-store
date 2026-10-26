from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.engine import Engine
from typing import Generator
import logging
from backend.app.config import settings

logger = logging.getLogger("dukaanos.database")

# Configure engine arguments based on dialect
engine_kwargs = {
    "pool_pre_ping": True,
}

if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # MySQL / PostgreSQL connection pooling
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20
    engine_kwargs["pool_recycle"] = 3600

# Normalize postgres:// to postgresql:// for SQLAlchemy 1.4+ compatibility
effective_db_url = settings.DATABASE_URL
if effective_db_url.startswith("postgres://"):
    effective_db_url = effective_db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(effective_db_url, **engine_kwargs)

# Enable foreign keys for SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if settings.DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session per request
    and automatically rolls back on unhandled exceptions.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        logger.error(f"Database session rollback due to exception: {e}")
        raise
    finally:
        db.close()
