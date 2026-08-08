from sqlalchemy.orm import Session
from .models import User, Listing
import hashlib
import secrets
from . import auth


# -------------------------
# Password Helpers
# -------------------------

def hash_password(password: str) -> str:
    return auth.hash_password(password)


def verify_password(password: str, hashed_password: str) -> bool:
    # If the password hash looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if hashed_password and hashed_password.startswith("$2"):
        return auth.verify_password(password, hashed_password)

    # Fallback to PBKDF2 for old/existing user records
    try:
        salt, key_hex = hashed_password.split(":")

        key = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100000,
        )

        return key.hex() == key_hex

    except Exception:
        return False


# -------------------------
# USER CRUD
# -------------------------

def get_user_by_email(db: Session, email: str):
    return (
        db.query(User)
        .filter(User.email == email.lower())
        .first()
    )


def create_user(
    db: Session,
    email: str,
    name: str,
    password: str,
):
    existing = get_user_by_email(db, email)

    if existing:
        raise ValueError("User with this email already exists")

    user = User(
        email=email.lower(),
        name=name,
        hashed_password=hash_password(password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# -------------------------
# LISTING CRUD
# -------------------------

def create_listing(
    db: Session,
    user_id: int,
    listing_data: dict,
):
    listing = Listing(
        user_id=user_id,
        product_name=listing_data.get("productName"),
        brand_name=listing_data.get("brandName"),
        ingredients=listing_data.get("ingredients"),
        tone=listing_data.get("tone"),
        platform=listing_data.get("platform"),
        title=listing_data.get("title"),
        description=listing_data.get("description"),
        bullets="\n".join(listing_data.get("bullets", [])),
        keywords=listing_data.get("keywords"),
    )

    db.add(listing)
    db.commit()
    db.refresh(listing)

    return listing


def get_user_listings(
    db: Session,
    user_id: int,
):
    return (
        db.query(Listing)
        .filter(Listing.user_id == user_id)
        .order_by(Listing.created_at.desc())
        .all()
    )


def delete_listing(
    db: Session,
    listing_id: int,
    user_id: int,
):
    listing = (
        db.query(Listing)
        .filter(
            Listing.id == listing_id,
            Listing.user_id == user_id,
        )
        .first()
    )

    if not listing:
        return False

    db.delete(listing)
    db.commit()

    return True