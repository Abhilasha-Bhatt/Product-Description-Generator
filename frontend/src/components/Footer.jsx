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
            <li><a href="#">Features</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Changelog</a></li>
            <li><a href="#">Roadmap</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <div className="footer-col-head">Resources</div>
          <ul>
            <li><a href="#">Docs</a></li>
            <li><a href="#">Writing guide</a></li>
            <li><a href="#">Platform tips</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <div className="footer-col-head">Company</div>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2025 FoodDescAI. All rights reserved.</span>
        <span className="footer-india">Made for food businesses in India 🇮🇳</span>
      </div>
    </footer>
  );
}
