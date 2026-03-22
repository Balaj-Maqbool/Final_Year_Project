import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./LandingPage.css";
import Footer from "../components/Footer";

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const floatAnimation = {
  y: [0, -12, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <motion.nav 
        className="landing-nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="nav-logo">
          Pak<span>Freelance</span>
        </Link>

        <div className="nav-actions">
          <Link to="/login" className="btn-login">
            Log In
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/register" className="btn-register">
              Sign Up
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          {/* Left Side */}
          <motion.div 
            className="hero-text"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* <motion.div variants={fadeIn} className="hero-badge motion-badge">
              ✨ Pakistan's #1 Trusted Freelance Marketplace
            </motion.div> */}

            <motion.h1 variants={fadeIn} className="hero-title animated-gradient-text">
              Find & Hire <span>Top Talent</span>
              <br />
              Across Pakistan
            </motion.h1>

            <motion.p variants={fadeIn} className="hero-subtitle">
              Connect with verified freelancers. Secure escrow payments.
              Pay using JazzCash, Easypaisa & local bank transfers.
              Build your dream team today.
            </motion.p>

            <motion.div variants={fadeIn} className="hero-buttons">
              <motion.div whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(99,102,241,0.4)" }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="btn-primary">
                  Hire Freelancers
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="btn-outline">
                  Find Work
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Side Visual */}
          <motion.div 
            className="hero-visual"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
          >
            <div className="hero-image-container">
              <img src="/freelancer_working.png" alt="Freelancer working happily" className="hero-main-image" />
              <motion.div 
                className="dashboard-mock floating-dashboard"
                animate={floatAnimation}
              >
              <motion.div className="mock-card mock-float-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <h4>Active Project</h4>
                <p>Frontend Developer Needed</p>
                <div className="pulse-container">
                  <span className="badge-success">In Progress</span>
                </div>
              </motion.div>

              <motion.div className="mock-card mock-float-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <h4>Total Bids</h4>
                <p>12 Freelancers Applied</p>
              </motion.div>

              <motion.div className="mock-card mock-float-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                <h4>Escrow Secured</h4>
                <p>Rs. 75,000 Protected</p>
              </motion.div>
            </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <motion.div 
          className="features-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
        >
          <h2>Why Choose <span className="highlight-text">PakFreelance?</span></h2>
          <p>Built for Pakistan, trusted by thousands.</p>
        </motion.div>

        <motion.div 
          className="features-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={fadeIn} className="feature-card glass-card" whileHover={{ y: -8, scale: 1.02 }}>
            <span className="feature-icon floating-icon">🛡️</span>
            <h3>Secure Escrow</h3>
            <p>
              Your payment stays protected until work is completed
              and approved.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="feature-card glass-card" whileHover={{ y: -8, scale: 1.02 }}>
            <span className="feature-icon floating-icon feature-icon-delay-1">💸</span>
            <h3>Local Payments</h3>
            <p>
              Pay & withdraw easily via JazzCash, Easypaisa
              and local bank transfers.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="feature-card glass-card" whileHover={{ y: -8, scale: 1.02 }}>
            <span className="feature-icon floating-icon feature-icon-delay-2">✅</span>
            <h3>Verified Talent</h3>
            <p>
              CNIC-verified freelancers to ensure trust
              and authenticity.(Under Development)
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="feature-card glass-card" whileHover={{ y: -8, scale: 1.02 }}>
            <span className="feature-icon floating-icon feature-icon-delay-3">🚀</span>
            <h3>Grow Your Business</h3>
            <p>
              Access thousands of opportunities across Pakistan
              and scale confidently.
            </p>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
