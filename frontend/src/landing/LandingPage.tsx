import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import "./LandingPage.css";
import Footer from "../components/Footer";
import CursorBlob from "../components/CursorBlob";

// Animation Variants
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const floatAnimation: any = {
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
      <CursorBlob />
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

      {/* Platform Roadmap Section */}
      <section className="roadmap-section py-5" style={{ backgroundColor: "#0b1120", color: "#f8fafc", padding: "80px 0" }}>
        <Container>
          <motion.div 
            className="text-center mb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeIn}
          >
            <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: '20px' }}>Platform <span className="highlight-text">Roadmap</span></h2>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: "700px", margin: "0 auto" }}>
              We're constantly evolving to bring you the best experience possible. Here's a secure peek into the premium features we are building behind the scenes.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Row className="g-4 justify-content-center">
              {/* Card 1: Identity Verification */}
              <Col lg={3} md={6}>
                <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }} className="h-100">
                  <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0 }} className="h-100">
                    <Card className="h-100 border-0" style={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                      <div style={{ position: "relative" }}>
                        <Card.Img variant="top" src="https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1" alt="Identity Verification" style={{ height: "200px", objectFit: "cover" }} />
                        <Badge bg="warning" text="dark" style={{ position: "absolute", top: "15px", right: "15px", fontSize: "0.85rem", padding: "8px 12px", borderRadius: "20px", fontWeight: 600 }}>
                          Coming Soon
                        </Badge>
                      </div>
                      <Card.Body className="p-4 d-flex flex-column" style={{ backgroundColor: "#1e293b" }}>
                        <Card.Title style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: "15px", color: "#fff" }}>Identity Verification</Card.Title>
                        <Card.Text style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                          Trust is our priority. We are deploying automated CNIC and facial recognition systems to ensure absolute authenticity and security across the marketplace.
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </motion.div>
              </Col>

              {/* Card 2: Milestone Payments */}
              <Col lg={3} md={6}>
                <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }} className="h-100">
                  <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} className="h-100">
                    <Card className="h-100 border-0" style={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                      <div style={{ position: "relative" }}>
                        <Card.Img variant="top" src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&h=300&q=80" alt="Milestone Payments" style={{ height: "200px", objectFit: "cover" }} />
                        <Badge bg="warning" text="dark" style={{ position: "absolute", top: "15px", right: "15px", fontSize: "0.85rem", padding: "8px 12px", borderRadius: "20px", fontWeight: 600 }}>
                          Coming Soon
                        </Badge>
                      </div>
                      <Card.Body className="p-4 d-flex flex-column" style={{ backgroundColor: "#1e293b" }}>
                        <Card.Title style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: "15px", color: "#fff" }}>Milestone Payments</Card.Title>
                        <Card.Text style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                          Easily break down complex projects into manageable chunks. Clients can fund specific milestones independently, accelerating freelancer workflow and trust.
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </motion.div>
              </Col>

              {/* Card 3: Golden User Program */}
              <Col lg={3} md={6}>
                <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }} className="h-100">
                  <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} className="h-100">
                    <Card className="h-100 border-0" style={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.8)", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                      <div style={{ position: "relative" }}>
                        <Card.Img variant="top" src="https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=400&h=300&q=80" alt="Golden User VIP" style={{ height: "200px", objectFit: "cover" }} />
                        <Badge bg="warning" text="dark" style={{ position: "absolute", top: "15px", right: "15px", fontSize: "0.85rem", padding: "8px 12px", borderRadius: "20px", fontWeight: 700, boxShadow: "0 2px 10px rgba(251,191,36,0.5)" }}>
                          👑 Coming Soon
                        </Badge>
                      </div>
                      <Card.Body className="p-4 d-flex flex-column" style={{ background: "linear-gradient(180deg, rgba(30,41,59,1) 0%, rgba(51,39,0,1) 100%)" }}>
                        <Card.Title style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: "15px", color: "#fbbf24" }}>Golden User Program</Card.Title>
                        <Card.Text style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                          Our upcoming premium tier explicitly for elite users. Enjoy zero platform fees, highlighted profile badges, priority customer support, and exclusive job invites.
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </motion.div>
              </Col>

              {/* Card 4: Freelancer Discovery */}
              <Col lg={3} md={6}>
                <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }} className="h-100">
                  <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.9 }} className="h-100">
                    <Card className="h-100 border-0" style={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                      <div style={{ position: "relative" }}>
                        <Card.Img variant="top" src="https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1" alt="Freelancer Discovery" style={{ height: "200px", objectFit: "cover" }} />
                        <Badge bg="warning" text="dark" style={{ position: "absolute", top: "15px", right: "15px", fontSize: "0.85rem", padding: "8px 12px", borderRadius: "20px", fontWeight: 600 }}>
                          Coming Soon
                        </Badge>
                      </div>
                      <Card.Body className="p-4 d-flex flex-column" style={{ backgroundColor: "#1e293b" }}>
                        <Card.Title style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: "15px", color: "#fff" }}>Freelancer Discovery</Card.Title>
                        <Card.Text style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                          A dedicated marketplace directory allowing clients to directly search for top talent, browse their ratings, and initiate instant chat without posting a job first.
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </motion.div>
              </Col>
            </Row>
          </motion.div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
