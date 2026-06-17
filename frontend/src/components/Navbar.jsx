import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="nav">
      <a href="#" className="nav-logo">
        <span className="nav-pip" />FoodDescAI
      </a>
      <ul className={`nav-links${open ? " open" : ""}`}>
        <li><a href="#features">Features</a></li>
        <li><a href="#how">How it works</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#start" className="nav-btn">Start free</a></li>
      </ul>
      <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        {open ? "✕" : "☰"}
      </button>
    </nav>
  );
}
