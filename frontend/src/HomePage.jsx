import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const C = {
  forest:    "#1A3A2A",
  forestHov: "#243F30",
  saffron:   "#D4851A",
  saffLight: "#FEF3DC",
  saffDark:  "#8C5A0A",
  parchment: "#FAF8F3",
  white:     "#FFFFFF",
  ink:       "#1C1C1A",
  stone:     "#6B6B67",
  border:    "#E4E2DC",
  sage:      "#EAF3DE",
};

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Inter', sans-serif; background: #fff; color: #1C1C1A; -webkit-font-smoothing: antialiased; }

/* NAV */
.nav {
  position: sticky; top: 0; z-index: 200;
  background: #1A3A2A;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 6%; height: 58px;
}
.nav-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 19px; color: #fff; text-decoration: none;
  display: flex; align-items: center; gap: 9px; flex-shrink: 0;
}
.nav-pip { width: 8px; height: 8px; border-radius: 50%; background: #D4851A; flex-shrink: 0; }
.nav-links { display: flex; align-items: center; gap: 26px; list-style: none; }
.nav-links a { font-size: 13.5px; color: rgba(255,255,255,0.6); text-decoration: none; transition: color .15s; }
.nav-links a:hover { color: #fff; }
.nav-btn {
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
  background: #D4851A; color: #fff; padding: 8px 18px; border-radius: 5px;
  border: none; cursor: pointer; text-decoration: none; transition: opacity .15s; white-space: nowrap;
}
.nav-btn:hover { opacity: .85; }
.nav-hamburger { display: none; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; padding: 4px; line-height: 1; }
@media (max-width: 660px) {
  .nav-links { display: none; }
  .nav-hamburger { display: block; }
  .nav-links.open {
    display: flex; flex-direction: column; align-items: flex-start;
    position: absolute; top: 58px; left: 0; right: 0;
    background: #1A3A2A; border-top: 1px solid rgba(255,255,255,.1);
    padding: 16px 6%; gap: 14px;
  }
}

/* HERO */
.hero { background: #1A3A2A; padding: 80px 6% 72px; position: relative; overflow: hidden; }
.hero::after {
  content: ''; position: absolute; bottom: -100px; right: -80px;
  width: 400px; height: 400px; border-radius: 50%;
  border: 60px solid rgba(212,133,26,.08); pointer-events: none;
}
.hero-eyebrow { font-size: 11.5px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: #D4851A; margin-bottom: 20px; }
.hero-headline { font-family: 'DM Serif Display', serif; font-size: clamp(34px, 5.5vw, 60px); font-weight: 400; line-height: 1.12; color: #fff; max-width: 680px; margin-bottom: 14px; }

.hero-ticker-wrap {
  display: inline-flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  border-radius: 6px; padding: 8px 14px; margin-bottom: 26px; max-width: 100%;
}
.hero-ticker-label { font-size: 11px; color: rgba(255,255,255,.4); white-space: nowrap; }
.hero-ticker-text { font-family: 'DM Serif Display', serif; font-style: italic; font-size: 15px; color: #D4851A; min-width: 200px; }
.hero-ticker-cursor { display: inline-block; width: 2px; height: 14px; background: #D4851A; margin-left: 2px; border-radius: 1px; animation: blink .8s step-end infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

.hero-sub { font-size: 16px; color: rgba(255,255,255,.62); line-height: 1.75; max-width: 480px; margin-bottom: 36px; }
.hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-saffron {
  font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
  background: #D4851A; color: #fff; padding: 11px 24px; border-radius: 5px;
  border: none; cursor: pointer; text-decoration: none; display: inline-block; transition: opacity .15s;
}
.btn-saffron:hover { opacity: .87; }
.btn-outline {
  font-family: 'Inter', sans-serif; font-size: 14px; color: rgba(255,255,255,.75);
  background: transparent; padding: 11px 24px; border-radius: 5px;
  border: 1px solid rgba(255,255,255,.22); cursor: pointer; text-decoration: none;
  display: inline-block; transition: border-color .15s, color .15s;
}
.btn-outline:hover { border-color: rgba(255,255,255,.5); color: #fff; }

.hero-divider { height: 1px; background: rgba(255,255,255,.08); margin: 52px 0 28px; }
.hero-stats { display: flex; gap: 48px; flex-wrap: wrap; }
.hero-stat-n { font-family: 'DM Serif Display', serif; font-size: 30px; color: #fff; line-height: 1; margin-bottom: 4px; }
.hero-stat-l { font-size: 12px; color: rgba(255,255,255,.45); }

/* FEATURES */
.features { background: #FAF8F3; padding: 72px 6%; }
.sec-eyebrow { font-size: 11.5px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: #D4851A; margin-bottom: 10px; }
.sec-title { font-family: 'DM Serif Display', serif; font-size: clamp(26px, 3.5vw, 38px); font-weight: 400; color: #1C1C1A; line-height: 1.2; margin-bottom: 10px; }
.sec-sub { font-size: 15px; color: #6B6B67; line-height: 1.75; max-width: 500px; margin-bottom: 44px; }

.cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
@media (max-width: 860px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 540px) { .cards-grid { grid-template-columns: 1fr; } }

.card {
  background: #fff; border: 1px solid #E4E2DC; border-radius: 10px;
  padding: 24px 22px; display: flex; flex-direction: column; gap: 10px;
  transition: box-shadow .18s, border-color .18s;
}
.card:hover { border-color: #CCC9BF; box-shadow: 0 6px 20px rgba(0,0,0,.07); }
.card-icon { width: 38px; height: 38px; border-radius: 8px; background: #EAF3DE; font-size: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-title { font-size: 14.5px; font-weight: 500; color: #1C1C1A; }
.card-desc { font-size: 13px; color: #6B6B67; line-height: 1.7; flex: 1; }
.card-pill { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 100px; background: #FEF3DC; color: #8C5A0A; width: fit-content; margin-top: 2px; }

/* HOW IT WORKS */
.how { background: #fff; padding: 72px 6%; }
.how-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 44px; }
@media (max-width: 700px) { .how-row { grid-template-columns: 1fr 1fr; gap: 28px 0; } }
@media (max-width: 400px) { .how-row { grid-template-columns: 1fr; gap: 24px; } }
.how-step { padding-right: 20px; position: relative; }
.how-step:not(:last-child)::after {
  content: ''; position: absolute; right: 0; top: 10px;
  width: 1px; height: calc(100% - 20px); background: #E4E2DC;
}
@media (max-width: 700px) { .how-step:not(:last-child)::after { display: none; } }
.how-num { font-family: 'DM Serif Display', serif; font-style: italic; font-size: 40px; color: #E4E2DC; line-height: 1; margin-bottom: 12px; }
.how-title { font-size: 14px; font-weight: 500; color: #1C1C1A; margin-bottom: 6px; }
.how-desc { font-size: 13px; color: #6B6B67; line-height: 1.65; }

/* CTA STRIP */
.cta-strip {
  background: #1A3A2A; padding: 56px 6%;
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; flex-wrap: wrap;
}
.cta-title { font-family: 'DM Serif Display', serif; font-size: clamp(22px, 3vw, 34px); color: #fff; font-weight: 400; max-width: 520px; line-height: 1.2; }
.cta-sub { font-size: 14px; color: rgba(255,255,255,.55); margin-top: 8px; }

/* FOOTER */
.footer { background: #1C1C1A; padding: 52px 6% 28px; }
.footer-top {
  display: grid; grid-template-columns: 2.2fr 1fr 1fr 1fr;
  gap: 40px; padding-bottom: 40px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
@media (max-width: 700px) { .footer-top { grid-template-columns: 1fr 1fr; gap: 32px; } }
.footer-brand { font-family: 'DM Serif Display', serif; font-size: 18px; color: #fff; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.footer-tagline { font-size: 13px; color: rgba(255,255,255,.4); line-height: 1.7; max-width: 230px; }
.footer-col-head { font-size: 11.5px; font-weight: 500; color: rgba(255,255,255,.7); letter-spacing: .05em; margin-bottom: 14px; }
.footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.footer-col ul a { font-size: 13px; color: rgba(255,255,255,.38); text-decoration: none; transition: color .13s; }
.footer-col ul a:hover { color: rgba(255,255,255,.75); }
.footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; flex-wrap: wrap; gap: 8px; }
.footer-copy { font-size: 12px; color: rgba(255,255,255,.28); }
.footer-india { font-size: 12px; color: rgba(255,255,255,.28); }
`;

/* ─────────────────────────────────────────────
   TYPEWRITER HOOK
───────────────────────────────────────────── */
const TICKER = [
  "Himalayan Pink Salt Pickle Mix · 250g — Traditional tone",
  "Cold-Pressed Mustard Oil · 1L — Premium tone",
  "Organic Amla Powder · 200g — Health-focused tone",
  "Stone-Ground Rajma Masala · 100g — Traditional tone",
  "Sun-Dried Mango Chutney · 300g — Premium tone",
];

function useTypewriter(items, speed = 50, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [char, setChar] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const target = items[idx];
    let delay = del ? speed / 2 : speed;
    if (!del && char === target.length) delay = pause;

    const t = setTimeout(() => {
      if (!del && char < target.length) {
        setDisplay(target.slice(0, char + 1)); setChar(c => c + 1);
      } else if (!del && char === target.length) {
        setDel(true);
      } else if (del && char > 0) {
        setDisplay(target.slice(0, char - 1)); setChar(c => c - 1);
      } else {
        setDel(false); setIdx(i => (i + 1) % items.length);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [char, del, idx, items, speed, pause]);

  return display;
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const FEATURES = [
  { icon: "✍️", title: "AI-written descriptions", desc: "Enter product details once and get a clean, e-commerce-ready description built for Amazon, Flipkart, or your own store — no copywriter needed.", pill: "Core feature" },
  { icon: "🎚️", title: "Three writing tones", desc: "Switch between Premium, Traditional, and Health-focused tones. Each one is calibrated for a different buyer and platform context.", pill: "Tone control" },
  { icon: "✏️", title: "Edit before you publish", desc: "The generated output is fully editable inline. Adjust a word, swap a sentence, or regenerate — then copy to your clipboard with one click.", pill: "Full control" },
  { icon: "📋", title: "Platform-tuned highlights", desc: "Bullet highlights and character limits are sized to Amazon and Flipkart's listing requirements so you don't reformat manually.", pill: "Amazon · Flipkart" },
  { icon: "🕒", title: "Description history", desc: "Every saved description is stored and searchable. Revisit, compare, or reuse previous output without starting from scratch.", pill: "Always saved" },
  { icon: "🚫", title: "No puffery, no fluff", desc: "The AI avoids unverified health claims and superlatives — keeping your listings accurate, compliant, and credible to buyers.", pill: "Honest copy" },
];

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */
function Navbar() {
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

function Hero() {
  const ticker = useTypewriter(TICKER);
  return (
    <section className="hero">
      <p className="hero-eyebrow">Product descriptions for food businesses</p>
      <h1 className="hero-headline">Your products, described<br />clearly and quickly</h1>

      <div className="hero-ticker-wrap">
        <span className="hero-ticker-label">Now generating →</span>
        <span className="hero-ticker-text">{ticker}<span className="hero-ticker-cursor" /></span>
      </div>

      <p className="hero-sub">
        FoodDescAI helps food processors and packaged-goods sellers generate
        accurate, platform-ready product descriptions — without the guesswork or the agency bill.
      </p>
      <div className="hero-actions">
        <a href="#start" className="btn-saffron">Generate a description</a>
        <a href="#how" className="btn-outline">See how it works</a>
      </div>
      <div className="hero-divider" />
      <div className="hero-stats">
        <div><div className="hero-stat-n">3</div><div className="hero-stat-l">Writing tones</div></div>
        <div><div className="hero-stat-n">&lt; 60s</div><div className="hero-stat-l">Average generation time</div></div>
        <div><div className="hero-stat-n">Amazon<br />Flipkart</div><div className="hero-stat-l">Platform-tuned output</div></div>
      </div>
    </section>
  );
}

function Card({ icon, title, desc, pill }) {
  return (
    <div className="card">
      <div className="card-icon">{icon}</div>
      <div className="card-title">{title}</div>
      <p className="card-desc">{desc}</p>
      <span className="card-pill">{pill}</span>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="features" id="features">
      <p className="sec-eyebrow">What it does</p>
      <h2 className="sec-title">Everything a product listing needs</h2>
      <p className="sec-sub">
        Built for food businesses, not retrofitted from a generic writing tool.
        Every feature is shaped around how packaged-goods listings actually work.
      </p>
      <div className="cards-grid">
        {FEATURES.map(f => <Card key={f.title} {...f} />)}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "1", title: "Enter product details", desc: "Name, ingredients, weight, and key features. Takes under two minutes." },
    { n: "2", title: "Choose tone and platform", desc: "Select the writing style and the marketplace you're listing on." },
    { n: "3", title: "Review and edit", desc: "Read the output, adjust anything inline, and regenerate if needed." },
    { n: "4", title: "Copy and publish", desc: "Copy the final text directly into your product listing." },
  ];
  return (
    <section className="how" id="how">
      <p className="sec-eyebrow">How it works</p>
      <h2 className="sec-title">From product details to listing copy</h2>
      <p className="sec-sub">No training needed. Fill a form, pick a tone, and get copy you can use immediately.</p>
      <div className="how-row">
        {steps.map(s => (
          <div className="how-step" key={s.n}>
            <div className="how-num">{s.n}</div>
            <div className="how-title">{s.title}</div>
            <p className="how-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTAStrip() {
  return (
    <section className="cta-strip" id="start">
      <div>
        <h2 className="cta-title">Ready to write your first listing?</h2>
        <p className="cta-sub">No account needed. Enter a product and get a description in under a minute.</p>
      </div>
      <a href="#app" className="btn-saffron" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
        Open the generator
      </a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-brand"><span className="nav-pip" style={{ background: "#D4851A" }} />FoodDescAI</div>
          <p className="footer-tagline">AI product descriptions for food processors and packaged-goods sellers on Amazon, Flipkart, and your own store.</p>
        </div>
        <div className="footer-col">
          <div className="footer-col-head">Product</div>
          <ul><li><a href="#">Features</a></li><li><a href="#">Pricing</a></li><li><a href="#">Changelog</a></li><li><a href="#">Roadmap</a></li></ul>
        </div>
        <div className="footer-col">
          <div className="footer-col-head">Resources</div>
          <ul><li><a href="#">Docs</a></li><li><a href="#">Writing guide</a></li><li><a href="#">Platform tips</a></li><li><a href="#">Support</a></li></ul>
        </div>
        <div className="footer-col">
          <div className="footer-col-head">Company</div>
          <ul><li><a href="#">About</a></li><li><a href="#">Contact</a></li><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2025 FoodDescAI. All rights reserved.</span>
        <span className="footer-india">Made for food businesses in India 🇮🇳</span>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <style>{CSS}</style>
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      <CTAStrip />
      <Footer />
    </>
  );
}
