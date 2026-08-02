import { useState, useEffect } from "react";
import HomePage from "./HomePage";
import AuthPage from "./AuthPage";
import GeneratorPage from "./GeneratorPage";
import ProtectedRoute from "./components/ProtectedRoute";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function App() {
  const [page,        setPage]        = useState("home");
  const [authMode,    setAuthMode]    = useState("login");
  const [currentUser, setCurrentUser] = useState(null);

  // ── Restore session on mount ──────────────────────────────────────────
  useEffect(() => {
    // Check if there is a token in the URL first (e.g. returning from Google OAuth)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      // Clean query parameters from URL immediately
      window.history.replaceState({}, "", window.location.pathname);
      
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${urlToken}` },
      })
        .then(r => {
          if (!r.ok) throw new Error("Token invalid");
          return r.json();
        })
        .then(user => {
          localStorage.setItem("token", urlToken);
          localStorage.setItem("user", JSON.stringify(user));
          setCurrentUser({ ...user, token: urlToken });
          setPage("home");
        })
        .catch(err => {
          console.error("Failed to authenticate Google user:", err);
        });
      return;
    }

    // Check both storages (localStorage = "remember me", sessionStorage = session only)
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const raw   = localStorage.getItem("user")  || sessionStorage.getItem("user");
    if (token && raw) {
      try {
        JSON.parse(raw);
        // Verify the token is still valid against the server
        fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => {
            if (!r.ok) throw new Error("Token expired");
            return r.json();
          })
          .then(freshUser => {
            setCurrentUser({ ...freshUser, token });
          })
          .catch(() => {
            // Token invalid/expired — clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
          });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // ── Handle successful login / signup ──────────────────────────────────
  const handleLoginSuccess = (user, token) => {
    setCurrentUser({ ...user, token });
    setPage("home");
  };

  // ── Logout ────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setCurrentUser(null);
    setPage("home");
  };

  // ── Navigation helper ─────────────────────────────────────────────────
  const navigateTo = (targetPage, mode = "login") => {
    setAuthMode(mode);
    setPage(targetPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {page === "home" && (
        <HomePage
          onNavigate={navigateTo}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {page === "auth" && (
        <AuthPage
          initialMode={authMode}
          onNavigate={navigateTo}
          onLoginSuccess={handleLoginSuccess}
          apiBaseUrl={API_BASE_URL}
        />
      )}

      {page === "generator" && (
        <ProtectedRoute currentUser={currentUser} onNavigate={navigateTo}>
          <GeneratorPage
            onNavigate={navigateTo}
            currentUser={currentUser}
            onLogout={handleLogout}
            apiBaseUrl={API_BASE_URL}
          />
        </ProtectedRoute>
      )}
    </div>
  );
}

export default App;
