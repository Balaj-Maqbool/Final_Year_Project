import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import NotificationBell from "../notifications/NotificationBell";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="custom-navbar">
      <motion.div
        style={{
          scaleX,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "3px",
          originX: 0,
          background: "linear-gradient(90deg, #10b981 0%, #3b82f6 100%)",
          zIndex: 10,
          borderBottomLeftRadius: "24px",
          borderBottomRightRadius: "24px",
        }}
      />

      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          PakFreelance
        </Link>

        {/* Desktop nav links */}
        <ul className="nav-menu desktop-menu">
          <li><Link to="/freelancer/jobs" className="nav-link">Find Work</Link></li>
          <li><Link to="/freelancer/my-bids" className="nav-link">My Bids</Link></li>
          <li><Link to="/freelancer/freelancerDashboard" className="nav-link">Dashboard</Link></li>
          <li style={{ display: "flex", alignItems: "center" }}><NotificationBell /></li>
          <li><Link to="/freelancer/wallet" className="nav-link">Wallet</Link></li>
        </ul>

        {/* Right side: theme toggle + profile/auth — always visible */}
        <div className="nav-right">
          <button
            onClick={toggleTheme}
            className="nav-btn theme-toggle"
            style={{ background: "none", border: "1px solid var(--text-color)", color: "var(--text-color)", cursor: "pointer", padding: "5px 10px", borderRadius: "5px" }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {isAuthenticated ? (
            <Link to="/profile" className="nav-btn nav-btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "1.2rem" }}>👤</span>
              )}
              Profile
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-btn nav-btn-secondary">Login</Link>
              <Link to="/register" className="nav-btn nav-btn-primary">Sign Up</Link>
            </>
          )}

          {/* Hamburger button — mobile only */}
          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Link to="/freelancer/jobs" className="mobile-link" onClick={closeMenu}>Find Work</Link>
            <Link to="/freelancer/my-bids" className="mobile-link" onClick={closeMenu}>My Bids</Link>
            <Link to="/freelancer/freelancerDashboard" className="mobile-link" onClick={closeMenu}>Dashboard</Link>
            <Link to="/freelancer/wallet" className="mobile-link" onClick={closeMenu}>Wallet</Link>
            <div className="mobile-bell"><NotificationBell /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;