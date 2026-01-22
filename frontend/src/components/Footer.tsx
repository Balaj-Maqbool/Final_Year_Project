import "./footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>PakFreelance</h4>
          <p>
            Pakistan's #1 trusted freelance marketplace. Connect, collaborate, and grow with top talent and verified professionals.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/jobs">Find Work</Link></li>
            <li><Link to="/register">Hire Talent</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul className="footer-links">
            <li><Link to="#">Help Center</Link></li>
            <li><Link to="#">Safety/Escrow</Link></li>
            <li><Link to="#">Terms of Service</Link></li>
            <li><Link to="#">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul className="footer-links">
            <li>Email: support@pakfreelance.com</li>
            <li>Phone: +92 300 1234567</li>
            <li>Islamabad, Pakistan</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} PakFreelance. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
