import {
  ArrowRight,
  Box,
  CheckCircle2,
  Clock3,
  Headphones,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";

import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">

      {/* ================= NAVBAR ================= */}

      <header className="home-navbar">

        <Link to="/" className="home-logo">

          <div className="home-logo-icon">
            <Box size={21} />
          </div>

          <div className="home-logo-text">
            <strong>
              ShipTrack <span>Pro</span>
            </strong>

            <small>LOGISTICS INTELLIGENCE</small>
          </div>

        </Link>


        <nav className="home-nav">

          <a href="#features">Features</a>
          <a href="#workflow">How It Works</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>

        </nav>


        <div className="home-nav-actions">

          <Link
            to="/login"
            className="nav-login"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="nav-start"
          >
            Get Started
            <ArrowRight size={16} />
          </Link>

        </div>

      </header>


      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <span></span>
            SMART LOGISTICS PLATFORM
          </div>


          <h1>
            Ship smarter.
            <br />
            <span>Track every move.</span>
          </h1>


          <p className="hero-description">
            Manage shipments, monitor deliveries and keep
            your entire logistics operation connected in
            one powerful platform.
          </p>


          <div className="hero-actions">

            <Link
              to="/register"
              className="primary-button"
            >
              Start Shipping
              <ArrowRight size={18} />
            </Link>


            <Link
              to="/login"
              className="secondary-button"
            >
              <PackageCheck size={17} />
              Track Shipment
            </Link>

          </div>


          {/* HERO BENEFITS */}

          <div className="hero-benefits">

            <div className="benefit">

              <div className="benefit-icon secure">
                <ShieldCheck size={17} />
              </div>

              <div>
                <strong>Secure</strong>
                <small>Role-based access</small>
              </div>

            </div>


            <div className="benefit">

              <div className="benefit-icon realtime">
                <Zap size={17} />
              </div>

              <div>
                <strong>Real-time</strong>
                <small>Shipment tracking</small>
              </div>

            </div>


            <div className="benefit">

              <div className="benefit-icon support">
                <Headphones size={17} />
              </div>

              <div>
                <strong>Support</strong>
                <small>Always available</small>
              </div>

            </div>

          </div>

        </div>


        {/* ================= SHIPMENT CARD ================= */}

        <div className="shipment-widget">

          <div className="widget-header">

            <div>
              <span>LIVE SHIPMENT</span>

              <h3>TRK-2026-001</h3>
            </div>

            <div className="status-pill">
              <span></span>
              In Transit
            </div>

          </div>


          {/* TRACKING LINE */}

          <div className="shipment-progress">

            <div className="progress-item completed">

              <div className="progress-icon orange">
                <Box size={17} />
              </div>

              <strong>Created</strong>
              <small>Shipment created</small>

            </div>


            <div className="progress-line orange-line"></div>


            <div className="progress-item completed">

              <div className="progress-icon purple">
                <Truck size={17} />
              </div>

              <strong>Picked Up</strong>
              <small>Package collected</small>

            </div>


            <div className="progress-line purple-line"></div>


            <div className="progress-item active">

              <div className="progress-icon teal">
                <MapPin size={17} />
              </div>

              <strong>In Transit</strong>
              <small>On the way</small>

            </div>


            <div className="progress-line"></div>


            <div className="progress-item">

              <div className="progress-icon inactive">
                <CheckCircle2 size={17} />
              </div>

              <strong>Delivered</strong>
              <small>Destination</small>

            </div>

          </div>


          {/* ROUTE */}

          <div className="route-card">

            <div className="route-place">

              <span>FROM</span>

              <strong>Hyderabad</strong>

              <small>Telangana, India</small>

            </div>


            <div className="route-middle">

              <div className="route-line"></div>

              <div className="route-arrow">
                <ArrowRight size={16} />
              </div>

              <div className="route-line"></div>

            </div>


            <div className="route-place destination">

              <span>TO</span>

              <strong>Bengaluru</strong>

              <small>Karnataka, India</small>

            </div>

          </div>


          {/* WIDGET FOOTER */}

          <div className="widget-footer">

            <div>
              <Truck size={16} />

              <span>
                Express
                <small>Delivery</small>
              </span>
            </div>


            <div>
              <Clock3 size={16} />

              <span>
                92%
                <small>On-time</small>
              </span>
            </div>


            <div>
              <PackageCheck size={16} />

              <span>
                Mar 28
                <small>ETA</small>
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* ================= STATS ================= */}

      <section className="stats-section">

        <div className="stat-card">
          <strong>12.5K+</strong>
          <span>Shipments Delivered</span>
        </div>

        <div className="stat-card">
          <strong>98.7%</strong>
          <span>On-time Delivery</span>
        </div>

        <div className="stat-card">
          <strong>4.8K+</strong>
          <span>Happy Customers</span>
        </div>

        <div className="stat-card">
          <strong>150+</strong>
          <span>Business Partners</span>
        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="features-section"
      >

        <div className="section-heading">

          <span>PLATFORM FEATURES</span>

          <h2>
            Everything you need to
            <br />
            manage shipments.
          </h2>

          <p>
            One connected platform for shipment management,
            tracking, delivery operations and support.
          </p>

        </div>


        <div className="feature-grid">


          <div className="feature-card orange-card">

            <div className="feature-icon">
              <Box size={22} />
            </div>

            <span className="feature-number">
              01
            </span>

            <h3>Shipment Management</h3>

            <p>
              Create, update and manage shipments
              with sender, receiver and package details.
            </p>

            <Link to="/register">
              Manage Shipments
              <ArrowRight size={15} />
            </Link>

          </div>


          <div className="feature-card purple-card">

            <div className="feature-icon">
              <MapPin size={22} />
            </div>

            <span className="feature-number">
              02
            </span>

            <h3>Real-time Tracking</h3>

            <p>
              Follow shipment progress from creation
              and pickup to transit and final delivery.
            </p>

            <Link to="/login">
              Track Shipment
              <ArrowRight size={15} />
            </Link>

          </div>


          <div className="feature-card teal-card">

            <div className="feature-icon">
              <Truck size={22} />
            </div>

            <span className="feature-number">
              03
            </span>

            <h3>Delivery Operations</h3>

            <p>
              Monitor active deliveries and keep
              logistics operations organized and visible.
            </p>

            <Link to="/login">
              View Operations
              <ArrowRight size={15} />
            </Link>

          </div>


          <div className="feature-card pink-card">

            <div className="feature-icon">
              <Headphones size={22} />
            </div>

            <span className="feature-number">
              04
            </span>

            <h3>Customer Support</h3>

            <p>
              Handle shipment questions, delivery issues
              and customer assistance from one place.
            </p>

            <Link to="/login">
              Get Support
              <ArrowRight size={15} />
            </Link>

          </div>

        </div>

      </section>


      {/* ================= WORKFLOW ================= */}

      <section
        id="workflow"
        className="workflow-section"
      >

        <div className="section-heading">

          <span>SHIPMENT LIFECYCLE</span>

          <h2>
            From pickup to delivery.
          </h2>

          <p>
            Track every important stage of your shipment
            through one simple workflow.
          </p>

        </div>


        <div className="workflow-container">


          <div className="workflow-step">

            <div className="step-number">
              01
            </div>

            <div className="step-icon orange-step">
              <Box size={24} />
            </div>

            <h3>Created</h3>

            <p>
              Shipment is created with sender,
              receiver and package information.
            </p>

          </div>


          <div className="workflow-connector"></div>


          <div className="workflow-step">

            <div className="step-number">
              02
            </div>

            <div className="step-icon purple-step">
              <Truck size={24} />
            </div>

            <h3>Picked Up</h3>

            <p>
              Package is collected and prepared
              for transportation.
            </p>

          </div>


          <div className="workflow-connector"></div>


          <div className="workflow-step">

            <div className="step-number">
              03
            </div>

            <div className="step-icon teal-step">
              <MapPin size={24} />
            </div>

            <h3>In Transit</h3>

            <p>
              Shipment moves towards its
              destination while being tracked.
            </p>

          </div>


          <div className="workflow-connector"></div>


          <div className="workflow-step">

            <div className="step-number">
              04
            </div>

            <div className="step-icon green-step">
              <CheckCircle2 size={24} />
            </div>

            <h3>Delivered</h3>

            <p>
              Shipment reaches its destination
              and delivery is completed.
            </p>

          </div>

        </div>

      </section>


      {/* ================= SERVICES ================= */}

      <section
        id="services"
        className="services-section"
      >

        <div className="services-content">

          <div>

            <span className="section-tag">
              BUILT FOR EVERY ROLE
            </span>

            <h2>
              One platform.
              <br />
              Every logistics team.
            </h2>

            <p>
              ShipTrack Pro brings customers, business
              clients, logistics operators, support agents
              and administrators into one connected system.
            </p>

          </div>


          <div className="role-list">

            <div className="role-item">
              <span>01</span>
              <strong>Customer</strong>
              <small>Track and manage shipments</small>
            </div>

            <div className="role-item">
              <span>02</span>
              <strong>Business Client</strong>
              <small>Manage business shipments</small>
            </div>

            <div className="role-item">
              <span>03</span>
              <strong>Logistics Operator</strong>
              <small>Monitor delivery operations</small>
            </div>

            <div className="role-item">
              <span>04</span>
              <strong>Support Agent</strong>
              <small>Resolve customer issues</small>
            </div>

            <div className="role-item">
              <span>05</span>
              <strong>Administrator</strong>
              <small>Manage the platform</small>
            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="cta-section">

        <div className="cta-glow"></div>

        <div className="cta-content">

          <span>
            READY TO GET STARTED?
          </span>

          <h2>
            Take control of
            <br />
            every shipment.
          </h2>

          <p>
            Create your account and bring your logistics
            operations together in one intelligent platform.
          </p>

        </div>


        <Link
          to="/register"
          className="cta-button"
        >
          Create Account
          <ArrowRight size={18} />
        </Link>

      </section>


      {/* ================= FOOTER ================= */}

      <footer
        id="about"
        className="home-footer"
      >

        <div className="footer-brand">

          <div className="home-logo-icon">
            <Box size={19} />
          </div>

          <div>
            <strong>
              ShipTrack <span>Pro</span>
            </strong>

            <small>
              LOGISTICS INTELLIGENCE
            </small>
          </div>

        </div>


        <p>
          Integrated Logistics Intelligence Platform
        </p>


        <span>
          © 2026 ShipTrack Pro
        </span>

      </footer>

    </div>
  );
}

export default Home;