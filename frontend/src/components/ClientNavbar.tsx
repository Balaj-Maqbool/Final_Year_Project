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
           <li><Link to="/client/postjob" className="nav-link">Post a Job</Link></li>
           <li><Link to="/client/alljobs" className="nav-link">All Jobs</Link></li>
           {/* <li><Link to="/client/clientDashboard" className="nav-link">View Proposals</Link></li> */}
           <li><Link to="/client/notifications" className="nav-link">Notifications</Link></li>

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