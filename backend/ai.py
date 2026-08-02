import os
import httpx
from fastapi import HTTPException, status
from typing import Dict, Any

# Target model
GEMINI_MODEL = "gemini-3.5-flash"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

async def generate_listing_ai(
    product_name: str,
    brand_name: str,
    ingredients: str,
    tone: str,
    platform: str,
) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key.strip() == "" or api_key.startswith("your_"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your .env file."
        )

    # Construct the prompt
    brand = brand_name.strip() if brand_name and brand_name.strip() else "Premium"
    prompt = f"""You are a professional marketing copywriter specializing in food and beverage brands.
Generate an e-commerce product listing for a food product with these details:
- Product Name: {product_name.strip()}
- Brand Name: {brand}
- Key Ingredients/Features: {ingredients.strip()}
- Tone of Voice: {tone}
- Target Platform: {platform}

Please tailor the output according to the tone and platform:
- For 'premium', use luxury, sophisticated, and artisanal positioning.
- For 'traditional', focus on heritage, authentic stone-ground recipes, and nostalgia.
- For 'health', highlight clean labels, nutritional wholesomeness, wellness, organic ingredients, and diet compatibility (e.g., gluten-free, vegan).
- For 'amazon', follow Amazon listing standards (clear benefits, pack size).
- For 'flipkart', use bullet points prefixed with bullet characters.
- For 'shopify', write copy suitable for an independent brand online store, including a call-to-action to buy direct.

Output the result as a JSON object containing exactly the following keys:
1. "title": An engaging, SEO-optimized title containing the product and brand name.
2. "description": A paragraph describing the product's flavor profile, craftsmanship, and culinary uses (approx. 100-150 words).
3. "bullets": A list of exactly 5 bullet points highlighting key benefits, features, and ingredients.
4. "keywords": A comma-separated list of 7 relevant keywords.
"""

    # Schema definition for Gemini Structured Outputs
    response_schema = {
        "type": "OBJECT",
        "properties": {
            "title": {"type": "STRING"},
            "description": {"type": "STRING"},
            "bullets": {
                "type": "ARRAY",
                "items": {"type": "STRING"}
            },
            "keywords": {"type": "STRING"}
        },
        "required": ["title", "description", "bullets", "keywords"]
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": response_schema,
            "temperature": 0.7,
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    params = {
        "key": api_key
    }

    # Use httpx to send the request with timeout and error handling
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                GEMINI_API_URL,
                json=payload,
                headers=headers,
                params=params,
                timeout=20.0 # 20 seconds timeout
            )
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Request to Gemini AI API timed out. Please try again."
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Network error communicating with Gemini AI: {str(exc)}"
            )

        if resp.status_code == 429:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Gemini AI rate limit exceeded. Please try again later."
            )
        elif resp.status_code != 200:
            error_detail = "Failed to generate content from Gemini AI."
            try:
                err_json = resp.json()
                if "error" in err_json and "message" in err_json["error"]:
                    error_detail = f"Gemini API Error: {err_json['error']['message']}"
            except Exception:
                pass
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=error_detail
            )

        # Parse output
        try:
            data = resp.json()
            # Extract candidate text
            candidates = data.get("candidates", [])
            if not candidates:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Gemini AI returned empty candidates list."
                )
            
            content_parts = candidates[0].get("content", {}).get("parts", [])
            if not content_parts or "text" not in content_parts[0]:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Gemini AI candidate parts do not contain text."
                )
            
            import json
            raw_text = content_parts[0]["text"]
            result = json.loads(raw_text)
            
            # Simple structure validation
            for key in ["title", "description", "bullets", "keywords"]:
                if key not in result:
                    raise KeyError(f"Missing key: {key}")
            if not isinstance(result["bullets"], list):
                result["bullets"] = [str(result["bullets"])]
                
            return result
        except (json.JSONDecodeError, KeyError, IndexError, TypeError) as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini AI returned response in invalid format: {str(exc)}"
            )
