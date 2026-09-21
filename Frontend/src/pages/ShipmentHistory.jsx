import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ShipmentHistory.css";
import { apiRequest } from "../api";

const HISTORY_STATUSES = [
  "DELIVERED",
  "FAILED_DELIVERY",
  "CANCELLED",
];

function normalizeShipments(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.shipments)) return data.shipments;
  return [];
}

function getStatus(shipment) {
  return String(shipment?.status || "").toUpperCase();
}

function getTrackingNumber(shipment) {
  return (
    shipment?.trackingNumber ||
    shipment?.trackingId ||
    shipment?.id ||
    "Data unavailable"
  );
}

function getFrom(shipment) {
  return (
    shipment?.senderAddress ||
    shipment?.senderCity ||
    shipment?.origin ||
    "Data unavailable"
  );
}

function getTo(shipment) {
  return (
    shipment?.receiverAddress ||
    shipment?.receiverCity ||
    shipment?.destination ||
    "Data unavailable"
  );
}

function getType(shipment) {
  return (
    shipment?.packageType ||
    shipment?.packageCategory ||
    shipment?.category ||
    shipment?.shipmentType ||
    "Data unavailable"
  );
}

function formatStatus(status) {
  if (!status) return "Data unavailable";

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Data unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/* =========================
   LOGGED-IN USER HELPERS
========================= */

function getUserName(user) {
  if (!user) return "User";

  return (
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email ||
    "User"
  );
}

function getUserInitials(user) {
  const name = getUserName(user);

  if (!name || name === "User") {
    return "U";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function getUserRole(user) {
  if (!user?.role) return "CUSTOMER";

  return String(user.role)
    .replace("ROLE_", "")
    .replaceAll("_", " ");
}

function ShipmentHistory() {
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadShipmentHistory() {
      try {
        setLoading(true);
        setError("");

        const [userData, shipmentData] =
          await Promise.all([
            apiRequest("/api/users/me"),
            apiRequest("/api/shipments"),
          ]);

        if (!active) return;

        setUser(userData);

        const allShipments =
          normalizeShipments(shipmentData);

        const historyShipments =
          allShipments.filter((shipment) =>
            HISTORY_STATUSES.includes(
              getStatus(shipment)
            )
          );

        setShipments(historyShipments);
      } catch (err) {
        if (!active) return;

        setShipments([]);

        setError(
          err?.message ||
            "Unable to load shipment history."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadShipmentHistory();

    return () => {
      active = false;
    };
  }, []);

  const filteredShipments = useMemo(() => {
    if (filter === "ALL") {
      return shipments;
    }

    return shipments.filter(
      (shipment) =>
        getStatus(shipment) === filter
    );
  }, [shipments, filter]);

  const totalShipments = shipments.length;

  const deliveredCount = shipments.filter(
    (shipment) =>
      getStatus(shipment) === "DELIVERED"
  ).length;

  const successRate =
    totalShipments > 0
      ? (
          (deliveredCount / totalShipments) *
          100
        ).toFixed(1)
      : null;

  return (
    <div className="history-page">
      {/* SIDEBAR */}
      <aside className="history-sidebar">
        <div className="history-logo">
          <div className="logo-icon">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="history-menu-title">
          CUSTOMER
        </div>

        <nav>
          <Link
            to="/dashboard/customer"
            className="history-nav-link"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/shipments/active"
            className="history-nav-link"
          >
            <span>▣</span>
            Active Shipments
          </Link>

          <Link
            to="/shipments/history"
            className="history-nav-link active"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/tracking"
            className="history-nav-link"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/notifications"
            className="history-nav-link"
          >
            <span>♢</span>
            Notifications
          </Link>

          <Link
            to="/tracking-insights"
            className="history-nav-link"
          >
            <span>▥</span>
            Tracking Insights
          </Link>
        </nav>

        <div className="history-sidebar-bottom">
          <Link
            to="/login"
            className="history-logout"
          >
            ⇥ Logout
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="history-main">
        <header className="history-header">
          <div>
            <div className="history-breadcrumb">
              Customer / Shipment History
            </div>

            <h1>Shipment History</h1>

            <p>
              View and review your previously completed
              shipments.
            </p>
          </div>

          <div className="history-header-actions">
            <Link
              to="/notifications"
              className="history-icon-btn"
            >
              ♢
            </Link>

            {/* DYNAMIC LOGGED-IN USER */}
            <div
              className="history-avatar"
              title={getUserName(user)}
            >
              {user
                ? getUserInitials(user)
                : "..."}
            </div>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="history-stats">
          <div className="history-stat-card">
            <span>Total Shipments</span>

            <strong>
              {loading ? "..." : totalShipments}
            </strong>

            <small>
              Completed shipment records
            </small>
          </div>

          <div className="history-stat-card">
            <span>Delivered</span>

            <strong>
              {loading ? "..." : deliveredCount}
            </strong>

            <small>
              Successfully delivered
            </small>
          </div>

          <div className="history-stat-card">
            <span>Success Rate</span>

            <strong>
              {loading
                ? "..."
                : successRate !== null
                ? `${successRate}%`
                : "Data unavailable"}
            </strong>

            <small>
              Based on available shipment status
            </small>
          </div>

          <div className="history-stat-card">
            <span>Avg. Delivery</span>

            <strong>
              Data unavailable
            </strong>

            <small>
              Backend does not provide delivery duration
            </small>
          </div>
        </section>

        {/* TABLE */}
        <section className="history-panel">
          <div className="history-panel-header">
            <div>
              <h2>Completed Shipments</h2>

              <p>
                Shipment records from your account
              </p>
            </div>

            <select
              className="history-filter"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
            >
              <option value="ALL">
                All Shipments
              </option>

              <option value="DELIVERED">
                Delivered
              </option>

              <option value="FAILED_DELIVERY">
                Failed Delivery
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>
          </div>

          <div className="history-table-wrapper">
            {loading ? (
              <div className="no-results">
                Loading shipment history...
              </div>
            ) : error ? (
              <div className="no-results">
                {error}
              </div>
            ) : filteredShipments.length === 0 ? (
              <div className="no-results">
                No completed shipment history found.
              </div>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Route</th>
                    <th>Type</th>
                    <th>Shipped</th>
                    <th>Delivered</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredShipments.map(
                    (shipment) => {
                      const status =
                        getStatus(shipment);

                      const trackingNumber =
                        getTrackingNumber(shipment);

                      return (
                        <tr
                          key={
                            shipment.id ||
                            trackingNumber
                          }
                        >
                          <td>
                            <strong>
                              {trackingNumber}
                            </strong>
                          </td>

                          <td>
                            <div className="route-cell">
                              <span>
                                {getFrom(shipment)}
                              </span>

                              <b>→</b>

                              <span>
                                {getTo(shipment)}
                              </span>
                            </div>
                          </td>

                          <td>
                            {getType(shipment)}
                          </td>

                          <td>
                            {formatDate(
                              shipment.createdAt
                            )}
                          </td>

                          <td>
                            {status === "DELIVERED"
                              ? formatDate(
                                  shipment.updatedAt
                                )
                              : "Data unavailable"}
                          </td>

                          <td>
                            <span className="status-delivered">
                              ●{" "}
                              {formatStatus(status)}
                            </span>
                          </td>

                          <td>
                            <Link
                              to={`/tracking?trackingNumber=${encodeURIComponent(
                                trackingNumber
                              )}`}
                              className="history-view-btn"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <footer className="history-footer">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>
      </main>
    </div>
  );
}

export default ShipmentHistory;