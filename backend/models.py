from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(200), unique=True, nullable=False, index=True)

    hashed_password = Column(String(255), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship(
        "Listing",
        back_populates="user",
        cascade="all, delete"
    )


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    product_name = Column(String(255))

    brand_name = Column(String(255))

    ingredients = Column(Text)

    tone = Column(String(50))

    platform = Column(String(100))

    title = Column(String(255))

    description = Column(Text)

    bullets = Column(Text)

    keywords = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship(
        "User",
        back_populates="listings"
    )