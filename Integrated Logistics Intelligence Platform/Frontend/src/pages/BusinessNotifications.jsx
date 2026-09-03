import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./BusinessNotifications.css";

const notificationsData = [
  {
    id: 1,
    type: "delay",
    title: "Shipment Delay Alert",
    message:
      "Shipment TRK-2026-103 is delayed due to traffic conditions on the Hyderabad–Bengaluru route.",
    time: "10 minutes ago",
    unread: true,
  },
  {
    id: 2,
    type: "delivery",
    title: "Shipment Delivered",
    message:
      "Shipment TRK-2026-101 has been successfully delivered to the receiver.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    type: "shipment",
    title: "Shipment Created",
    message:
      "New shipment TRK-2026-105 has been successfully created and is ready for pickup.",
    time: "2 hours ago",
    unread: false,
  },
  {
    id: 4,
    type: "route",
    title: "Route Update",
    message:
      "The Mumbai–Pune route has been updated. Estimated transit time has changed.",
    time: "4 hours ago",
    unread: false,
  },
  {
    id: 5,
    type: "performance",
    title: "Delivery Performance Update",
    message:
      "Your monthly on-time delivery rate is currently 92.6%.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 6,
    type: "system",
    title: "System Notification",
    message:
      "Shipment tracking services are operating normally.",
    time: "Yesterday",
    unread: false,
  },
];

function BusinessNotifications() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(notificationsData);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => item.unread);
    }

    return notifications;
  }, [filter, notifications]);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unread: false } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        unread: false,
      }))
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "delay":
        return "⚠";
      case "delivery":
        return "✓";
      case "shipment":
        return "📦";
      case "route":
        return "↗";
      case "performance":
        return "◈";
      default:
        return "●";
    }
  };

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

            {unreadCount > 0 && (
              <span className="nav-notification-count">
                {unreadCount}
              </span>
            )}
          </Link>

        </nav>

        <div className="business-sidebar-bottom">

          <div className="business-user-card">
            <div className="business-avatar">BC</div>

            <div>
              <strong>Business Client</strong>
              <span>Premium Account</span>
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
              Stay updated with shipment activity, delays and logistics events.
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

        {/* SUMMARY */}
        <section className="notification-summary">

          <div className="notification-summary-card">
            <span className="summary-icon">♢</span>

            <div>
              <span>Total Notifications</span>
              <strong>{notifications.length}</strong>
            </div>
          </div>

          <div className="notification-summary-card unread-summary">
            <span className="summary-icon">●</span>

            <div>
              <span>Unread</span>
              <strong>{unreadCount}</strong>
            </div>
          </div>

          <div className="notification-summary-card">
            <span className="summary-icon">⚠</span>

            <div>
              <span>Alerts</span>
              <strong>
                {
                  notifications.filter(
                    (item) => item.type === "delay"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="notification-summary-card">
            <span className="summary-icon">✓</span>

            <div>
              <span>Updates</span>
              <strong>
                {
                  notifications.filter(
                    (item) =>
                      item.type === "delivery" ||
                      item.type === "shipment"
                  ).length
                }
              </strong>
            </div>
          </div>

        </section>

        {/* NOTIFICATION PANEL */}
        <section className="notifications-panel">

          <div className="notifications-panel-header">

            <div>
              <h2>Recent Notifications</h2>
              <p>
                Latest updates from your logistics operations
              </p>
            </div>

            <button
              className="mark-all-btn"
              onClick={markAllAsRead}
            >
              ✓ Mark all as read
            </button>

          </div>

          {/* FILTERS */}
          <div className="notification-filters">

            <button
              className={filter === "all" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              className={
                filter === "unread"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setFilter("unread")}
            >
              Unread
              {unreadCount > 0 && (
                <span>{unreadCount}</span>
              )}
            </button>

          </div>

          {/* LIST */}
          <div className="notifications-list">

            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (

                <div
                  key={notification.id}
                  className={
                    notification.unread
                      ? "notification-item unread"
                      : "notification-item"
                  }
                  onClick={() => markAsRead(notification.id)}
                >

                  <div
                    className={`notification-icon ${notification.type}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  <div className="notification-content">

                    <div className="notification-title-row">

                      <h3>{notification.title}</h3>

                      {notification.unread && (
                        <span className="new-badge">
                          NEW
                        </span>
                      )}

                    </div>

                    <p>{notification.message}</p>

                    <span className="notification-time">
                      {notification.time}
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

                <h3>You're all caught up</h3>

                <p>
                  There are no unread notifications right now.
                </p>

              </div>

            )}

          </div>

        </section>

        {/* NOTIFICATION INFO */}
        <section className="notification-info-grid">

          <div className="info-card">

            <div className="info-card-icon">
              ⚡
            </div>

            <div>
              <h3>Real-time Updates</h3>
              <p>
                Important shipment and delivery events will appear here.
              </p>
            </div>

          </div>

          <div className="info-card">

            <div className="info-card-icon">
              ⚠
            </div>

            <div>
              <h3>Delay Alerts</h3>
              <p>
                Stay informed about shipment delays and route disruptions.
              </p>
            </div>

          </div>

          <div className="info-card">

            <div className="info-card-icon">
              ✓
            </div>

            <div>
              <h3>Delivery Updates</h3>
              <p>
                Receive updates when shipments reach important milestones.
              </p>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default BusinessNotifications;