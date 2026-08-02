export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-brand"><span className="nav-pip" style={{ background: "#D4851A" }} />FoodDescAI</div>
          <p className="footer-tagline">AI product descriptions for food processors and packaged-goods sellers on Amazon, Flipkart, and your own store.</p>
        </div>
        <div className="footer-col">
          <div className="footer-col-head">Product</div>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#changelog">Changelog</a></li>
            <li><a href="#roadmap">Roadmap</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <div className="footer-col-head">Resources</div>
          <ul>
            <li><a href="#docs">Docs</a></li>
            <li><a href="#guide">Writing guide</a></li>
            <li><a href="#tips">Platform tips</a></li>
            <li><a href="#support">Support</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <div className="footer-col-head">Company</div>
          <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#privacy">Privacy</a></li>
            <li><a href="#terms">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2026 FoodDescAI. All rights reserved.</span>
        <span className="footer-india">Made for food businesses in India 🇮🇳</span>
      </div>
    </footer>
  );
}
