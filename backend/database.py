import json
import os
import hashlib
import secrets
from typing import Dict, List, Optional
from datetime import datetime

class JSONDatabase:
    def __init__(self, db_path: str = "backend/data/db.json"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        if not os.path.exists(self.db_path):
            self._write({"users": [], "listings": []})

    def _read(self) -> dict:
        try:
            with open(self.db_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {"users": [], "listings": []}

    def _write(self, data: dict):
        with open(self.db_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    # Password Helpers
    @staticmethod
    def hash_password(password: str) -> str:
        salt = secrets.token_hex(16)
        key = hashlib.pbkdf2_hmac(
            'sha256', 
            password.encode('utf-8'), 
            salt.encode('utf-8'), 
            100000
        )
        return f"{salt}:{key.hex()}"

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            salt, key_hex = hashed_password.split(":")
            key = hashlib.pbkdf2_hmac(
                'sha256', 
                plain_password.encode('utf-8'), 
                salt.encode('utf-8'), 
                100000
            )
            return key.hex() == key_hex
        except Exception:
            return False

    # User Methods
    def get_user_by_email(self, email: str) -> Optional[dict]:
        db = self._read()
        for user in db["users"]:
            if user["email"].lower() == email.lower():
                return user
        return None

    def create_user(self, email: str, name: str, password_plain: str) -> dict:
        db = self._read()
        
        # Check if user already exists
        if self.get_user_by_email(email):
            raise ValueError("User with this email already exists")

        hashed_password = self.hash_password(password_plain)
        new_user = {
            "email": email.lower(),
            "name": name,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow().isoformat()
        }
        db["users"].append(new_user)
        self._write(db)
        return {"email": new_user["email"], "name": new_user["name"]}

    # Listing Methods
    def get_listings_by_user(self, email: str) -> List[dict]:
        db = self._read()
        return [l for l in db["listings"] if l["user_email"].lower() == email.lower()]

    def create_listing(self, email: str, listing_data: dict) -> dict:
        db = self._read()
        listing_id = secrets.token_hex(8)
        new_listing = {
            "id": listing_id,
            "user_email": email.lower(),
            "productName": listing_data.get("productName", ""),
            "brandName": listing_data.get("brandName", ""),
            "ingredients": listing_data.get("ingredients", ""),
            "tone": listing_data.get("tone", "premium"),
            "platform": listing_data.get("platform", "general"),
            "title": listing_data.get("title", ""),
            "description": listing_data.get("description", ""),
            "bullets": listing_data.get("bullets", []),
            "keywords": listing_data.get("keywords", ""),
            "created_at": datetime.utcnow().isoformat()
        }
        db["listings"].append(new_listing)
        self._write(db)
        return new_listing

    def delete_listing(self, listing_id: str, email: str) -> bool:
        db = self._read()
        initial_count = len(db["listings"])
        db["listings"] = [
            l for l in db["listings"] 
            if not (l["id"] == listing_id and l["user_email"].lower() == email.lower())
        ]
        if len(db["listings"]) < initial_count:
            self._write(db)
            return True
        return False
