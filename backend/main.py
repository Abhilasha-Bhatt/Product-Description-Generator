from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from backend.database import JSONDatabase
import base64
import hmac
import hashlib
import json
from datetime import datetime, timedelta

app = FastAPI(title="FoodDescAI API")

# Configure CORS to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = JSONDatabase()
security = HTTPBearer()

SECRET_KEY = "fooddesc_secret_key_change_me_in_production"

# Pure Python JWT implementation
def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode = data.copy()
    to_encode.update({"exp": expire.isoformat()})
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_access_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts
        
        # Verify signature
        expected_sig = hmac.new(
            SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
        
        if not hmac.compare_digest(signature_b64, expected_sig_b64):
            return None
            
        # Decode payload
        rem = len(payload_b64) % 4
        if rem > 0:
            payload_b64 += "=" * (4 - rem)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode()).decode())
        
        # Check expiration
        exp_str = payload.get("exp")
        if not exp_str:
            return None
        exp = datetime.fromisoformat(exp_str)
        if datetime.utcnow() > exp:
            return None
            
        return payload
    except Exception:
        return None

# Dependency to get current user from token
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Pydantic Schemas
class SignupRequest(BaseModel):
    email: EmailStr
    name: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GenerateRequest(BaseModel):
    productName: str
    brandName: Optional[str] = ""
    ingredients: str
    tone: Optional[str] = "premium"
    platform: Optional[str] = "general"

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

# Mock AI Listing Generator (Ported to Backend)
def generate_listing_content(product_name: str, brand_name: str, ingredients: str, tone: str, platform: str):
    brand = brand_name.strip() if brand_name and brand_name.strip() else "Premium"
    prod = product_name.strip()
    ing_list = [i.strip() for i in ingredients.split(",") if i.strip()]
    main_ing = ing_list[0] if ing_list else "Natural ingredients"

    title = ""
    description = ""
    bullets = []
    keywords = []

    # Tone additions
    if tone == "traditional":
        title = f"{brand} Traditional {prod} - Authentic Stone-Ground Recipe | Made with {main_ing}"
        description = f"Bring home the authentic taste of heritage with {brand}'s traditional {prod}. Prepared using time-honored recipes passed down through generations, this blend is handcrafted with pride. Every batch highlights the deep-rooted richness of {main_ing} and traditional spices, stone-ground to preserve natural oils and nutritional wholesomeness. Enjoy a nostalgic culinary journey with zero artificial colors or preservatives."
        bullets = [
            f"AUTHENTIC RECIPE: Prepared using time-tested methods passed down through generations for a nostalgic home-style taste.",
            f"STONE-GROUND PROCESS: Carefully ground on traditional stone mills to retain natural nutrients, delicate aromas, and rich textures.",
            f"100% PURE & NATURAL: Made strictly with authentic ingredients, including {main_ing}, with absolutely no artificial flavors or preservatives.",
            f"HANDCRAFTED IN BATCHES: Produced in small, supervised batches to guarantee premium quality, safety, and authentic culinary integrity.",
            f"VERSATILE USE: Ideal for daily meals, traditional Indian recipes, and festive dishes. Elevate your culinary creation instantly."
        ]
        keywords = ["traditional recipe", "authentic taste", "stone ground", "handmade pickle", "heritage spices", "natural food", "desi flavour"]
    elif tone == "health":
        title = f"{brand} Organic {prod} - Clean Label & Rich in Nutrients | Made with {main_ing}"
        description = f"Fuel your active lifestyle with {brand}'s nutrient-rich {prod}. Specially curated for wellness enthusiasts, this clean-label superfood harnesses the benefits of {main_ing} to support immune health and digestion. 100% organic, gluten-free, and guilt-free, it is packed with dietary fiber and antioxidants. We commit to transparency, ensuring no added refined sugar, synthetic chemicals, or fillers are used."
        bullets = [
            f"CLEAN LABEL NUTRITION: A transparent formulation highlighting organic {main_ing} with no hidden additives, synthetic chemicals, or fillers.",
            f"IMMUNITY & WELLNESS: Naturally rich in vitamins, essential antioxidants, and fiber to boost digestion and daily energy levels.",
            f"ORGANIC CERTIFIED: Hand-harvested from certified organic fields to ensure pesticide-free, pure, and clean nutritional profiles.",
            f"ZERO REFINED SUGAR: Guilt-free formulation sweetened naturally, making it perfect for diabetic-friendly or low-carb diets.",
            f"VEGAN & GLUTEN-FREE: Fits seamlessly into vegan, vegetarian, and gluten-sensitive diet plans for holistic wellness."
        ]
        keywords = ["organic superfood", "clean label", "health supplement", "gluten free snack", "rich in antioxidants", "sugar free", "natural immunity"]
    else:
        # Premium tone
        title = f"{brand} Artisanal {prod} - Gourmet Selection | Infused with {main_ing}"
        description = f"Indulge in a sophisticated culinary experience with {brand}'s artisanal {prod}. Exquisitely crafted for food connoisseurs, this gourmet selection features an aromatic infusion of wild {main_ing} and rare spices. Carefully sourced from pristine farms, every ingredient undergoes rigorous taste evaluations to deliver a luxurious texture and multi-layered flavour profile. Perfect for gifting or gourmet dining."
        bullets = [
            f"ARTISANAL CRAFTSMANSHIP: Exquisitely blended by expert chefs to create a multi-layered gourmet flavor that delights the palate.",
            f"HAND-SELECTED INGREDIENTS: Features handpicked wild {main_ing} sourced from premium high-altitude farms for unrivaled quality.",
            f"GOURMET PAIRING: Designed to elevate fine-dining creations, cheese platters, charcuterie boards, or custom dips and spreads.",
            f"LUXURIOUS PACKAGING: Housed in an elegant, air-tight glass jar, preserving structural freshness and making it a perfect gourmet gift.",
            f"PRESERVATIVE FREE: Made without chemical stabilizers or colorants, ensuring only pristine, rich culinary flavors reach you."
        ]
        keywords = ["gourmet food", "artisanal recipe", "luxury gift jar", "premium food products", "fine dining ingredients", "connoisseur selection"]

    # Platform adjustments
    if platform == "amazon":
        title = f"{title} (Pack of 1) - Amazon E-commerce Special Edition"
    elif platform == "flipkart":
        title = f"{brand} {prod} ({main_ing} Blend) - Flipkart Choice Product"
        import re
        bullets = [re.sub(r'^[A-Z\s]+:', "•", b) for b in bullets]
    elif platform == "shopify":
        title = f"{prod} by {brand}"
        description = f"{description} Available exclusively on our Shopify online store. Buy fresh, buy direct."

    return {
        "title": title,
        "description": description,
        "bullets": bullets,
        "keywords": ", ".join(keywords)
    }

# Endpoints
@app.post("/api/auth/signup", status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest):
    try:
        user_info = db.create_user(req.email, req.name, req.password)
        token = create_access_token(data={"sub": req.email})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user_info
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = db.get_user_by_email(req.email)
    if not user or not db.verify_password(req.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(data={"sub": req.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": user["email"],
            "name": user["name"]
        }
    }

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user["email"],
        "name": current_user["name"]
    }

@app.post("/api/generate")
def generate(req: GenerateRequest):
    if not req.productName.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Product name cannot be empty"
        )
    if not req.ingredients.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Ingredients cannot be empty"
        )
    
    result = generate_listing_content(
        product_name=req.productName,
        brand_name=req.brandName,
        ingredients=req.ingredients,
        tone=req.tone,
        platform=req.platform
    )
    return result

@app.post("/api/listings", status_code=status.HTTP_201_CREATED)
def save_listing(req: ListingSaveRequest, current_user: dict = Depends(get_current_user)):
    new_listing = db.create_listing(current_user["email"], req.model_dump())
    return new_listing

@app.get("/api/listings")
def get_listings(current_user: dict = Depends(get_current_user)):
    listings = db.get_listings_by_user(current_user["email"])
    return listings

@app.delete("/api/listings/{listing_id}")
def delete_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    success = db.delete_listing(listing_id, current_user["email"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found or you do not have permission to delete it"
        )
    return {"detail": "Listing deleted successfully"}
