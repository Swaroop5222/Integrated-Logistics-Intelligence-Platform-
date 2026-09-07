import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./BusinessTracking.css";
import { apiRequest } from "../api";

function BusinessTracking() {
  const [searchParams] = useSearchParams();

  const initialTracking = searchParams.get("trackingNumber") || "";

  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [searchedTracking, setSearchedTracking] = useState(initialTracking);
  const [liveShipment, setLiveShipment] = useState(null);
  // "idle" -> nothing searched yet, "loading", "found", "notfound"
  const [trackingState, setTrackingState] = useState(
    initialTracking ? "loading" : "idle"
  );

  useEffect(() => {
    let active = true;

    async function fetchLiveShipment() {
      if (!searchedTracking.trim()) {
        setTrackingState("idle");
        return;
      }

      setTrackingState("loading");

      try {
        const data = await apiRequest(
          `/api/shipments/track/${encodeURIComponent(searchedTracking.trim())}`
        );

        if (!active) return;

        // Pull the real status history for this shipment instead of
        // fabricating timeline events from just createdAt/updatedAt.
        let historyEvents = [];
        try {
          const history = await apiRequest(
            `/api/shipments/${data.id}/history`
          );
          historyEvents = (history || [])
            .slice()
            .reverse()
            .map((h, index) => ({
              date: h.createdAt ? new Date(h.createdAt).toLocaleDateString() : "",
              time: h.createdAt ? new Date(h.createdAt).toLocaleTimeString() : "",
              title: `Status: ${String(h.status || "").replaceAll("_", " ")}`,
              location:
                h.remarks ||
                (h.updatedByName ? `Updated by ${h.updatedByName}` : "Logistics Network"),
              active: index === 0,
            }));
        } catch {
          // If history can't be fetched (e.g. not visible to this user),
          // fall back to nothing rather than inventing events.
          historyEvents = [];
        }

        if (!active) return;

        const statusStr = String(data.status || "CREATED").replaceAll("_", " ");
        const progressVal =
          data.status === "DELIVERED"
            ? 100
            : data.status === "OUT_FOR_DELIVERY"
            ? 85
            : data.status === "IN_TRANSIT"
            ? 60
            : data.status === "PICKED_UP"
            ? 35
            : data.status === "CANCELLED"
            ? 0
            : 15;

        setLiveShipment({
          order: data.referenceId || `SHIP-${data.id}`,
          customer: data.customerName || data.receiverName || "Client Customer",
          origin: data.senderAddress || "Origin",
          destination: data.receiverAddress || "Destination",
          currentLocation:
            data.status === "DELIVERED"
              ? data.receiverAddress
              : data.status === "CANCELLED"
              ? "Cancelled"
              : "In Transit / Hub",
          status: statusStr,
          progress: progressVal,
          eta: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "Pending",
          pickup: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "Pending",
          weight: `${data.packageWeightKg || 1} kg`,
          packageType: data.packageDescription || "Box",
          quantity: 1,
          driver: data.assignedOperatorName || "Operations Logistics",
          vehicle: "Fleet Transport",
          mode: "Road Transport",
          events: historyEvents,
        });
        setTrackingState("found");
      } catch {
        if (active) {
          setLiveShipment(null);
          setTrackingState("notfound");
        }
      }
    }

    fetchLiveShipment();

    return () => {
      active = false;
    };
  }, [searchedTracking]);

  const shipment = liveShipment;

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
              placeholder="Enter tracking ID e.g. STP-2026-00001"
            />

            <button type="submit">
              Track Shipment
            </button>

          </form>

        </section>


        {/* ==========================================
            IDLE / LOADING / NOT FOUND STATES
        ========================================== */}

        {trackingState !== "found" && (
          <section className="tracking-overview-card">
            <div className="tracking-overview-top">
              <div>
                {trackingState === "idle" && (
                  <>
                    <h2>Track a shipment</h2>
                    <p>Enter a tracking ID above to view live shipment details.</p>
                  </>
                )}

                {trackingState === "loading" && (
                  <>
                    <h2>Looking up {searchedTracking}...</h2>
                    <p>Fetching the latest shipment information.</p>
                  </>
                )}

                {trackingState === "notfound" && (
                  <>
                    <h2>Shipment Not Found</h2>
                    <p>
                      We couldn't find a shipment matching "{searchedTracking}",
                      or you don't have permission to view it.
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>
        )}


        {/* ==========================================
            SHIPMENT HEADER
        ========================================== */}

        {trackingState === "found" && shipment && (
        <>
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
        </>
        )}


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