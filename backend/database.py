from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import redis
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration with SQLite fallback for local dev without Docker
postgres_user = os.getenv('POSTGRES_USER')
postgres_password = os.getenv('POSTGRES_PASSWORD')
postgres_host = os.getenv('POSTGRES_HOST')
postgres_port = os.getenv('POSTGRES_PORT')
postgres_db = os.getenv('POSTGRES_DB')

DATABASE_URL = None

def _make_sqlite_url() -> str:
    sqlite_path = os.path.join(os.path.dirname(__file__), 'punchtracker.sqlite3')
    return f"sqlite:///{sqlite_path}"

engine = None

if all([postgres_user, postgres_password, postgres_host, postgres_port, postgres_db]):
    # Try Postgres first
    pg_url = f"postgresql://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}"
    try:
        tmp_engine = create_engine(pg_url)
        # Probe connection; if it fails, fall back to SQLite
        with tmp_engine.connect() as _:
            pass
        DATABASE_URL = pg_url
        engine = tmp_engine
    except Exception:
        # Fall back to SQLite
        DATABASE_URL = _make_sqlite_url()
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Use SQLite by default when Postgres env is incomplete
    DATABASE_URL = _make_sqlite_url()
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Redis configuration
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    password=os.getenv('REDIS_PASSWORD') or None,
    decode_responses=True
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_redis():
    return redis_client
