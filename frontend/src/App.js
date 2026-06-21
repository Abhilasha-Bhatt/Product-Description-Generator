import { useState } from "react";
import HomePage from "./HomePage";
import AuthPage from "./AuthPage";

function App() {
  const [page, setPage] = useState("home");
  const [authMode, setAuthMode] = useState("login");

  const navigateTo = (targetPage, mode = "login") => {
    setAuthMode(mode);
    setPage(targetPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {page === "home" ? (
        <HomePage onNavigate={navigateTo} />
      ) : (
        <AuthPage initialMode={authMode} onNavigate={navigateTo} />
      )}
    </div>
  );
}

export default App;