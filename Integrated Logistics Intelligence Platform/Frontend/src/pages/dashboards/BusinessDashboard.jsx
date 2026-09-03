import { Link } from "react-router-dom";
import "./BusinessDashboard.css";

const shipments = [
  {
    id: "TRK-2026-101",
    customer: "TechNova Pvt Ltd",
    route: "Hyderabad → Bangalore",
    status: "In Transit",
    date: "02 Sep 2026",
    eta: "Today, 6:30 PM",
  },
  {
    id: "TRK-2026-102",
    customer: "UrbanMart",
    route: "Mumbai → Pune",
    status: "Delivered",
    date: "01 Sep 2026",
    eta: "Delivered",
  },
  {
    id: "TRK-2026-103",
    customer: "GreenLeaf Foods",
    route: "Chennai → Hyderabad",
    status: "Picked Up",
    date: "01 Sep 2026",
    eta: "03 Sep 2026",
  },
  {
    id: "TRK-2026-104",
    customer: "BuildPro Industries",
    route: "Delhi → Jaipur",
    status: "Delayed",
    date: "31 Aug 2026",
    eta: "05 Sep 2026",
  },
];

function BusinessDashboard() {
  return (
    <div className="business-dashboard">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className="business-sidebar">

        {/* LOGO */}
        <div className="business-logo">
          <div className="business-logo-icon">S</div>

          <div>
            <h2>ShipTrack Pro</h2>
            <span>LOGISTICS INTELLIGENCE</span>
          </div>
        </div>

        {/* MENU */}
        <div className="business-menu-title">
          MAIN MENU
        </div>

        <nav className="business-navigation">

          <Link
            to="/dashboard/business"
            className="business-nav-link active"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="business-nav-link"
          >
            <span>＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="business-nav-link"
          >
            <span>▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="business-nav-link"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="business-nav-link"
          >
            <span>□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="business-nav-link"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="business-nav-link"
          >
            <span>↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-nav-link"
          >
            <span>!</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-nav-link"
          >
            <span>◎</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="business-nav-link"
          >
            <span>♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="business-nav-link"
          >
            <span>▥</span>
            Reports & Export
          </Link>

        </nav>

        {/* BOTTOM */}
        <div className="business-sidebar-bottom">

          <Link
            to="/login"
            className="business-logout"
          >
            ⇥ Logout
          </Link>

        </div>

      </aside>


      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="business-main">

        {/* HEADER */}

        <header className="business-header">

          <div>

            <div className="business-breadcrumb">
              BUSINESS CLIENT / OVERVIEW
            </div>

            <h1>
              Good afternoon, Rekha
            </h1>

            <p>
              Here's your business shipment overview for today.
            </p>

          </div>


          <div className="business-header-right">

            {/* NOTIFICATION */}

            <Link
              to="/business/notifications"
              className="business-notification"
            >
              ♢
              <span></span>
            </Link>


            {/* PROFILE */}

            <div className="business-profile">

              <div className="business-avatar">
                R
              </div>

              <div className="business-profile-info">

                <strong>
                  Rekha Patil
                </strong>

                <small>
                  Business Client
                </small>

              </div>

              <span className="business-profile-arrow">
                V
              </span>

            </div>

          </div>

        </header>


        {/* =====================================
            QUICK ACTION
        ===================================== */}

        <section className="business-quick-action">

          <div>

            <span className="quick-label">
              BUSINESS OPERATIONS
            </span>

            <h2>
              Manage your shipments from one place
            </h2>

            <p>
              Create shipments, monitor deliveries and
              analyze logistics performance.
            </p>

          </div>

          <Link
            to="/business/create-shipment"
            className="create-shipment-btn"
          >
            + Create Shipment
          </Link>

        </section>


        {/* =====================================
            STAT CARDS
        ===================================== */}

        <section className="business-stats">

          <Link
            to="/business/shipment-management"
            className="business-stat-card"
          >

            <div className="business-stat-top">

              <span>
                TOTAL SHIPMENTS
              </span>

              <div className="stat-icon orange">
                ▣
              </div>

            </div>

            <strong>
              128
            </strong>

            <small>
              ↑ 12.4% compared to last month
            </small>

          </Link>


          <Link
            to="/business/tracking"
            className="business-stat-card"
          >

            <div className="business-stat-top">

              <span>
                IN TRANSIT
              </span>

              <div className="stat-icon purple">
                →
              </div>

            </div>

            <strong>
              32
            </strong>

            <small>
              Currently moving
            </small>

          </Link>


          <Link
            to="/business/delivery-performance"
            className="business-stat-card"
          >

            <div className="business-stat-top">

              <span>
                DELIVERED
              </span>

              <div className="stat-icon green">
                ✓
              </div>

            </div>

            <strong>
              87
            </strong>

            <small>
              94.2% successful deliveries
            </small>

          </Link>


          <Link
            to="/business/delay-analysis"
            className="business-stat-card"
          >

            <div className="business-stat-top">

              <span>
                DELAYED
              </span>

              <div className="stat-icon pink">
                !
              </div>

            </div>

            <strong>
              09
            </strong>

            <small>
              7.0% of total shipments
            </small>

          </Link>

        </section>


        {/* =====================================
            MAIN GRID
        ===================================== */}

        <section className="business-content-grid">


          {/* RECENT SHIPMENTS */}

          <div className="business-panel shipments-panel">

            <div className="business-panel-header">

              <div>

                <span>
                  SHIPMENT ACTIVITY
                </span>

                <h2>
                  Recent Shipments
                </h2>

              </div>

              <Link
                to="/business/shipment-management"
                className="view-all-link"
              >
                View all →
              </Link>

            </div>


            <div className="business-shipment-list">

              {shipments.map((shipment) => (

                <div
                  className="business-shipment-row"
                  key={shipment.id}
                >

                  <div className="shipment-company-icon">
                    □
                  </div>


                  <div className="shipment-main-info">

                    <strong>
                      {shipment.id}
                    </strong>

                    <span>
                      {shipment.customer}
                    </span>

                    <small>
                      {shipment.route}
                    </small>

                  </div>


                  <div className="shipment-date">

                    <span>
                      Created
                    </span>

                    <strong>
                      {shipment.date}
                    </strong>

                  </div>


                  <div className="shipment-status-area">

                    <span
                      className={`business-status ${
                        shipment.status
                          .toLowerCase()
                          .replace(" ", "-")
                      }`}
                    >
                      ● {shipment.status}
                    </span>

                    <small>
                      {shipment.eta}
                    </small>

                  </div>


                  <Link
                    to={`/business/tracking?trackingNumber=${shipment.id}`}
                    className="shipment-arrow"
                  >
                    →
                  </Link>

                </div>

              ))}

            </div>

          </div>


          {/* DELIVERY PERFORMANCE */}

          <div className="business-panel performance-panel">

            <div className="business-panel-header">

              <div>

                <span>
                  PERFORMANCE
                </span>

                <h2>
                  Delivery Performance
                </h2>

              </div>

              <Link
                to="/business/delivery-performance"
                className="small-view-link"
              >
                Details
              </Link>

            </div>


            <div className="performance-score">

              <div className="score-circle">

                <div>

                  <strong>
                    94%
                  </strong>

                  <span>
                    On-time
                  </span>

                </div>

              </div>


              <div className="performance-summary">

                <div>
                  <span>On-time deliveries</span>
                  <strong>87</strong>
                </div>

                <div>
                  <span>Delayed deliveries</span>
                  <strong>09</strong>
                </div>

                <div>
                  <span>Avg. delivery time</span>
                  <strong>2.6 days</strong>
                </div>

              </div>

            </div>


            <div className="performance-progress">

              <div className="progress-header">

                <span>
                  Monthly target
                </span>

                <strong>
                  94 / 100
                </strong>

              </div>

              <div className="progress-track">

                <div
                  className="progress-value"
                  style={{ width: "94%" }}
                ></div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            ANALYTICS ROW
        ===================================== */}

        <section className="business-analytics-grid">


          {/* DELAY ANALYSIS */}

          <div className="business-panel analytics-panel">

            <div className="business-panel-header">

              <div>

                <span>
                  ANALYTICS
                </span>

                <h2>
                  Delay Analysis
                </h2>

              </div>

              <Link
                to="/business/delay-analysis"
                className="small-view-link"
              >
                View analysis
              </Link>

            </div>


            <div className="delay-content">

              <div className="delay-main-number">

                <strong>
                  09
                </strong>

                <span>
                  Delayed shipments
                </span>

              </div>


              <div className="delay-bars">

                <div className="delay-bar-row">

                  <span>
                    Traffic
                  </span>

                  <div className="delay-track">
                    <div
                      className="delay-value"
                      style={{ width: "72%" }}
                    ></div>
                  </div>

                  <strong>
                    72%
                  </strong>

                </div>


                <div className="delay-bar-row">

                  <span>
                    Weather
                  </span>

                  <div className="delay-track">
                    <div
                      className="delay-value"
                      style={{ width: "48%" }}
                    ></div>
                  </div>

                  <strong>
                    48%
                  </strong>

                </div>


                <div className="delay-bar-row">

                  <span>
                    Operations
                  </span>

                  <div className="delay-track">
                    <div
                      className="delay-value"
                      style={{ width: "34%" }}
                    ></div>
                  </div>

                  <strong>
                    34%
                  </strong>

                </div>

              </div>

            </div>

          </div>


          {/* LOGISTICS OVERVIEW */}

          <div className="business-panel analytics-panel">

            <div className="business-panel-header">

              <div>

                <span>
                  LOGISTICS
                </span>

                <h2>
                  Logistics Overview
                </h2>

              </div>

              <Link
                to="/business/logistics-overview"
                className="small-view-link"
              >
                Details
              </Link>

            </div>


            <div className="logistics-grid">

              <div className="logistics-item">

                <span>
                  ACTIVE ROUTES
                </span>

                <strong>
                  18
                </strong>

              </div>


              <div className="logistics-item">

                <span>
                  ACTIVE DRIVERS
                </span>

                <strong>
                  42
                </strong>

              </div>


              <div className="logistics-item">

                <span>
                  TOTAL DISTANCE
                </span>

                <strong>
                  8,420 km
                </strong>

              </div>


              <div className="logistics-item">

                <span>
                  ROUTE EFFICIENCY
                </span>

                <strong>
                  91%
                </strong>

              </div>

            </div>

          </div>


          {/* CUSTOMER ACTIVITY */}

          <div className="business-panel customer-activity-panel">

            <div className="business-panel-header">

              <div>

                <span>
                  CUSTOMERS
                </span>

                <h2>
                  Customer Activity
                </h2>

              </div>

              <Link
                to="/business/customer-activity"
                className="small-view-link"
              >
                View customers
              </Link>

            </div>


            <div className="customer-activity">

              <div className="customer-row">

                <div className="customer-avatar orange-avatar">
                  T
                </div>

                <div>
                  <strong>
                    TechNova Pvt Ltd
                  </strong>

                  <span>
                    24 shipments
                  </span>
                </div>

                <b>
                  96%
                </b>

              </div>


              <div className="customer-row">

                <div className="customer-avatar purple-avatar">
                  U
                </div>

                <div>
                  <strong>
                    UrbanMart
                  </strong>

                  <span>
                    18 shipments
                  </span>
                </div>

                <b>
                  93%
                </b>

              </div>


              <div className="customer-row">

                <div className="customer-avatar pink-avatar">
                  G
                </div>

                <div>
                  <strong>
                    GreenLeaf Foods
                  </strong>

                  <span>
                    15 shipments
                  </span>
                </div>

                <b>
                  91%
                </b>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            REPORTS
        ===================================== */}

        <section className="business-report-banner">

          <div>

            <span>
              REPORTS & EXPORT
            </span>

            <h2>
              Need a detailed logistics report?
            </h2>

            <p>
              Generate shipment, delivery, route and
              delay reports for your business.
            </p>

          </div>

          <Link
            to="/business/reports"
            className="report-btn"
          >
            Open Reports →
          </Link>

        </section>


        {/* FOOTER */}

        <footer className="business-footer">
          © 2026 ShipTrack Pro · Integrated Logistics Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default BusinessDashboard;