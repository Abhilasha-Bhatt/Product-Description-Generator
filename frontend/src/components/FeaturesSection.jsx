const FEATURES = [
  {
    icon: "✍️",
    title: "AI-written descriptions",
    desc: "Enter product details once and get a clean, e-commerce-ready description built for Amazon, Flipkart, or your own store — no copywriter needed.",
    pill: "Core feature",
  },
  {
    icon: "🎚️",
    title: "Three writing tones",
    desc: "Switch between Premium, Traditional, and Health-focused tones. Each one is calibrated for a different buyer and platform context.",
    pill: "Tone control",
  },
  {
    icon: "✏️",
    title: "Edit before you publish",
    desc: "The generated output is fully editable inline. Adjust a word, swap a sentence, or regenerate — then copy to your clipboard with one click.",
    pill: "Full control",
  },
  {
    icon: "📋",
    title: "Platform-tuned highlights",
    desc: "Bullet highlights and character limits are sized to Amazon and Flipkart's listing requirements so you don't reformat manually.",
    pill: "Amazon · Flipkart",
  },
  {
    icon: "🕒",
    title: "Description history",
    desc: "Every saved description is stored and searchable. Revisit, compare, or reuse previous output without starting from scratch.",
    pill: "Always saved",
  },
  {
    icon: "🚫",
    title: "No puffery, no fluff",
    desc: "The AI avoids unverified health claims and superlatives — keeping your listings accurate, compliant, and credible to buyers.",
    pill: "Honest copy",
  },
];

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

export default function FeaturesSection() {
  return (
    <section className="features" id="features">
      <p className="sec-eyebrow">What it does</p>
      <h2 className="sec-title">Everything a product listing needs</h2>
      <p className="sec-sub">
        Built for food businesses, not retrofitted from a generic writing tool.
        Every feature is shaped around how packaged-goods listings actually work.
      </p>
      <div className="cards-grid">
        {FEATURES.map(feature => (
          <Card key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
