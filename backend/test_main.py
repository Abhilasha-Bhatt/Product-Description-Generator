import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

from backend.database import Base, get_db
from backend.main import app

from sqlalchemy.pool import StaticPool

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Set up test database tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    # Recreate tables before each test to ensure a clean state
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

client = TestClient(app)

def test_signup_success():
    payload = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "password123"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["name"] == "Test User"

def test_signup_duplicate_email():
    payload = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "password123"
    }
    client.post("/api/auth/signup", json=payload)
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "User with this email already exists"

def test_register_success():
    payload = {
        "email": "register@example.com",
        "password": "password123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "register@example.com"
    assert data["user"]["name"] == "register"

def test_register_duplicate_email():
    payload = {
        "email": "register@example.com",
        "password": "password123"
    }
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "User with this email already exists"

def test_login_success():
    signup_payload = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "password123"
    }
    client.post("/api/auth/signup", json=signup_payload)
    
    login_payload = {
        "email": "test@example.com",
        "password": "password123"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"

def test_login_invalid_credentials():
    login_payload = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"

def test_get_me_success():
    signup_payload = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "password123"
    }
    signup_res = client.post("/api/auth/signup", json=signup_payload).json()
    token = signup_res["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"

def test_get_me_unauthorized():
    headers = {"Authorization": "Bearer invalidtoken"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401

def test_generate_success():
    payload = {
        "productName": "Honey Mustard",
        "brandName": "BeeKind",
        "ingredients": "Organic honey, whole mustard seeds, apple cider vinegar",
        "tone": "health",
        "platform": "amazon"
    }
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "description" in data
    assert "bullets" in data
    assert "keywords" in data
    assert "Organic Honey" in data["title"] or "Organic honey" in data["title"]
    assert "BeeKind" in data["title"]

def test_generate_validation_error():
    payload = {
        "productName": "",
        "ingredients": "honey"
    }
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 422

from unittest.mock import patch, AsyncMock

@patch("ai.generate_listing_ai", new_callable=AsyncMock)
def test_generate_ai_success(mock_gen):
    mock_gen.return_value = {
        "title": "Mock Title",
        "description": "Mock Description",
        "bullets": ["Bullet 1", "Bullet 2"],
        "keywords": "mock, keywords"
    }
    payload = {
        "productName": "Honey Mustard",
        "brandName": "BeeKind",
        "ingredients": "Organic honey, whole mustard seeds, apple cider vinegar",
        "tone": "health",
        "platform": "amazon"
    }
    response = client.post("/api/ai/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Mock Title"
    assert data["description"] == "Mock Description"
    mock_gen.assert_called_once()

def test_generate_ai_validation_error():
    payload = {
        "productName": "",
        "ingredients": "honey"
    }
    response = client.post("/api/ai/generate", json=payload)
    assert response.status_code == 422

def test_listings_crud():
    signup_payload = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "password123"
    }
    signup_res = client.post("/api/auth/signup", json=signup_payload).json()
    token = signup_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    listing_payload = {
        "productName": "Saffron Honey",
        "brandName": "Royal",
        "ingredients": "Kashmiri saffron, raw honey",
        "tone": "premium",
        "platform": "shopify",
        "title": "Royal Artisanal Saffron Honey - Gourmet Selection",
        "description": "Indulge in gourmet saffron honey...",
        "bullets": ["Premium Kashmiri Saffron", "100% Pure Honey"],
        "keywords": "saffron honey, premium honey"
    }
    save_response = client.post("/api/listings", json=listing_payload, headers=headers)
    assert save_response.status_code == 201
    saved_data = save_response.json()
    assert "id" in saved_data
    assert saved_data["product_name"] == "Saffron Honey"
    listing_id = saved_data["id"]
    
    get_response = client.get("/api/listings", headers=headers)
    assert get_response.status_code == 200
    listings_list = get_response.json()
    assert len(listings_list) == 1
    assert listings_list[0]["id"] == listing_id
    
    delete_response = client.delete(f"/api/listings/{listing_id}", headers=headers)
    assert delete_response.status_code == 200
    assert delete_response.json()["detail"] == "Listing deleted successfully"
    
    get_response2 = client.get("/api/listings", headers=headers)
    assert len(get_response2.json()) == 0
