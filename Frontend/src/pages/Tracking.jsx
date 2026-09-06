import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Tracking.css";

function Tracking() {
  const [searchParams] = useSearchParams();

  const initialNumber =
    searchParams.get("trackingNumber") || "TRK-2026-001";

  const [trackingNumber, setTrackingNumber] = useState(initialNumber);
  const [searchedNumber, setSearchedNumber] = useState(initialNumber);

  const handleSearch = (e) => {
    e.preventDefault();

    if (trackingNumber.trim()) {
      setSearchedNumber(trackingNumber.trim());
    }
  };

  return (
    <div className="tracking-page">
      {/* SIDEBAR */}
      <aside className="tracking-sidebar">
        <div className="tracking-logo">
          <div className="tracking-logo-icon">S</div>
          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="tracking-menu-title">CUSTOMER</div>

        <nav>
          <Link to="/dashboard/customer" className="tracking-nav-link">
            <span>⌂</span>
            Overview
          </Link>

          <Link to="/shipments/active" className="tracking-nav-link">
            <span>▣</span>
            Active Shipments
          </Link>

          <Link to="/shipments/history" className="tracking-nav-link">
            <span>◷</span>
            Shipment History
          </Link>

          <Link to="/tracking" className="tracking-nav-link active">
            <span>⌖</span>
            Tracking
          </Link>

          <Link to="/notifications" className="tracking-nav-link">
            <span>♢</span>
            Notifications
          </Link>

          <Link to="/tracking-insights" className="tracking-nav-link">
            <span>▥</span>
            Tracking Insights
          </Link>
        </nav>

        <div className="tracking-sidebar-bottom">
          <Link to="/login" className="tracking-logout">
            ⇥ Logout
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="tracking-main">
        <header className="tracking-header">
          <div>
            <div className="tracking-breadcrumb">
              Customer / Tracking
            </div>

            <h1>Track Shipment</h1>

            <p>
              Follow your shipment location, delivery status and ETA.
            </p>
          </div>

          <div className="tracking-avatar">R</div>
        </header>

        {/* SEARCH */}
        <section className="tracking-search-card">
          <div>
            <span className="tracking-search-label">
              TRACKING NUMBER
            </span>

            <h2>Where is your shipment?</h2>
          </div>

          <form onSubmit={handleSearch} className="tracking-search-form">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
            />

            <button type="submit">Track Shipment</button>
          </form>
        </section>

        {/* SHIPMENT */}
        <section className="tracking-panel">
          <div className="tracking-panel-header">
            <div>
              <span>TRACKING ID</span>
              <h2>{searchedNumber}</h2>
            </div>

            <div className="tracking-live">
              <span></span>
              LIVE TRACKING
            </div>
          </div>

          {/* STATUS */}
          <div className="tracking-current-status">
            <div className="tracking-status-icon">✓</div>

            <div>
              <span>Current Status</span>
              <h2>In Transit</h2>
              <p>Shipment is moving toward the destination.</p>
            </div>

            <div className="tracking-eta">
              <span>ESTIMATED DELIVERY</span>
              <strong>Sep 04, 2026</strong>
              <small>By 6:00 PM</small>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="tracking-timeline">
            <div className="timeline-step completed">
              <div className="timeline-dot">✓</div>
              <div>
                <strong>Shipment Picked Up</strong>
                <span>Hyderabad · Aug 31, 09:30 AM</span>
              </div>
            </div>

            <div className="timeline-line"></div>

            <div className="timeline-step completed">
              <div className="timeline-dot">✓</div>
              <div>
                <strong>Departed Facility</strong>
                <span>Bangalore Hub · Sep 01, 06:20 AM</span>
              </div>
            </div>

            <div className="timeline-line"></div>

            <div className="timeline-step current">
              <div className="timeline-dot">●</div>
              <div>
                <strong>In Transit</strong>
                <span>NH 44 · Shipment moving normally</span>
              </div>
            </div>

            <div className="timeline-line"></div>

            <div className="timeline-step">
              <div className="timeline-dot">4</div>
              <div>
                <strong>Out for Delivery</strong>
                <span>Pending</span>
              </div>
            </div>

            <div className="timeline-line"></div>

            <div className="timeline-step">
              <div className="timeline-dot">5</div>
              <div>
                <strong>Delivered</strong>
                <span>Pending</span>
              </div>
            </div>
          </div>
        </section>

        {/* DETAILS */}
        <section className="tracking-details-grid">
          <div className="tracking-detail-card">
            <span>ORIGIN</span>
            <strong>Hyderabad</strong>
            <small>Telangana, India</small>
          </div>

          <div className="tracking-detail-card">
            <span>DESTINATION</span>
            <strong>Bangalore</strong>
            <small>Karnataka, India</small>
          </div>

          <div className="tracking-detail-card">
            <span>PACKAGE</span>
            <strong>Electronics</strong>
            <small>2.5 kg · 1 package</small>
          </div>

          <div className="tracking-detail-card">
            <span>DELIVERY TYPE</span>
            <strong>Express</strong>
            <small>Priority delivery</small>
          </div>
        </section>

        <footer className="tracking-footer">
          © 2026 ShipTrack Pro · Integrated Logistics Intelligence Platform
        </footer>
      </main>
    </div>
  );
}

export default Tracking;