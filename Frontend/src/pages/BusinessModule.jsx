import { Link, useLocation } from "react-router-dom";
import "./BusinessModule.css";

function BusinessModule() {
  const location = useLocation();

  const pageNames = {
    "/business/create-shipment": "Create Shipment",
    "/business/shipment-management": "Shipment Management",
    "/business/shipment-history": "Shipment History",
    "/business/package-information": "Package Information",
    "/business/tracking": "Tracking",
    "/business/delivery-performance": "Delivery Performance",
    "/business/delay-analysis": "Delay Analysis",
    "/business/logistics-overview": "Logistics Overview",
    "/business/customer-activity": "Customer Activity",
    "/business/reports": "Reports & Export",
    "/business/notifications": "Notifications",
  };

  const pageTitle =
    pageNames[location.pathname] || "Business Module";

  return (
    <div className="business-module-page">

      <aside className="business-module-sidebar">

        <div className="business-module-logo">
          <div className="business-module-logo-icon">
            S
          </div>

          <div>
            <h2>ShipTrack Pro</h2>
            <span>LOGISTICS INTELLIGENCE</span>
          </div>
        </div>

        <div className="business-module-menu-title">
          BUSINESS CLIENT
        </div>

        <nav>

          <Link
            to="/dashboard/business"
            className="business-module-link"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="business-module-link"
          >
            <span>＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="business-module-link"
          >
            <span>▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="business-module-link"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="business-module-link"
          >
            <span>□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className={`business-module-link ${
              pageTitle === "Tracking" ? "active" : ""
            }`}
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="business-module-link"
          >
            <span>↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-module-link"
          >
            <span>!</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-module-link"
          >
            <span>◎</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="business-module-link"
          >
            <span>♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="business-module-link"
          >
            <span>▥</span>
            Reports & Export
          </Link>

        </nav>

        <Link
          to="/login"
          className="business-module-logout"
        >
          ⇥ Logout
        </Link>

      </aside>


      <main className="business-module-main">

        <header className="business-module-header">

          <div>

            <span>BUSINESS CLIENT</span>

            <h1>{pageTitle}</h1>

            <p>
              Business logistics module
            </p>

          </div>

          <div className="business-module-avatar">
            R
          </div>

        </header>


        <section className="business-module-card">

          <div className="business-module-icon">
            {pageTitle === "Tracking" ? "⌖" : "▣"}
          </div>

          <div>

            <span className="business-module-label">
              SHIPTRACK PRO
            </span>

            <h2>
              {pageTitle}
            </h2>

            <p>
              This Business Client module is connected
              and ready for the full frontend implementation.
            </p>

          </div>

        </section>


        <Link
          to="/dashboard/business"
          className="business-module-back"
        >
          ← Back to Business Dashboard
        </Link>

      </main>

    </div>
  );
}

export default BusinessModule;