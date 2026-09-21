import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import "./TrackingInsights.css";

/* =========================
   HELPERS
========================= */

function normalizeArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.shipments)) {
    return data.shipments;
  }

  return [];
}

function getStatus(shipment) {
  return String(shipment?.status || "").toUpperCase();
}

function getUserName(user) {
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
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

/* =========================
   COMPONENT
========================= */

function TrackingInsights() {
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     LOAD LOGGED-IN USER
  ========================= */

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const userData =
          await apiRequest("/api/users/me");

        if (!active) {
          return;
        }

        setUser(userData);
      } catch (err) {
        console.error(
          "Failed to load logged-in user:",
          err
        );
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  /* =========================
     LOAD SHIPMENTS
  ========================= */

  useEffect(() => {
    let active = true;

    async function loadShipments() {
      try {
        setLoading(true);
        setError("");

        const data =
          await apiRequest("/api/shipments");

        if (!active) {
          return;
        }

        setShipments(normalizeArray(data));
      } catch (err) {
        console.error(
          "Failed to load shipments:",
          err
        );

        if (active) {
          setError(
            err?.message ||
              "Failed to load shipment data."
          );

          setShipments([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadShipments();

    return () => {
      active = false;
    };
  }, []);

  /* =========================
     STATUS COUNTS
  ========================= */

  const statusCounts = useMemo(() => {
    const counts = {
      total: shipments.length,
      inTransit: 0,
      delivered: 0,
      delayed: 0,
      pending: 0,
    };

    shipments.forEach((shipment) => {
      const status = getStatus(shipment);

      switch (status) {
        case "IN_TRANSIT":
        case "OUT_FOR_DELIVERY":
          counts.inTransit += 1;
          break;

        case "DELIVERED":
          counts.delivered += 1;
          break;

        case "FAILED_DELIVERY":
        case "DELAYED":
          counts.delayed += 1;
          break;

        case "CREATED":
        case "PICKED_UP":
          counts.pending += 1;
          break;

        default:
          break;
      }
    });

    return counts;
  }, [shipments]);

  /* =========================
     ACTIVE SHIPMENTS
  ========================= */

  const activeShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const status = getStatus(shipment);

      return [
        "CREATED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
      ].includes(status);
    });
  }, [shipments]);

  /* =========================
     BACKEND DATA AVAILABILITY
  ========================= */

  /*
   * The current backend does not provide:
   *
   * - expected delivery time
   * - actual delivery duration
   * - monthly historical on-time percentage
   * - Express vs Standard performance
   *
   * Therefore these values are NOT fabricated.
   */

  const onTimeDelivery =
    "Data unavailable";

  const averageDeliveryTime =
    "Data unavailable";

  const monthlyTrend = [
    { month: "Apr", value: null },
    { month: "May", value: null },
    { month: "Jun", value: null },
    { month: "Jul", value: null },
    { month: "Aug", value: null },
    { month: "Sep", value: null },
  ];

  return (
    <div className="insights-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="insights-sidebar">

        <div className="insights-logo">
          <div className="insights-logo-icon">
            S
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="insights-menu-title">
          CUSTOMER
        </div>

        <nav>

          <Link
            to="/dashboard/customer"
            className="insights-nav-link"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/shipments/active"
            className="insights-nav-link"
          >
            <span>▣</span>
            Active Shipments
          </Link>

          <Link
            to="/shipments/history"
            className="insights-nav-link"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/tracking"
            className="insights-nav-link"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/notifications"
            className="insights-nav-link"
          >
            <span>♢</span>
            Notifications
          </Link>

          <Link
            to="/tracking-insights"
            className="insights-nav-link active"
          >
            <span>▥</span>
            Tracking Insights
          </Link>

        </nav>

        <div className="insights-sidebar-bottom">
          <Link
            to="/login"
            className="insights-logout"
          >
            ⇥ Logout
          </Link>
        </div>

      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="insights-main">

        {/* =========================
            HEADER
        ========================= */}

        <header className="insights-header">

          <div>

            <div className="insights-breadcrumb">
              Customer / Tracking Insights
            </div>

            <h1>
              Tracking Insights
            </h1>

            <p>
              Understand your shipment performance
              and delivery trends.
            </p>

          </div>

          {/* DYNAMIC LOGGED-IN PROFILE */}

          <div
            className="insights-avatar"
            title={getUserName(user)}
          >
            {user
              ? getUserInitials(user)
              : "..."}
          </div>

        </header>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 18px",
              borderRadius: "10px",
              background:
                "rgba(255,83,58,0.08)",
              border:
                "1px solid rgba(255,83,58,0.2)",
              color: "#ff8b78",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {/* =========================
            STATS
        ========================= */}

        <section className="insights-stats">

          {/* ON-TIME */}

          <div className="insight-stat-card">

            <span>
              ON-TIME DELIVERY
            </span>

            <strong>
              {onTimeDelivery}
            </strong>

            <small>
              Based on delivered shipments
            </small>

          </div>

          {/* AVG DELIVERY */}

          <div className="insight-stat-card">

            <span>
              AVG. DELIVERY TIME
            </span>

            <strong>
              {averageDeliveryTime}
            </strong>

            <small>
              Backend does not provide
              delivery duration
            </small>

          </div>

          {/* ACTIVE */}

          <div className="insight-stat-card">

            <span>
              ACTIVE SHIPMENTS
            </span>

            <strong>
              {loading
                ? "..."
                : activeShipments.length}
            </strong>

            <small>
              Current active shipment records
            </small>

          </div>

          {/* DELIVERED */}

          <div className="insight-stat-card">

            <span>
              SUCCESSFUL DELIVERIES
            </span>

            <strong>
              {loading
                ? "..."
                : statusCounts.delivered}
            </strong>

            <small>
              Out of{" "}
              {loading
                ? "..."
                : statusCounts.total}{" "}
              shipments
            </small>

          </div>

        </section>

        {/* =========================
            MAIN GRID
        ========================= */}

        <div className="insights-grid">

          {/* =========================
              DELIVERY PERFORMANCE
          ========================= */}

          <section className="insights-panel">

            <div className="insights-panel-header">

              <div>

                <span>
                  DELIVERY PERFORMANCE
                </span>

                <h2>
                  Shipment delivery trend
                  over the last 6 months.
                </h2>

              </div>

              <div className="insights-period">
                Last 6 months
              </div>

            </div>

            <div className="fake-chart">

              <div className="chart-grid">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              <div className="chart-bars">

                {monthlyTrend.map(
                  (item) => (
                    <div
                      className="chart-bar"
                      key={item.month}
                    >

                      {item.value !== null ? (
                        <span
                          style={{
                            height: `${item.value}%`,
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            height: "0%",
                            minHeight: "15px",
                            opacity: 0.25,
                          }}
                        />
                      )}

                      <small>
                        {item.month}
                      </small>

                    </div>
                  )
                )}

              </div>

            </div>

            <p
              style={{
                padding:
                  "0 25px 20px",
                margin: 0,
                color: "#656d80",
                fontSize: "11px",
              }}
            >
              Historical monthly delivery
              performance is not available
              from the current backend.
            </p>

          </section>

          {/* =========================
              SHIPMENT STATUS
          ========================= */}

          <section className="insights-panel">

            <div className="insights-panel-header">

              <div>

                <span>
                  SHIPMENT STATUS
                </span>

                <h2>
                  Current shipment distribution
                </h2>

              </div>

            </div>

            <div className="status-breakdown">

              <div>

                <span className="status-dot transit" />

                <label>
                  In Transit
                </label>

                <strong>
                  {loading
                    ? "..."
                    : statusCounts.inTransit}
                </strong>

              </div>

              <div>

                <span className="status-dot delivered" />

                <label>
                  Delivered
                </label>

                <strong>
                  {loading
                    ? "..."
                    : statusCounts.delivered}
                </strong>

              </div>

              <div>

                <span className="status-dot delayed" />

                <label>
                  Delayed
                </label>

                <strong>
                  {loading
                    ? "..."
                    : statusCounts.delayed}
                </strong>

              </div>

              <div>

                <span className="status-dot pending" />

                <label>
                  Pending
                </label>

                <strong>
                  {loading
                    ? "..."
                    : statusCounts.pending}
                </strong>

              </div>

            </div>

          </section>

        </div>

        {/* =========================
            BOTTOM INSIGHTS
        ========================= */}

        <div className="insight-bottom-grid">

          {/* DELIVERY PERFORMANCE */}

          <div className="insight-highlight">

            <span>
              DELIVERY PERFORMANCE
            </span>

            <h2>
              Performance insights unavailable.
            </h2>

            <p>
              The current backend does not
              provide shipment-type performance
              data required to compare Express
              and Standard delivery performance.
            </p>

            <Link to="/shipments/history">
              View shipment history →
            </Link>

          </div>

          {/* TRACKING VISIBILITY */}

          <div className="insight-highlight purple">

            <span>
              TRACKING VISIBILITY
            </span>

            <h2>
              Real-time tracking is available.
            </h2>

            <p>
              You can follow the latest location
              and tracking information for
              shipments supported by the live
              tracking backend.
            </p>

            <Link to="/tracking">
              Track a shipment →
            </Link>

          </div>

        </div>

        {/* =========================
            FOOTER
        ========================= */}

        <footer className="insights-footer">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default TrackingInsights;