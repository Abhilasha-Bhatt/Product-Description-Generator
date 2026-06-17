export default function HowItWorks() {
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
        {steps.map(step => (
          <div className="how-step" key={step.n}>
            <div className="how-num">{step.n}</div>
            <div className="how-title">{step.title}</div>
            <p className="how-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
