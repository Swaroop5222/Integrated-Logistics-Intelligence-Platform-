import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Tracking.css";
import { apiRequest } from "../api";
import ShipmentMap from "../components/tracking/ShipmentMap";

function Tracking() {
  const [searchParams] = useSearchParams();

  const initialNumber =
    searchParams.get("trackingNumber") || "STP-2026-00001";

  const [trackingNumber, setTrackingNumber] = useState(initialNumber);
  const [searchedNumber, setSearchedNumber] = useState(initialNumber);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchTracking() {
      if (!searchedNumber.trim()) return;
      setLoading(true);
      setNotFound(false);

      try {
        const data = await apiRequest(`/api/shipments/track/${encodeURIComponent(searchedNumber.trim())}`);
        if (active) {
          setShipment(data);
          setNotFound(false);
        }
      } catch {
        if (active) {
          setShipment(null);
          setNotFound(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchTracking();

    return () => {
      active = false;
    };
  }, [searchedNumber]);

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
        {loading ? (
          <div className="tracking-panel" style={{ padding: "40px", textAlign: "center" }}>
            <p>Loading tracking information for {searchedNumber}...</p>
          </div>
        ) : notFound ? (
          <div className="tracking-panel" style={{ padding: "30px", textAlign: "center", color: "#f87171" }}>
            <h3>Shipment Not Found</h3>
            <p>No active shipment was found for tracking ID: <strong>{searchedNumber}</strong>. Please check your tracking number and try again.</p>
          </div>
        ) : (
          <section className="tracking-panel">
            <div className="tracking-panel-header">
              <div>
                <span>TRACKING ID</span>
                <h2>{shipment ? shipment.trackingNumber : searchedNumber}</h2>
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
                <h2>{shipment ? String(shipment.status).replaceAll("_", " ") : "In Transit"}</h2>
                <p>
                  {shipment?.status === "CANCELLED"
                    ? "This shipment has been cancelled."
                    : shipment?.status === "DELIVERED"
                      ? "Shipment has been delivered successfully."
                      : shipment?.status === "OUT_FOR_DELIVERY"
                        ? "Shipment is out for delivery to the destination."
                        : shipment?.status === "IN_TRANSIT"
                          ? "Shipment is moving toward the destination."
                          : shipment?.status === "PICKED_UP"
                            ? "Shipment has been picked up by the operator."
                            : "Shipment has been registered and is pending pickup."}
                </p>
              </div>

              <div className="tracking-eta">
                <span>LAST UPDATE</span>
                <strong>
                  {shipment?.updatedAt
                    ? new Date(shipment.updatedAt).toLocaleDateString()
                    : "Today"}
                </strong>
                <small>
                  {shipment?.updatedAt
                    ? new Date(shipment.updatedAt).toLocaleTimeString()
                    : "Latest Status"}
                </small>
              </div>
            </div>

            {/* TIMELINE */}
            <div className="tracking-timeline">
              <div
                className={`timeline-step ${shipment?.status ? "completed" : "completed"
                  }`}
              >
                <div className="timeline-dot">✓</div>
                <div>
                  <strong>Shipment Created</strong>
                  <span>
                    {shipment?.createdAt
                      ? new Date(shipment.createdAt).toLocaleDateString()
                      : "Registered"}
                  </span>
                </div>
              </div>

              <div className="timeline-line"></div>

              <div
                className={`timeline-step ${["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
                  shipment?.status
                )
                  ? "completed"
                  : shipment?.status === "CREATED"
                    ? "current"
                    : "completed"
                  }`}
              >
                <div className="timeline-dot">✓</div>
                <div>
                  <strong>Picked Up</strong>
                  <span>Facility Pickup</span>
                </div>
              </div>

              <div className="timeline-line"></div>

              <div
                className={`timeline-step ${["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
                  shipment?.status
                )
                  ? "completed"
                  : shipment?.status === "PICKED_UP"
                    ? "current"
                    : "current"
                  }`}
              >
                <div className="timeline-dot">●</div>
                <div>
                  <strong>In Transit</strong>
                  <span>En Route to Destination</span>
                </div>
              </div>

              <div className="timeline-line"></div>

              <div
                className={`timeline-step ${["OUT_FOR_DELIVERY", "DELIVERED"].includes(shipment?.status)
                  ? "completed"
                  : shipment?.status === "IN_TRANSIT"
                    ? "current"
                    : ""
                  }`}
              >
                <div className="timeline-dot">4</div>
                <div>
                  <strong>Out for Delivery</strong>
                  <span>Local Courier</span>
                </div>
              </div>

              <div className="timeline-line"></div>

              <div
                className={`timeline-step ${shipment?.status === "DELIVERED"
                  ? "completed"
                  : shipment?.status === "CANCELLED"
                    ? "cancelled"
                    : ""
                  }`}
              >
                <div className="timeline-dot">
                  {shipment?.status === "CANCELLED" ? "✕" : "5"}
                </div>
                <div>
                  <strong>
                    {shipment?.status === "CANCELLED"
                      ? "Cancelled"
                      : "Delivered"}
                  </strong>
                  <span>
                    {shipment?.status === "DELIVERED"
                      ? "Received"
                      : shipment?.status === "CANCELLED"
                        ? "Order Cancelled"
                        : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {!loading && <ShipmentMap shipment={shipment} />}

        {/* DETAILS */}
        <section className="tracking-details-grid">
          <div className="tracking-detail-card">
            <span>ORIGIN</span>
            <strong>{shipment?.senderAddress || "Hyderabad"}</strong>
            <small>{shipment?.senderName || "Sender"}</small>
          </div>

          <div className="tracking-detail-card">
            <span>DESTINATION</span>
            <strong>{shipment?.receiverAddress || "Bengaluru"}</strong>
            <small>{shipment?.receiverName || "Receiver"}</small>
          </div>

          <div className="tracking-detail-card">
            <span>PACKAGE</span>
            <strong>{shipment?.packageDescription || "General Goods"}</strong>
            <small>{shipment?.packageWeightKg ? `${shipment.packageWeightKg} kg` : "1.0 kg"}</small>
          </div>

          <div className="tracking-detail-card">
            <span>OPERATOR</span>
            <strong>{shipment?.assignedOperatorName || "Standard Logistics"}</strong>
            <small>{shipment?.businessClientName ? `Client: ${shipment.businessClientName}` : "Express Priority"}</small>
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