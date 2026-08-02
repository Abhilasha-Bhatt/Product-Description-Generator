from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv
import os
import sys

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fooddescai.db")

# Attempt to connect to the database and fall back to SQLite if it fails
try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            echo=True
        )
    else:
        engine = create_engine(DATABASE_URL, echo=True)
    
    # Verify connectivity
    with engine.connect() as conn:
        pass
except (OperationalError, Exception) as e:
    print(f"Database connection failed with URL: {DATABASE_URL}. Error: {e}", file=sys.stderr)
    print("Falling back to local SQLite database (sqlite:///./fooddescai.db)...", file=sys.stderr)
    DATABASE_URL = "sqlite:///./fooddescai.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=True
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()