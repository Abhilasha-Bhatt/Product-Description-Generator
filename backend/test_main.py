import pytest
from fastapi.testclient import TestClient
import os
from backend.main import app, db
from backend.database import JSONDatabase

# Use a test database to avoid messing with the production one
TEST_DB_PATH = "backend/data/test_db.json"

@pytest.fixture(autouse=True)
def setup_test_db():
    # Setup test database
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)
    
    # Overwrite the db object in main with our test database
    test_db = JSONDatabase(db_path=TEST_DB_PATH)
    app.dependency_overrides = {} # Reset overrides
    import backend.main
    backend.main.db = test_db
    
    yield
    
    # Clean up test database
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)

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
    assert saved_data["productName"] == "Saffron Honey"
    assert saved_data["user_email"] == "test@example.com"
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
