import { useState } from "react";

export default function Navbar({ onNavigate }) {
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
        <li><a href="#login" onClick={(e) => { e.preventDefault(); onNavigate("auth", "login"); }}>Sign in</a></li>
        <li><a href="#signup" className="nav-btn" onClick={(e) => { e.preventDefault(); onNavigate("auth", "signup"); }}>Start free</a></li>
      </ul>
      <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        {open ? "✕" : "☰"}
      </button>
    </nav>
  );
}
