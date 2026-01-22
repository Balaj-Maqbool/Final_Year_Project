import { Link } from "react-router-dom";
import "./LandingPage.css";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <Link to="/" className="nav-logo">PakFreelance</Link>
        <div className="nav-actions">
          <Link to="/login" className="btn-login">Log In</Link>
          <Link to="/register" className="btn-register">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-badge">
          ✨ Pakistan's #1 Trusted Freelance Marketplace
        </div>
        <h1 className="hero-title">
          Find & Hire <span>Top Talent</span><br />
          Across Pakistan
        </h1>
        <p className="hero-subtitle">
          Connect with verified freelancers. Secure escrow payments. Local payment methods including JazzCash and Easypaisa. Build your dream team today.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn-primary">Hire Freelancers</Link>
          <Link to="/register" className="btn-outline">Find Work</Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Why Choose PakFreelance?</h2>
          <p className="text-muted">Built for Pakistan, trusted by thousands.</p>
        </div>

        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card">
            <span className="feature-icon">🛡️</span>
            <h3>Secure Escrow</h3>
            <p>
              Your payment is protected until work is completed and approved.
              No scams, just secure transactions.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <span className="feature-icon">💸</span>
            <h3>Local Payments</h3>
            <p>
              Easily pay and get paid via JazzCash, Easypaisa, and local Bank Transfer
              support.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <span className="feature-icon">✅</span>
            <h3>Verified Talent</h3>
            <p>
              CNIC-verified freelancers you can trust. We ensure quality and
              authenticity for every profile.
            </p>
          </div>

          {/* Card 4 */}
          <div className="feature-card">
            <span className="feature-icon">🚀</span>
            <h3>Grow Your Business</h3>
            <p>
              Access thousands of opportunities across Pakistan and scale your
              business to new heights.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
