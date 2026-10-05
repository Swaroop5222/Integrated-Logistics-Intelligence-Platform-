import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import "./BusinessNotifications.css";

function BusinessNotifications() {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadActivities() {
      try {
        const [currentUser, shipments] = await Promise.all([
          apiRequest("/api/users/me"),
          apiRequest("/api/shipments"),
        ]);
        if (!active) return;

        setUser(currentUser);
        const shipmentList = Array.isArray(shipments) ? shipments : [];
        const histories = await Promise.all(
          shipmentList
            .filter((shipment) => shipment?.id)
            .map(async (shipment) => {
              const result = await apiRequest(
                `/api/shipments/${shipment.id}/history`
              );
              return (Array.isArray(result) ? result : []).map((event) => ({
                ...event,
                trackingNumber: shipment.trackingNumber,
              }));
            })
        );
        if (!active) return;

        setActivities(
          histories
            .flat()
            .sort((a, b) =>
              new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            )
        );
      } catch (loadError) {
        console.error("Failed to load shipment activity:", loadError);
        if (active) {
          setActivities([]);
          setError(loadError.message || "Unable to load shipment activity.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadActivities();
    return () => {
      active = false;
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "DELIVERED":
        return "✓";
      case "IN_TRANSIT":
        return "↗";
      default:
        return "▣";
    }
  };

  const userName =
    user?.fullName || user?.name || user?.email || "Business Client";

  return (
    <div className="business-notifications-page">

      {/* SIDEBAR */}
      <aside className="business-sidebar">

        <div className="business-brand">
          <div className="brand-logo">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>Business Portal</span>
          </div>
        </div>

        <nav className="business-nav">

          <Link to="/dashboard/business" className="business-nav-link">
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
            <span>▤</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="business-nav-link"
          >
            <span>◎</span>
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
            <span>△</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-nav-link"
          >
            <span>⌁</span>
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

          <Link
            to="/business/notifications"
            className="business-nav-link active"
          >
            <span>♢</span>
            Notifications
          </Link>

        </nav>

        <div className="business-sidebar-bottom">

          <div className="business-user-card">
            <div className="business-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{userName}</strong>
              <span>Business Client</span>
            </div>
          </div>

          <Link to="/login" className="business-logout">
            <span>↪</span>
            Logout
          </Link>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="business-notifications-main">

        {/* HEADER */}
        <header className="business-notifications-header">

          <div>
            <span className="page-eyebrow">
              BUSINESS CLIENT
            </span>

            <h1>Notifications</h1>

            <p>
              Shipment status activity recorded by the backend.
            </p>
          </div>

          <div className="header-actions">
            <Link
              to="/dashboard/business"
              className="back-dashboard-btn"
            >
              ← Dashboard
            </Link>
          </div>

        </header>

        {/* NOTIFICATION PANEL */}
        <section className="notifications-panel">

          <div className="notifications-panel-header">

            <div>
              <h2>Recent Notifications</h2>
              <p>
                Shipment status history for your shipments
              </p>
            </div>

          </div>

          {/* LIST */}
          <div className="notifications-list">

            {error ? (
              <div className="empty-notifications" role="alert">
                <h3>Unable to load shipment activity</h3>
                <p>{error}</p>
              </div>
            ) : loading ? (
              <div className="empty-notifications">
                <p>Loading shipment activity...</p>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => (

                <div
                  key={`${activity.shipmentId}-${activity.id}`}
                  className="notification-item"
                >

                  <div
                    className={`notification-icon ${String(activity.status || "").toLowerCase()}`}
                  >
                    {getIcon(activity.status)}
                  </div>

                  <div className="notification-content">

                    <div className="notification-title-row">

                      <h3>
                        {String(activity.status || "Shipment activity")
                          .replaceAll("_", " ")}
                      </h3>

                    </div>

                    <p>
                      {activity.remarks}
                      {activity.remarks && activity.trackingNumber ? " · " : ""}
                      {activity.trackingNumber}
                    </p>

                    <span className="notification-time">
                      {activity.createdAt
                        ? new Date(activity.createdAt).toLocaleString()
                        : ""}
                    </span>

                  </div>

                  <div className="notification-arrow">
                    →
                  </div>

                </div>

              ))
            ) : (

              <div className="empty-notifications">

                <div className="empty-icon">
                  ✓
                </div>

                <h3>No shipment activity recorded</h3>

                <p>
                  Status events will appear here when recorded for your shipments.
                </p>

              </div>

            )}

          </div>

        </section>

      </main>
    </div>
  );
}

export default BusinessNotifications;