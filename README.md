# 🍽️ FoodDescAI - E-Commerce Product Description Generator

FoodDescAI is a modern, full-stack web application designed for food and beverage brands to compose premium, engaging, and **FSSAI Claim-Safe** e-commerce product listings. Leveraging **Google Gemini AI (`gemini-3.5-flash`)**, it generates SEO-friendly titles, descriptions, bullet points, and search keywords tailored to different target platforms and writing tones.

---

## ✨ Features

- **🧠 Dual-Engine Listing Generation**:
  - **AI Engine**: Powered by Google Gemini AI, crafting unique, context-aware copy matching specific brand elements and ingredients.
  - **Template Engine**: A robust, rule-based backup engine ensuring immediate fallback generation in offline or unconfigured states.
- **🎯 Platform & Tone Optimization**:
  - **Tones**: *Premium* (luxury & artisanal), *Traditional* (heritage & nostalgia), and *Health* (clean label & organic focus).
  - **Platforms**: Customized formats for *Amazon*, *Flipkart*, and *Shopify*.
- **🛡️ Claim-Safe & Compliance Checks**: Built-in notices to help brands keep claims aligned with regulatory guidelines (e.g., FSSAI compliance for nutrition and ingredients).
- **🔐 Secure Authentication**: Includes standard email/password login, account registration, and **Google OAuth 2.0 Integration**.
- **📋 Workspace Dashboard**: Responsive layout featuring immediate clipboard copying, generation step logs, and previous generation history.

---

## 🏗️ Project Architecture

```mermaid
graph TD
    subgraph Frontend [React SPA]
        A[index.js / App.js] --> B[HomePage]
        A --> C[AuthPage - Login/Signup/Google]
        A --> D[GeneratorPage - Workspace]
    end

    subgraph Backend [FastAPI Server]
        E[main.py - Router & Middleware] --> F[auth.py - JWT & Google OAuth]
        E --> G[ai.py - Gemini API Client]
        E --> H[crud.py - Database Operations]
        H --> I[(SQLAlchemy Database)]
    end

    Frontend -- REST APIs / JWT Auth --> Backend
    Backend -- JSON Payload --> J[Google Gemini AI API]
```

---

## ⚙️ Environment Variables Configuration

The application uses environment variables for secure, production-ready configuration.

### Backend (`backend/.env`)
Create a `.env` file inside the `backend/` directory:

```env
# Database Settings (PostgreSQL or SQLite fallback)
DATABASE_URL=postgresql://user:password@localhost:5432/fooddescai

# JWT Authentication Settings
JWT_SECRET=your_super_secret_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend Redirection & CORS Settings
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend/` directory (optional in development; uses fallback):

```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- SQLite or PostgreSQL

---

### 1. Backend Setup & Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the database migrations & start the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will be available at [http://localhost:8000](http://localhost:8000). You can access interactive documentation at `/docs`.

---

### 2. Frontend Setup & Run

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   The application will start automatically in your browser at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Running Tests

The backend includes a comprehensive testing suite powered by `pytest` and `httpx`.

To run the test suite:
1. Navigate to the workspace root:
   ```bash
   cd ..
   ```
2. Execute the test command:
   ```bash
   pytest backend/
   ```

---

## 🔒 Security & Git Safety
To maintain strict production security, all `.env` files are permanently ignored and will not be committed to Git. The project-level `.gitignore` blocks matching configuration patterns globally.