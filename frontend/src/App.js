import { useState, useEffect } from "react";
import HomePage from "./HomePage";
import AuthPage from "./AuthPage";
import GeneratorPage from "./GeneratorPage";

const API_BASE_URL = "http://localhost:8000";

function App() {
  const [page, setPage] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);

  // Restore user session on load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setCurrentUser({ ...userObj, token: storedToken });
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLoginSuccess = (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser({ ...user, token });
    setPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setPage("home");
  };

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
        <GeneratorPage 
          onNavigate={navigateTo} 
          currentUser={currentUser}
          apiBaseUrl={API_BASE_URL}
        />
      )}
    </div>
  );
}

export default App;