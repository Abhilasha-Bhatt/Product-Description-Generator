import { useState } from "react";

export default function Navbar({ onNavigate, currentUser, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="nav">
      <a href="#home" className="nav-logo" onClick={(e) => { e.preventDefault(); onNavigate("home"); }}>
        <span className="nav-pip" />FoodDescAI
      </a>
      <ul className={`nav-links${open ? " open" : ""}`}>
        <li><a href="#features">Features</a></li>
        <li><a href="#how">How it works</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#generator" onClick={(e) => { e.preventDefault(); onNavigate("generator"); }}>Generator</a></li>
        {currentUser ? (
          <>
            <li className="user-profile-menu" style={{ display: 'flex', alignItems: 'center' }}>
              <span className="nav-username" style={{ color: '#4a5568', fontWeight: '500', marginRight: '10px', fontSize: '0.95rem' }}>👤 {currentUser.name || currentUser.email}</span>
            </li>
            <li>
              <button 
                type="button" 
                className="nav-btn logout-btn" 
                onClick={(e) => { e.preventDefault(); onLogout(); }}
                style={{
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  color: '#4a5568',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Sign Out
              </button>
            </li>
          </>
        ) : (
          <>
            <li><a href="#login" onClick={(e) => { e.preventDefault(); onNavigate("auth", "login"); }}>Sign in</a></li>
            <li><a href="#signup" className="nav-btn" onClick={(e) => { e.preventDefault(); onNavigate("auth", "signup"); }}>Start free</a></li>
          </>
        )}
      </ul>
      <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        {open ? "✕" : "☰"}
      </button>
    </nav>
  );
}
