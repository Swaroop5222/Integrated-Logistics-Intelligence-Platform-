import { Link } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">
          <Package size={22} />
        </span>

        <span>
          ShipTrack<span className="brand-highlight"> Pro</span>
        </span>
      </Link>

      <div className="navbar-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#about">About</a>
      </div>

      <div className="navbar-actions">
        <Link to="/login" className="login-link">
          Login
        </Link>

        <Link to="/register" className="nav-button">
          Get Started
          <ArrowRight size={17} />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;