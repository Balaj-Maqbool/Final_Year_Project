import { Link } from "react-router-dom";
import "./LandingPage.css";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <Link to="/" className="nav-logo">
          Pak<span>Freelance</span>
        </Link>

        <div className="nav-actions">
          <Link to="/login" className="btn-login">
            Log In
          </Link>
          <Link to="/register" className="btn-register">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          {/* Left Side */}
          <div className="hero-text">
            <div className="hero-badge">
              ✨ Pakistan's #1 Trusted Freelance Marketplace
            </div>

            <h1 className="hero-title">
              Find & Hire <span>Top Talent</span>
              <br />
              Across Pakistan
            </h1>

            <p className="hero-subtitle">
              Connect with verified freelancers. Secure escrow payments.
              Pay using JazzCash, Easypaisa & local bank transfers.
              Build your dream team today.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="btn-primary">
                Hire Freelancers
              </Link>
              <Link to="/register" className="btn-outline">
                Find Work
              </Link>
            </div>
          </div>

          {/* Right Side Visual */}
          <div className="hero-visual">
            <div className="dashboard-mock">
              <div className="mock-card">
                <h4>Active Project</h4>
                <p>Frontend Developer Needed</p>
                <span className="badge-success">In Progress</span>
              </div>

              <div className="mock-card">
                <h4>Total Bids</h4>
                <p>12 Freelancers Applied</p>
              </div>

              <div className="mock-card">
                <h4>Escrow Secured</h4>
                <p>Rs. 75,000 Protected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Why Choose PakFreelance?</h2>
          <p>Built for Pakistan, trusted by thousands.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🛡️</span>
            <h3>Secure Escrow</h3>
            <p>
              Your payment stays protected until work is completed
              and approved.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">💸</span>
            <h3>Local Payments</h3>
            <p>
              Pay & withdraw easily via JazzCash, Easypaisa
              and local bank transfers.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">✅</span>
            <h3>Verified Talent</h3>
            <p>
              CNIC-verified freelancers to ensure trust
              and authenticity.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🚀</span>
            <h3>Grow Your Business</h3>
            <p>
              Access thousands of opportunities across Pakistan
              and scale confidently.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
