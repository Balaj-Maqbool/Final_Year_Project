import { Link } from "react-router-dom";
import "./Navbar.css";
import NotificationBell from "../notifications/NotificationBell";

import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <nav className="custom-navbar">
      <div className="navbar-container">
        <Link to="/" className="nav-brand">
          PakFreelance
        </Link>

        <ul className="nav-menu">
          <li><Link to="/freelancer/jobs" className="nav-link">Find Work</Link></li>
          <li><Link to="/freelancer/my-bids" className="nav-link">My Bids</Link></li>
          <li><Link to="/freelancer/freelancerDashboard" className="nav-link">Dashboard</Link></li>
          <li style={{ display: "flex", alignItems: "center" }}><NotificationBell /></li>
          <li><Link to="/freelancer/wallet" className="nav-link">Wallet</Link></li>
        </ul>

        <div className="nav-menu">
          <button
            onClick={toggleTheme}
            className="nav-btn theme-toggle"
            style={{ marginRight: '10px', background: 'none', border: '1px solid var(--text-color)', color: 'var(--text-color)', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px' }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link to="/login" className="nav-btn nav-btn-secondary">Login</Link>
          <Link to="/register" className="nav-btn nav-btn-primary">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar