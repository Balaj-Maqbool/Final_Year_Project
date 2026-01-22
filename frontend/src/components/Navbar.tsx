import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
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
        </ul>

        <div className="nav-menu">
           <Link to="/login" className="nav-btn nav-btn-secondary">Login</Link>
           <Link to="/register" className="nav-btn nav-btn-primary">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar