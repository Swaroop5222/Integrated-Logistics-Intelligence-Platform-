import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./BusinessTracking.css";

function BusinessTracking() {
  const [searchParams] = useSearchParams();

  const initialTracking =
    searchParams.get("trackingNumber") || "TRK-2026-101";

  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [searchedTracking, setSearchedTracking] =
    useState(initialTracking);

  const shipmentData = {
    "TRK-2026-101": {
      order: "ORD-2026-501",
      customer: "Aarav Enterprises",
      origin: "Hyderabad",
      destination: "Bengaluru",
      currentLocation: "Kurnool, Andhra Pradesh",
      status: "In Transit",
      progress: 68,
      eta: "04 Sep 2026",
      pickup: "01 Sep 2026",
      weight: "12.5 kg",
      packageType: "Box",
      quantity: 2,
      driver: "Ravi Kumar",
      vehicle: "TS 09 AB 4521",
      mode: "Road Transport",
      events: [
        {
          date: "02 Sep 2026",
          time: "02:15 PM",
          title: "Shipment in transit",
          location: "Kurnool, Andhra Pradesh",
          active: true,
        },
        {
          date: "02 Sep 2026",
          time: "08:30 AM",
          title: "Shipment departed",
          location: "Hyderabad Distribution Center",
          active: false,
        },
        {
          date: "01 Sep 2026",
          time: "06:45 PM",
          title: "Shipment picked up",
          location: "Hyderabad, Telangana",
          active: false,
        },
        {
          date: "01 Sep 2026",
          time: "10:20 AM",
          title: "Shipment created",
          location: "Business Client Portal",
          active: false,
        },
      ],
    },

    "TRK-2026-102": {
      order: "ORD-2026-502",
      customer: "Global Manufacturing Ltd.",
      origin: "Mumbai",
      destination: "Pune",
      currentLocation: "Pune Distribution Center",
      status: "Delivered",
      progress: 100,
      eta: "02 Sep 2026",
      pickup: "31 Aug 2026",
      weight: "85 kg",
      packageType: "Pallet",
      quantity: 1,
      driver: "Suresh Patil",
      vehicle: "MH 12 CD 7845",
      mode: "Road Transport",
      events: [
        {
          date: "02 Sep 2026",
          time: "11:30 AM",
          title: "Shipment delivered",
          location: "Pune, Maharashtra",
          active: true,
        },
        {
          date: "02 Sep 2026",
          time: "08:10 AM",
          title: "Out for delivery",
          location: "Pune Distribution Center",
          active: false,
        },
        {
          date: "01 Sep 2026",
          time: "04:20 PM",
          title: "Arrived at destination hub",
          location: "Pune, Maharashtra",
          active: false,
        },
        {
          date: "31 Aug 2026",
          time: "07:00 AM",
          title: "Shipment picked up",
          location: "Mumbai, Maharashtra",
          active: false,
        },
      ],
    },

    "TRK-2026-103": {
      order: "ORD-2026-503",
      customer: "FreshMart Foods",
      origin: "Vijayawada",
      destination: "Chennai",
      currentLocation: "Nellore, Andhra Pradesh",
      status: "Picked Up",
      progress: 32,
      eta: "05 Sep 2026",
      pickup: "02 Sep 2026",
      weight: "24 kg",
      packageType: "Box",
      quantity: 4,
      driver: "Mahesh Rao",
      vehicle: "AP 16 EF 2345",
      mode: "Road Transport",
      events: [
        {
          date: "02 Sep 2026",
          time: "01:15 PM",
          title: "Shipment picked up",
          location: "Vijayawada, Andhra Pradesh",
          active: true,
        },
        {
          date: "02 Sep 2026",
          time: "11:40 AM",
          title: "Pickup confirmed",
          location: "Vijayawada Warehouse",
          active: false,
        },
        {
          date: "02 Sep 2026",
          time: "09:10 AM",
          title: "Shipment created",
          location: "Business Client Portal",
          active: false,
        },
      ],
    },
  };

  const shipment =
    shipmentData[searchedTracking] ||
    shipmentData["TRK-2026-101"];

  const handleSearch = (e) => {
    e.preventDefault();

    const value = trackingNumber.trim().toUpperCase();

    if (!value) return;

    setSearchedTracking(value);
  };

  return (
    <div className="business-tracking-page">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="business-sidebar">

        <div className="business-brand">
          <div className="brand-logo">S</div>

          <div>
            <h2>ShipTrack Pro</h2>
            <span>LOGISTICS INTELLIGENCE</span>
          </div>
        </div>

        <div className="sidebar-section-title">
          BUSINESS CLIENT
        </div>

        <nav className="business-navigation">

          <Link
            to="/dashboard/business"
            className="business-nav-link"
          >
            <span className="nav-icon">⌂</span>
            <span>Overview</span>
          </Link>

          <Link
            to="/business/create-shipment"
            className="business-nav-link"
          >
            <span className="nav-icon">＋</span>
            <span>Create Shipment</span>
          </Link>

          <Link
            to="/business/shipment-management"
            className="business-nav-link"
          >
            <span className="nav-icon">▣</span>
            <span>Shipment Management</span>
          </Link>

          <Link
            to="/business/shipment-history"
            className="business-nav-link"
          >
            <span className="nav-icon">◷</span>
            <span>Shipment History</span>
          </Link>

          <Link
            to="/business/package-information"
            className="business-nav-link"
          >
            <span className="nav-icon">□</span>
            <span>Package Information</span>
          </Link>

          <Link
            to="/business/tracking"
            className="business-nav-link active"
          >
            <span className="nav-icon">⌁</span>
            <span>Tracking</span>
          </Link>

          <Link
            to="/business/delivery-performance"
            className="business-nav-link"
          >
            <span className="nav-icon">↗</span>
            <span>Delivery Performance</span>
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-nav-link"
          >
            <span className="nav-icon">!</span>
            <span>Delay Analysis</span>
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-nav-link"
          >
            <span className="nav-icon">◎</span>
            <span>Logistics Overview</span>
          </Link>

          <Link
            to="/business/customer-activity"
            className="business-nav-link"
          >
            <span className="nav-icon">♙</span>
            <span>Customer Activity</span>
          </Link>

          <Link
            to="/business/reports"
            className="business-nav-link"
          >
            <span className="nav-icon">▥</span>
            <span>Reports & Export</span>
          </Link>

        </nav>

        <Link
          to="/login"
          className="business-logout"
        >
          <span>⇥</span>
          <span>Logout</span>
        </Link>

      </aside>


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="business-tracking-main">

        {/* TOP BAR */}

        <header className="business-topbar">

          <div>
            <div className="breadcrumb">
              Business Client / Tracking
            </div>

            <h1>Shipment Tracking</h1>

            <p>
              Track shipment location, delivery progress and
              estimated arrival.
            </p>
          </div>

          <div className="business-user">

            <div className="user-avatar">
              B
            </div>

            <div>
              <strong>Business Client</strong>
              <span>Account</span>
            </div>

          </div>

        </header>


        {/* ==========================================
            SEARCH
        ========================================== */}

        <section className="tracking-search-card">

          <div className="search-heading">

            <div className="search-icon">
              ⌕
            </div>

            <div>
              <h2>Track a Shipment</h2>
              <p>
                Enter a tracking ID to view the latest shipment
                information.
              </p>
            </div>

          </div>

          <form
            className="tracking-search-form"
            onSubmit={handleSearch}
          >

            <input
              type="text"
              value={trackingNumber}
              onChange={(e) =>
                setTrackingNumber(e.target.value)
              }
              placeholder="Enter tracking ID e.g. TRK-2026-101"
            />

            <button type="submit">
              Track Shipment
            </button>

          </form>

          <div className="demo-tracking-hint">
            Try: TRK-2026-101, TRK-2026-102 or TRK-2026-103
          </div>

        </section>


        {/* ==========================================
            SHIPMENT HEADER
        ========================================== */}

        <section className="tracking-overview-card">

          <div className="tracking-overview-top">

            <div>

              <div className="tracking-label">
                TRACKING ID
              </div>

              <h2>{searchedTracking}</h2>

              <p>
                Order ID: {shipment.order}
              </p>

            </div>

            <div
              className={`tracking-status ${
                shipment.status
                  .toLowerCase()
                  .replace(/\s+/g, "-")
              }`}
            >
              <span className="status-dot"></span>
              {shipment.status}
            </div>

          </div>


          {/* ROUTE */}

          <div className="shipment-route">

            <div className="route-location">

              <span className="route-marker origin">
                ●
              </span>

              <div>
                <span>ORIGIN</span>
                <strong>{shipment.origin}</strong>
              </div>

            </div>


            <div className="route-line">

              <div className="route-progress">
                <span
                  style={{
                    width: `${shipment.progress}%`,
                  }}
                ></span>
              </div>

              <div className="truck-marker">
                🚚
              </div>

            </div>


            <div className="route-location destination">

              <span className="route-marker destination-marker">
                ●
              </span>

              <div>
                <span>DESTINATION</span>
                <strong>{shipment.destination}</strong>
              </div>

            </div>

          </div>


          {/* CURRENT LOCATION */}

          <div className="current-location">

            <div className="live-indicator">
              <span></span>
              LIVE
            </div>

            <div>
              <span>Current Location</span>
              <strong>{shipment.currentLocation}</strong>
            </div>

            <div className="progress-value">
              {shipment.progress}% complete
            </div>

          </div>

        </section>


        {/* ==========================================
            STAT CARDS
        ========================================== */}

        <section className="tracking-stats">

          <div className="tracking-stat-card orange">

            <span>Estimated Delivery</span>

            <strong>
              {shipment.eta}
            </strong>

            <small>
              Expected arrival
            </small>

          </div>


          <div className="tracking-stat-card purple">

            <span>Pickup Date</span>

            <strong>
              {shipment.pickup}
            </strong>

            <small>
              Shipment collected
            </small>

          </div>


          <div className="tracking-stat-card green">

            <span>Transport Mode</span>

            <strong>
              {shipment.mode}
            </strong>

            <small>
              Current delivery mode
            </small>

          </div>


          <div className="tracking-stat-card pink">

            <span>Package Weight</span>

            <strong>
              {shipment.weight}
            </strong>

            <small>
              {shipment.quantity} package(s)
            </small>

          </div>

        </section>


        {/* ==========================================
            TWO COLUMN CONTENT
        ========================================== */}

        <section className="tracking-content-grid">


          {/* ========================================
              TRACKING TIMELINE
          ======================================== */}

          <div className="tracking-panel timeline-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  SHIPMENT JOURNEY
                </span>

                <h2>Tracking Timeline</h2>
              </div>

              <span className="event-count">
                {shipment.events.length} Events
              </span>

            </div>


            <div className="timeline">

              {shipment.events.map((event, index) => (

                <div
                  className={`timeline-item ${
                    event.active ? "active" : ""
                  }`}
                  key={index}
                >

                  <div className="timeline-marker">
                    {event.active ? "●" : "✓"}
                  </div>

                  <div className="timeline-line"></div>

                  <div className="timeline-content">

                    <div className="timeline-date">
                      {event.date} · {event.time}
                    </div>

                    <h3>{event.title}</h3>

                    <p>
                      {event.location}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* ========================================
              SHIPMENT DETAILS
          ======================================== */}

          <div className="tracking-panel details-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  SHIPMENT DETAILS
                </span>

                <h2>Package Information</h2>
              </div>

            </div>


            <div className="detail-list">

              <div className="detail-row">
                <span>Customer</span>
                <strong>
                  {shipment.customer}
                </strong>
              </div>

              <div className="detail-row">
                <span>Package Type</span>
                <strong>
                  {shipment.packageType}
                </strong>
              </div>

              <div className="detail-row">
                <span>Quantity</span>
                <strong>
                  {shipment.quantity}
                </strong>
              </div>

              <div className="detail-row">
                <span>Total Weight</span>
                <strong>
                  {shipment.weight}
                </strong>
              </div>

              <div className="detail-row">
                <span>Driver</span>
                <strong>
                  {shipment.driver}
                </strong>
              </div>

              <div className="detail-row">
                <span>Vehicle</span>
                <strong>
                  {shipment.vehicle}
                </strong>
              </div>

              <div className="detail-row">
                <span>Transport</span>
                <strong>
                  {shipment.mode}
                </strong>
              </div>

            </div>


            <Link
              to="/business/shipment-management"
              className="view-shipment-button"
            >
              View Shipment Management
            </Link>

          </div>

        </section>


        {/* ==========================================
            FOOTER
        ========================================== */}

        <footer className="business-footer">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default BusinessTracking;