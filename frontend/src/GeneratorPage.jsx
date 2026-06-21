import { useState, useEffect } from "react";
import "./GeneratorPage.css";

const LOADER_STEPS = [
  "🔍 Analyzing ingredients and product specifications...",
  "✍️ Drafting marketing hooks and headers...",
  "⚡ Injecting platform SEO keywords and tags...",
  "✨ Polishing copy and formatting listing..."
];

export default function GeneratorPage({ onNavigate }) {
  const [productName, setProductName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [tone, setTone] = useState("premium"); // "traditional" | "premium" | "health"
  const [platform, setPlatform] = useState("amazon"); // "amazon" | "flipkart" | "shopify" | "general"

  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [output, setOutput] = useState(null);
  const [activeTab, setActiveTab] = useState("description"); // "title" | "description" | "bullets" | "keywords"
  const [copiedField, setCopiedField] = useState(null);
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);

  // Auto-hide copy indicator
  useEffect(() => {
    if (copiedField) {
      const timer = setTimeout(() => setCopiedField(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedField]);

  // Handle fake loading animation
  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setGeneratingStep((prev) => {
          if (prev >= LOADER_STEPS.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    } else {
      setGeneratingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const validateForm = () => {
    const newErrors = {};
    if (!productName.trim()) {
      newErrors.productName = "Product name is required";
    }
    if (!ingredients.trim()) {
      newErrors.ingredients = "Please enter key ingredients or features";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsGenerating(true);
    setOutput(null);

    // Simulate API generation
    setTimeout(() => {
      setIsGenerating(false);

      // Compile mock text dynamically based on inputs
      const brand = brandName.trim() || "Premium";
      const prod = productName.trim();
      const ingList = ingredients.split(",").map(i => i.trim()).filter(Boolean);
      const mainIng = ingList[0] || "Natural ingredients";

      let title = "";
      let description = "";
      let bullets = [];
      let keywords = [];

      // Tone additions
      if (tone === "traditional") {
        title = `${brand} Traditional ${prod} - Authentic Stone-Ground Recipe | Made with ${mainIng}`;
        description = `Bring home the authentic taste of heritage with ${brand}'s traditional ${prod}. Prepared using time-honored recipes passed down through generations, this blend is handcrafted with pride. Every batch highlights the deep-rooted richness of ${mainIng} and traditional spices, stone-ground to preserve natural oils and nutritional wholesomeness. Enjoy a nostalgic culinary journey with zero artificial colors or preservatives.`;
        bullets = [
          `AUTHENTIC RECIPE: Prepared using time-tested methods passed down through generations for a nostalgic home-style taste.`,
          `STONE-GROUND PROCESS: Carefully ground on traditional stone mills to retain natural nutrients, delicate aromas, and rich textures.`,
          `100% PURE & NATURAL: Made strictly with authentic ingredients, including ${mainIng}, with absolutely no artificial flavors or preservatives.`,
          `HANDCRAFTED IN BATCHES: Produced in small, supervised batches to guarantee premium quality, safety, and authentic culinary integrity.`,
          `VERSATILE USE: Ideal for daily meals, traditional Indian recipes, and festive dishes. Elevate your culinary creation instantly.`
        ];
        keywords = ["traditional recipe", "authentic taste", "stone ground", "handmade pickle", "heritage spices", "natural food", "desi flavour"];
      } else if (tone === "health") {
        title = `${brand} Organic ${prod} - Clean Label & Rich in Nutrients | Made with ${mainIng}`;
        description = `Fuel your active lifestyle with ${brand}'s nutrient-rich ${prod}. Specially curated for wellness enthusiasts, this clean-label superfood harnesses the benefits of ${mainIng} to support immune health and digestion. 100% organic, gluten-free, and guilt-free, it is packed with dietary fiber and antioxidants. We commit to transparency, ensuring no added refined sugar, synthetic chemicals, or fillers are used.`;
        bullets = [
          `CLEAN LABEL NUTRITION: A transparent formulation highlighting organic ${mainIng} with no hidden additives, synthetic chemicals, or fillers.`,
          `IMMUNITY & WELLNESS: Naturally rich in vitamins, essential antioxidants, and fiber to boost digestion and daily energy levels.`,
          `ORGANIC CERTIFIED: Hand-harvested from certified organic fields to ensure pesticide-free, pure, and clean nutritional profiles.`,
          `ZERO REFINED SUGAR: Guilt-free formulation sweetened naturally, making it perfect for diabetic-friendly or low-carb diets.`,
          `VEGAN & GLUTEN-FREE: Fits seamlessly into vegan, vegetarian, and gluten-sensitive diet plans for holistic wellness.`
        ];
        keywords = ["organic superfood", "clean label", "health supplement", "gluten free snack", "rich in antioxidants", "sugar free", "natural immunity"];
      } else {
        // Premium tone
        title = `${brand} Artisanal ${prod} - Gourmet Selection | Infused with ${mainIng}`;
        description = `Indulge in a sophisticated culinary experience with ${brand}'s artisanal ${prod}. Exquisitely crafted for food connoisseurs, this gourmet selection features an aromatic infusion of wild ${mainIng} and rare spices. Carefully sourced from pristine farms, every ingredient undergoes rigorous taste evaluations to deliver a luxurious texture and multi-layered flavour profile. Perfect for gifting or gourmet dining.`;
        bullets = [
          `ARTISANAL CRAFTSMANSHIP: Exquisitely blended by expert chefs to create a multi-layered gourmet flavor that delights the palate.`,
          `HAND-SELECTED INGREDIENTS: Features handpicked wild ${mainIng} sourced from premium high-altitude farms for unrivaled quality.`,
          `GOURMET PAIRING: Designed to elevate fine-dining creations, cheese platters, charcuterie boards, or custom dips and spreads.`,
          `LUXURIOUS PACKAGING: Housed in an elegant, air-tight glass jar, preserving structural freshness and making it a perfect gourmet gift.`,
          `PRESERVATIVE FREE: Made without chemical stabilizers or colorants, ensuring only pristine, rich culinary flavors reach you.`
        ];
        keywords = ["gourmet food", "artisanal recipe", "luxury gift jar", "premium food products", "fine dining ingredients", "connoisseur selection"];
      }

      // Platform adjustments
      if (platform === "amazon") {
        title = `${title} (Pack of 1) - Amazon E-commerce Special Edition`;
      } else if (platform === "flipkart") {
        title = `${brand} ${prod} (${mainIng} Blend) - Flipkart Choice Product`;
        bullets = bullets.map(b => b.replace(/^[A-Z\s]+:/, "•"));
      } else if (platform === "shopify") {
        title = `${prod} by ${brand}`;
        description = `${description} Available exclusively on our Shopify online store. Buy fresh, buy direct.`;
      }

      setOutput({ title, description, bullets, keywords: keywords.join(", ") });
      setActiveTab("description");
    }, 4000);
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
  };

  const copyAll = () => {
    if (!output) return;
    const allText = `TITLE:\n${output.title}\n\nDESCRIPTION:\n${output.description}\n\nBULLET POINTS:\n${output.bullets.join("\n")}\n\nKEYWORDS:\n${output.keywords}`;
    copyToClipboard(allText, "all");
  };

  return (
    <div className="gen-workspace">
      {/* Workspace Header */}
      <header className="gen-header">
        <div className="gen-header-left">
          <a href="#home" className="gen-back-home" onClick={(e) => { e.preventDefault(); onNavigate("home"); }}>
            ← Home
          </a>
          <span className="gen-header-divider">/</span>
          <div className="gen-brand-logo">
            <span className="gen-pip" />
            FoodDescAI Workspace
          </div>
        </div>
        <div className="gen-header-right">
          <div className="workspace-badge">⚡ Free Plan</div>
          <button 
            className="save-workspace-btn"
            onClick={() => {
              setShowLoginTooltip(true);
              setTimeout(() => setShowLoginTooltip(false), 3000);
            }}
          >
            Save Listing
            {showLoginTooltip && <span className="tooltip-alert">Please Sign In to save listings!</span>}
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="gen-body">
        {/* Form panel */}
        <section className="gen-sidebar-form">
          <div className="form-card">
            <h2>Product Details</h2>
            <p className="form-desc">Define your product parameters to guide the AI writer.</p>

            <form onSubmit={handleGenerate} className="workspace-form">
              <div className="gen-group">
                <label htmlFor="productName">Product Name *</label>
                <input
                  type="text"
                  id="productName"
                  placeholder="e.g. Himalayan Pink Salt Pickle"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    if (errors.productName) setErrors(prev => ({ ...prev, productName: "" }));
                  }}
                  className={errors.productName ? "gen-error-input" : ""}
                  disabled={isGenerating}
                />
                {errors.productName && <span className="gen-error-text">{errors.productName}</span>}
              </div>

              <div className="gen-group">
                <label htmlFor="brandName">Brand Name <span className="optional-tag">(Optional)</span></label>
                <input
                  type="text"
                  id="brandName"
                  placeholder="e.g. Nature's Spoon"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="gen-group">
                <label htmlFor="ingredients">Ingredients / Key Features *</label>
                <textarea
                  id="ingredients"
                  placeholder="e.g. Raw Himalayan salt, mustard oil, handpicked mango, organic cumin (separated by commas)"
                  rows="3"
                  value={ingredients}
                  onChange={(e) => {
                    setIngredients(e.target.value);
                    if (errors.ingredients) setErrors(prev => ({ ...prev, ingredients: "" }));
                  }}
                  className={errors.ingredients ? "gen-error-input" : ""}
                  disabled={isGenerating}
                />
                {errors.ingredients && <span className="gen-error-text">{errors.ingredients}</span>}
              </div>

              <div className="gen-group">
                <label>Writing Tone</label>
                <div className="tone-grid">
                  <button
                    type="button"
                    className={`tone-card ${tone === "traditional" ? "active" : ""}`}
                    onClick={() => setTone("traditional")}
                    disabled={isGenerating}
                  >
                    <span className="tone-icon">🏺</span>
                    <div>
                      <div className="tone-name">Traditional</div>
                      <div className="tone-desc">Heritage & Roots</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`tone-card ${tone === "premium" ? "active" : ""}`}
                    onClick={() => setTone("premium")}
                    disabled={isGenerating}
                  >
                    <span className="tone-icon">👑</span>
                    <div>
                      <div className="tone-name">Premium</div>
                      <div className="tone-desc">Gourmet & Artisanal</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`tone-card ${tone === "health" ? "active" : ""}`}
                    onClick={() => setTone("health")}
                    disabled={isGenerating}
                  >
                    <span className="tone-icon">🥗</span>
                    <div>
                      <div className="tone-name">Health-Focused</div>
                      <div className="tone-desc">Organic & Organic Claims</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="gen-group">
                <label htmlFor="platform">Target Platform</label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="general">General E-Commerce</option>
                  <option value="amazon">Amazon Listing (SEO Tuned)</option>
                  <option value="flipkart">Flipkart Listing</option>
                  <option value="shopify">Shopify Store Description</option>
                </select>
              </div>

              <button
                type="submit"
                className="gen-submit-btn"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Listing"}
              </button>
            </form>
          </div>
        </section>

        {/* Output Panel */}
        <section className="gen-output-preview">
          {/* Default Placeholder */}
          {!isGenerating && !output && (
            <div className="output-placeholder">
              <div className="placeholder-art">✨</div>
              <h3>Your AI Assistant is Ready</h3>
              <p>Fill out the product information on the left and click "Generate Listing" to compose e-commerce listings tailored for food brands.</p>
            </div>
          )}

          {/* Loader Sequence */}
          {isGenerating && (
            <div className="output-loader">
              <div className="spinner-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <h3>Generating Listing</h3>
              <p className="loader-sub">Using food-processing knowledge graph models...</p>

              <div className="loader-steps-list">
                {LOADER_STEPS.map((step, idx) => {
                  let statusClass = "pending";
                  if (generatingStep > idx) statusClass = "complete";
                  else if (generatingStep === idx) statusClass = "active";

                  return (
                    <div key={idx} className={`loader-step-item ${statusClass}`}>
                      <span className="step-bullet">
                        {statusClass === "complete" ? "✓" : "●"}
                      </span>
                      <span className="step-text">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Outputs */}
          {!isGenerating && output && (
            <div className="output-card">
              <div className="output-header">
                <h3>Generated Listing</h3>
                <button className="copy-all-btn" onClick={copyAll}>
                  {copiedField === "all" ? "Copied Workspace!" : "📋 Copy All Fields"}
                </button>
              </div>

              {/* Tab navigation */}
              <div className="output-tabs">
                <button
                  className={`tab-link ${activeTab === "title" ? "active" : ""}`}
                  onClick={() => setActiveTab("title")}
                >
                  SEO Title
                </button>
                <button
                  className={`tab-link ${activeTab === "description" ? "active" : ""}`}
                  onClick={() => setActiveTab("description")}
                >
                  Product Description
                </button>
                <button
                  className={`tab-link ${activeTab === "bullets" ? "active" : ""}`}
                  onClick={() => setActiveTab("bullets")}
                >
                  Bullet Points
                </button>
                <button
                  className={`tab-link ${activeTab === "keywords" ? "active" : ""}`}
                  onClick={() => setActiveTab("keywords")}
                >
                  SEO Keywords
                </button>
              </div>

              {/* Tab values */}
              <div className="tab-content-area">
                {activeTab === "title" && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <span>Listing Title</span>
                      <button 
                        className="copy-tab-btn" 
                        onClick={() => copyToClipboard(output.title, "title")}
                      >
                        {copiedField === "title" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="text-output title-output">{output.title}</div>
                  </div>
                )}

                {activeTab === "description" && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <span>Detailed Description</span>
                      <button 
                        className="copy-tab-btn" 
                        onClick={() => copyToClipboard(output.description, "description")}
                      >
                        {copiedField === "description" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="text-output desc-output">{output.description}</div>
                  </div>
                )}

                {activeTab === "bullets" && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <span>Bullet Points (Features)</span>
                      <button 
                        className="copy-tab-btn" 
                        onClick={() => copyToClipboard(output.bullets.join("\n"), "bullets")}
                      >
                        {copiedField === "bullets" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <ul className="text-output bullet-output">
                      {output.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === "keywords" && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <span>Target Keywords</span>
                      <button 
                        className="copy-tab-btn" 
                        onClick={() => copyToClipboard(output.keywords, "keywords")}
                      >
                        {copiedField === "keywords" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="text-output keywords-output">{output.keywords}</div>
                  </div>
                )}
              </div>

              <div className="output-compliance-note">
                <strong>✓ FSSAI Claim Safe:</strong> This description highlights natural features and ingredients. Ensure nutrition tables match packaging labels.
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
