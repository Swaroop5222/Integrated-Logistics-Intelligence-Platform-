import { Link } from "react-router-dom";
import "./Notifications.css";

const notifications = [
  {
    icon: "✓",
    type: "success",
    title: "Shipment delivered",
    message:
      "TRK-2026-001 has been successfully delivered to Bangalore.",
    time: "2 hours ago",
    unread: true,
  },
  {
    icon: "→",
    type: "info",
    title: "Shipment in transit",
    message:
      "TRK-2026-006 is currently moving toward your destination.",
    time: "5 hours ago",
    unread: true,
  },
  {
    icon: "!",
    type: "warning",
    title: "Delivery update",
    message:
      "Estimated delivery time for TRK-2026-004 has been updated.",
    time: "Yesterday",
    unread: false,
  },
  {
    icon: "✓",
    type: "success",
    title: "Shipment picked up",
    message:
      "TRK-2026-007 has been picked up from the origin facility.",
    time: "Yesterday",
    unread: false,
  },
  {
    icon: "i",
    type: "info",
    title: "Tracking available",
    message:
      "Live tracking is now available for your latest shipment.",
    time: "2 days ago",
    unread: false,
  },
];

function Notifications() {
  return (
    <div className="notifications-page">
      {/* SIDEBAR */}
      <aside className="notifications-sidebar">
        <div className="notifications-logo">
          <div className="notifications-logo-icon">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="notifications-menu-title">CUSTOMER</div>

        <nav>
          <Link
            to="/dashboard/customer"
            className="notifications-nav-link"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/shipments/active"
            className="notifications-nav-link"
          >
            <span>▣</span>
            Active Shipments
          </Link>

          <Link
            to="/shipments/history"
            className="notifications-nav-link"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link to="/tracking" className="notifications-nav-link">
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/notifications"
            className="notifications-nav-link active"
          >
            <span>♢</span>
            Notifications
          </Link>

          <Link
            to="/tracking-insights"
            className="notifications-nav-link"
          >
            <span>▥</span>
            Tracking Insights
          </Link>
        </nav>

        <div className="notifications-sidebar-bottom">
          <Link to="/login" className="notifications-logout">
            ⇥ Logout
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="notifications-main">
        <header className="notifications-header">
          <div>
            <div className="notifications-breadcrumb">
              Customer / Notifications
            </div>

            <h1>Notifications</h1>

            <p>Stay updated with your shipment activity.</p>
          </div>

          <div className="notifications-avatar">R</div>
        </header>

        {/* TOP CARD */}
        <section className="notifications-summary">
          <div>
            <span>NOTIFICATION CENTER</span>
            <h2>Shipment Updates</h2>
            <p>You have 2 unread notifications.</p>
          </div>

          <button className="mark-read-btn">
            Mark all as read
          </button>
        </section>

        {/* LIST */}
        <section className="notifications-panel">
          <div className="notifications-panel-header">
            <h2>Recent Notifications</h2>

            <span>{notifications.length} updates</span>
          </div>

          <div className="notification-list">
            {notifications.map((notification, index) => (
              <div
                className={`notification-item ${
                  notification.unread ? "unread" : ""
                }`}
                key={index}
              >
                <div
                  className={`notification-icon ${notification.type}`}
                >
                  {notification.icon}
                </div>

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>{notification.title}</h3>

                    {notification.unread && (
                      <span className="unread-dot"></span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <span className="notification-time">
                    {notification.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="notifications-footer">
          © 2026 ShipTrack Pro · Integrated Logistics Intelligence Platform
        </footer>
      </main>
    </div>
  );
}

export default Notifications;