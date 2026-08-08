from .database import engine, get_db
from .models import Base

Base.metadata.create_all(bind=engine)

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
import os
import httpx
from dotenv import load_dotenv

from . import models, schemas, crud, auth

load_dotenv()

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Setup CORS origins: allow FRONTEND_URL, dev fallbacks, and any origins in CORS_ORIGINS
cors_origins_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"]
if cors_origins_env:
    extra_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
    allowed_origins.extend(extra_origins)
# Remove duplicates while preserving order
allowed_origins = list(dict.fromkeys(allowed_origins))

GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_URL  = "https://www.googleapis.com/oauth2/v3/userinfo"
REDIRECT_URI     = f"{FRONTEND_URL.rstrip('/')}/api/auth/google/callback"

# ---------------------------------------------------------------------------
app = FastAPI(title="FoodDescAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    token = credentials.credentials
    payload = auth.verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid token payload")
    user = crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User not found")
    return user


# ---------------------------------------------------------------------------
# Content generation (unchanged logic, just extracted cleanly)
# ---------------------------------------------------------------------------

def generate_listing_content(
    product_name: str,
    brand_name: str,
    ingredients: str,
    tone: str,
    platform: str,
) -> dict:
    brand    = brand_name.strip() if brand_name and brand_name.strip() else "Premium"
    prod     = product_name.strip()
    ing_list = [i.strip() for i in ingredients.split(",") if i.strip()]
    main_ing = ing_list[0] if ing_list else "Natural ingredients"

    if tone == "traditional":
        title = (
            f"{brand} Traditional {prod} - Authentic Stone-Ground Recipe"
            f" | Made with {main_ing}"
        )
        description = (
            f"Bring home the authentic taste of heritage with {brand}'s traditional {prod}. "
            f"Prepared using time-honored recipes passed down through generations, this blend "
            f"is handcrafted with pride. Every batch highlights the deep-rooted richness of "
            f"{main_ing} and traditional spices, stone-ground to preserve natural oils and "
            f"nutritional wholesomeness. Enjoy a nostalgic culinary journey with zero artificial "
            f"colors or preservatives."
        )
        bullets = [
            f"AUTHENTIC RECIPE: Prepared using time-tested methods passed down through generations for a nostalgic home-style taste.",
            f"STONE-GROUND PROCESS: Carefully ground on traditional stone mills to retain natural nutrients, delicate aromas, and rich textures.",
            f"100% PURE & NATURAL: Made strictly with authentic ingredients, including {main_ing}, with absolutely no artificial flavors or preservatives.",
            f"HANDCRAFTED IN BATCHES: Produced in small, supervised batches to guarantee premium quality, safety, and authentic culinary integrity.",
            f"VERSATILE USE: Ideal for daily meals, traditional Indian recipes, and festive dishes. Elevate your culinary creation instantly.",
        ]
        keywords = ["traditional recipe", "authentic taste", "stone ground", "handmade pickle", "heritage spices", "natural food", "desi flavour"]

    elif tone == "health":
        title = (
            f"{brand} Organic {prod} - Clean Label & Rich in Nutrients"
            f" | Made with {main_ing}"
        )
        description = (
            f"Fuel your active lifestyle with {brand}'s nutrient-rich {prod}. Specially curated "
            f"for wellness enthusiasts, this clean-label product harnesses the benefits of "
            f"{main_ing} to support immune health and digestion. 100% organic, gluten-free, and "
            f"guilt-free — packed with dietary fiber and antioxidants. No added refined sugar, "
            f"synthetic chemicals, or fillers."
        )
        bullets = [
            f"CLEAN LABEL NUTRITION: Transparent formulation highlighting organic {main_ing} — no hidden additives, synthetic chemicals, or fillers.",
            f"IMMUNITY & WELLNESS: Naturally rich in vitamins, essential antioxidants, and fiber to boost digestion and daily energy levels.",
            f"ORGANIC CERTIFIED: Hand-harvested from certified organic fields to ensure pesticide-free, pure, clean nutritional profiles.",
            f"ZERO REFINED SUGAR: Guilt-free formulation sweetened naturally — perfect for diabetic-friendly or low-carb diets.",
            f"VEGAN & GLUTEN-FREE: Fits seamlessly into vegan, vegetarian, and gluten-sensitive diet plans for holistic wellness.",
        ]
        keywords = ["organic superfood", "clean label", "health supplement", "gluten free snack", "rich in antioxidants", "sugar free", "natural immunity"]

    else:  # premium
        title = (
            f"{brand} Artisanal {prod} - Gourmet Selection"
            f" | Infused with {main_ing}"
        )
        description = (
            f"Indulge in a sophisticated culinary experience with {brand}'s artisanal {prod}. "
            f"Exquisitely crafted for food connoisseurs, this gourmet selection features an "
            f"aromatic infusion of wild {main_ing} and rare spices. Carefully sourced from "
            f"pristine farms, every ingredient undergoes rigorous taste evaluations to deliver "
            f"a luxurious texture and multi-layered flavour profile. Perfect for gifting or "
            f"gourmet dining."
        )
        bullets = [
            f"ARTISANAL CRAFTSMANSHIP: Exquisitely blended by expert chefs to create a multi-layered gourmet flavor that delights the palate.",
            f"HAND-SELECTED INGREDIENTS: Features handpicked wild {main_ing} sourced from premium high-altitude farms for unrivaled quality.",
            f"GOURMET PAIRING: Designed to elevate fine-dining creations, cheese platters, charcuterie boards, or custom dips and spreads.",
            f"LUXURIOUS PACKAGING: Housed in an elegant, air-tight glass jar, preserving freshness and making it a perfect gourmet gift.",
            f"PRESERVATIVE FREE: Made without chemical stabilizers or colorants, ensuring only pristine, rich culinary flavors reach you.",
        ]
        keywords = ["gourmet food", "artisanal recipe", "luxury gift jar", "premium food products", "fine dining ingredients", "connoisseur selection"]

    # Platform adjustments
    if platform == "amazon":
        title = f"{title} (Pack of 1)"
    elif platform == "flipkart":
        title = f"{brand} {prod} ({main_ing} Blend)"
        import re
        bullets = [re.sub(r"^[A-Z &]+:", "•", b) for b in bullets]
    elif platform == "shopify":
        title = f"{prod} by {brand}"
        description = f"{description} Available exclusively on our online store. Buy fresh, buy direct."

    return {
        "title": title,
        "description": description,
        "bullets": bullets,
        "keywords": ", ".join(keywords),
    }


# ===========================================================================
# ROUTES
# ===========================================================================

# ---------------------------------------------------------------------------
# Auth – Email/Password
# ---------------------------------------------------------------------------

@app.post(
    "/api/auth/signup",
    response_model=schemas.TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(req: schemas.SignupRequest, db: Session = Depends(get_db)):
    try:
        user  = crud.create_user(db, req.email, req.name, req.password)
        token = auth.create_access_token(data={"sub": user.email})
        return {"access_token": token, "token_type": "bearer", "user": user}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )


@app.post(
    "/api/auth/register",
    response_model=schemas.TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(req: schemas.RegisterRequest, db: Session = Depends(get_db)):
    try:
        name  = req.name or req.email.split("@")[0]
        user  = crud.create_user(db, req.email, name, req.password)
        token = auth.create_access_token(data={"sub": user.email})
        return {"access_token": token, "token_type": "bearer", "user": user}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, req.email)
    if not user or not crud.verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ---------------------------------------------------------------------------
# Auth – Google OAuth 2.0
# ---------------------------------------------------------------------------

@app.get("/api/auth/google")
def google_login():
    """Redirect user's browser to Google's consent screen or mock login in dev environment."""
    if not GOOGLE_CLIENT_ID or GOOGLE_CLIENT_ID.startswith("your-google-client-id"):
        # Developer Mock Mode!
        mock_callback_url = f"/api/auth/google/callback?code=mock_code"
        return RedirectResponse(url=mock_callback_url)

    params = (
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
        f"&access_type=offline"
        f"&prompt=select_account"
    )
    return RedirectResponse(url=GOOGLE_AUTH_URL + params)


@app.get("/api/auth/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """
    Exchange authorization code for tokens, fetch user info,
    create/find the user in DB, return our own JWT.
    """
    if code == "mock_code":
        # Mock Google User
        email = "mock.user@gmail.com"
        name = "Mock Google User"
    else:
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET or GOOGLE_CLIENT_ID.startswith("your-google-client-id"):
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Google OAuth is not configured on this server.",
            )

        async with httpx.AsyncClient() as client:
            # 1. Exchange code for access token
            token_resp = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code":          code,
                    "client_id":     GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri":  REDIRECT_URI,
                    "grant_type":    "authorization_code",
                },
            )
            if token_resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to exchange Google authorization code.",
                )
            token_data = token_resp.json()

            # 2. Fetch user profile
            user_resp = await client.get(
                GOOGLE_USER_URL,
                headers={"Authorization": f"Bearer {token_data['access_token']}"},
            )
            if user_resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to fetch Google user info.",
                )
            google_user = user_resp.json()

        email = google_user.get("email", "").lower()
        name  = google_user.get("name") or email.split("@")[0]

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account did not return an email address.",
            )

    # 3. Upsert user (create if not exists, find if exists)
    user = crud.get_user_by_email(db, email)
    if not user:
        import secrets
        # Random secure password — user will never need it (Google auth only)
        random_pw = secrets.token_urlsafe(32)
        user = crud.create_user(db, email, name, random_pw)

    jwt_token = auth.create_access_token(data={"sub": user.email})
    # Redirect browser back to the React app with the token in the URL
    redirect_url = f"{FRONTEND_URL}/?token={jwt_token}"
    return RedirectResponse(url=redirect_url, status_code=302)


# ---------------------------------------------------------------------------
# Generate listing
# ---------------------------------------------------------------------------

@app.post("/api/generate", response_model=schemas.GenerateResponse)
def generate(req: schemas.GenerateRequest):
    if not req.productName.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Product name cannot be empty",
        )
    if not req.ingredients.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Ingredients cannot be empty",
        )
    result = generate_listing_content(
        product_name=req.productName,
        brand_name=req.brandName or "",
        ingredients=req.ingredients,
        tone=req.tone or "premium",
        platform=req.platform or "general",
    )
    return result


@app.post("/api/ai/generate", response_model=schemas.GenerateResponse)
async def generate_ai(req: schemas.GenerateRequest):
    if not req.productName.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Product name cannot be empty",
        )
    if not req.ingredients.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Ingredients cannot be empty",
        )
    from .ai import generate_listing_ai

    try:
        result = await generate_listing_ai(
            product_name=req.productName,
            brand_name=req.brandName or "",
            ingredients=req.ingredients,
            tone=req.tone or "premium",
            platform=req.platform or "general",
        )
        return result
    except HTTPException as exc:
        # If Gemini is unavailable or returns an error, fall back to the local template generator.
        if exc.status_code in {
            status.HTTP_429_TOO_MANY_REQUESTS,
            status.HTTP_502_BAD_GATEWAY,
            status.HTTP_504_GATEWAY_TIMEOUT,
        } or "gemini" in str(exc.detail).lower() or "high demand" in str(exc.detail).lower():
            return generate_listing_content(
                product_name=req.productName,
                brand_name=req.brandName or "",
                ingredients=req.ingredients,
                tone=req.tone or "premium",
                platform=req.platform or "general",
            )
        raise


@app.get("/api/ai/config")
def ai_config():
    """Return whether Gemini API key is configured on the server.

    This endpoint is safe to call from the frontend and does not attempt
    to contact any external AI provider.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    configured = bool(gemini_key and not gemini_key.strip().startswith("your_") and gemini_key.strip() != "")
    if configured:
        return {"configured": True}
    return {
        "configured": False,
        "detail": "Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your .env file."
    }



# ---------------------------------------------------------------------------
# Listings CRUD (protected)
# ---------------------------------------------------------------------------

@app.post(
    "/api/listings",
    response_model=schemas.ListingResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_listing(
    req: schemas.ListingSaveRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = crud.create_listing(db, current_user.id, req.model_dump())
    return schemas.ListingResponse(
        id=listing.id,
        product_name=listing.product_name or "",
        brand_name=listing.brand_name or "",
        ingredients=listing.ingredients or "",
        tone=listing.tone or "",
        platform=listing.platform or "",
        title=listing.title or "",
        description=listing.description or "",
        bullets=listing.bullets.split("\n") if listing.bullets else [],
        keywords=listing.keywords or "",
        created_at=listing.created_at,
    )


@app.get("/api/listings", response_model=List[schemas.ListingResponse])
def get_listings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listings = crud.get_user_listings(db, current_user.id)
    return [
        schemas.ListingResponse(
            id=l.id,
            product_name=l.product_name or "",
            brand_name=l.brand_name or "",
            ingredients=l.ingredients or "",
            tone=l.tone or "",
            platform=l.platform or "",
            title=l.title or "",
            description=l.description or "",
            bullets=l.bullets.split("\n") if l.bullets else [],
            keywords=l.keywords or "",
            created_at=l.created_at,
        )
        for l in listings
    ]


@app.delete("/api/listings/{listing_id}")
def delete_listing(
    listing_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    success = crud.delete_listing(db, listing_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found or you do not have permission to delete it",
        )
    return {"detail": "Listing deleted successfully"}
