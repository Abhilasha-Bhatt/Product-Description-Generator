import { useState, useEffect } from "react";

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
        setDisplay(target.slice(0, char + 1));
        setChar(c => c + 1);
      } else if (!del && char === target.length) {
        setDel(true);
      } else if (del && char > 0) {
        setDisplay(target.slice(0, char - 1));
        setChar(c => c - 1);
      } else {
        setDel(false);
        setIdx(i => (i + 1) % items.length);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [char, del, idx, items, speed, pause]);

  return display;
}

export default function Hero({ onNavigate }) {
  const ticker = useTypewriter(TICKER);

  return (
    <section className="hero">
      <p className="hero-eyebrow">Product descriptions for food businesses</p>
      <h1 className="hero-headline">Your products, described<br />clearly and quickly</h1>

      <div className="hero-ticker-wrap">
        <span className="hero-ticker-label">Now generating →</span>
        <span className="hero-ticker-text">
          {ticker}
          <span className="hero-ticker-cursor" />
        </span>
      </div>

      <p className="hero-sub">
        FoodDescAI helps food processors and packaged-goods sellers generate
        accurate, platform-ready product descriptions — without the guesswork or the agency bill.
      </p>
      <div className="hero-actions">
        <a href="#signup" className="btn-saffron" onClick={(e) => { e.preventDefault(); onNavigate("auth", "signup"); }}>Generate a description</a>
        <a href="#how" className="btn-outline">See how it works</a>
      </div>
      <div className="hero-divider" />
      <div className="hero-stats">
        <div>
          <div className="hero-stat-n">3</div>
          <div className="hero-stat-l">Writing tones</div>
        </div>
        <div>
          <div className="hero-stat-n">&lt; 60s</div>
          <div className="hero-stat-l">Average generation time</div>
        </div>
        <div>
          <div className="hero-stat-n">Amazon<br />Flipkart</div>
          <div className="hero-stat-l">Platform-tuned output</div>
        </div>
      </div>
    </section>
  );
}
