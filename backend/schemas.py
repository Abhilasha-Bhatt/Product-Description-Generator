from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# ==========================
# Authentication Schemas
# ==========================

class SignupRequest(BaseModel):
    email: EmailStr
    name: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ==========================
# Generator Schemas
# ==========================

class GenerateRequest(BaseModel):
    productName: str
    brandName: Optional[str] = ""
    ingredients: str
    tone: Optional[str] = "premium"
    platform: Optional[str] = "general"


class GenerateResponse(BaseModel):
    title: str
    description: str
    bullets: List[str]
    keywords: str


# ==========================
# Listing Schemas
# ==========================

class ListingSaveRequest(BaseModel):
    productName: str
    brandName: Optional[str] = ""
    ingredients: str
    tone: str
    platform: str
    title: str
    description: str
    bullets: List[str]
    keywords: str


class ListingResponse(BaseModel):
    id: int
    product_name: str
    brand_name: str
    ingredients: str
    tone: str
    platform: str
    title: str
    description: str
    bullets: List[str]
    keywords: str
    created_at: datetime

    class Config:
        from_attributes = True