import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import "./Reports.css";

const ACTIVE_STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
];

const DELAYED_STATUSES = [
  "FAILED_DELIVERY",
  "DELAYED",
];

function getArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.shipments)) return data.shipments;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getStatus(shipment) {
  return String(shipment?.status || "").toUpperCase();
}

function getTrackingNumber(shipment) {
  return (
    shipment?.trackingNumber ||
    shipment?.trackingId ||
    shipment?.referenceId ||
    `SHIPMENT-${shipment?.id ?? "N/A"}`
  );
}

function getCustomerName(shipment) {
  if (shipment?.customer?.name) {
    return shipment.customer.name;
  }

  if (shipment?.customer?.fullName) {
    return shipment.customer.fullName;
  }

  return "Data unavailable";
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Data unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name) {
  if (!name) return "BC";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function Reports() {
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [userResponse, shipmentResponse] = await Promise.all([
          apiRequest("/api/users/me"),
          apiRequest("/api/shipments"),
        ]);

        if (!mounted) return;

        setUser(userResponse || null);
        setShipments(getArray(shipmentResponse));
      } catch (err) {
        console.error("Reports page error:", err);

        if (mounted) {
          setError(err?.message || "Unable to load report data.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const total = shipments.length;

  const active = shipments.filter((shipment) =>
    ACTIVE_STATUSES.includes(getStatus(shipment))
  ).length;

  const delivered = shipments.filter(
    (shipment) => getStatus(shipment) === "DELIVERED"
  ).length;

  const delayed = shipments.filter((shipment) =>
    DELAYED_STATUSES.includes(getStatus(shipment))
  ).length;

  const cancelled = shipments.filter(
    (shipment) => getStatus(shipment) === "CANCELLED"
  ).length;

  const deliveryRate =
    total > 0 ? ((delivered / total) * 100).toFixed(1) : "0.0";

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email ||
    "Business Client";

  const initials = getInitials(userName);

  function handleLogout() {
    localStorage.removeItem("shiptrackToken");
    localStorage.removeItem("shiptrackUser");
    window.location.href = "/login";
  }

  function exportCsv() {
    if (!shipments.length) return;

    const headers = [
      "Tracking Number",
      "Customer",
      "Status",
      "Created At",
      "Updated At",
    ];

    const rows = shipments.map((shipment) => [
      getTrackingNumber(shipment),
      getCustomerName(shipment),
      formatStatus(getStatus(shipment)),
      formatDate(shipment?.createdAt),
      formatDate(shipment?.updatedAt),
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "shiptrack-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="reports-page">
        <main className="reports-main">
          <div style={{ padding: "40px" }}>
            <h1>Reports & Export</h1>
            <p>Loading shipment data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="reports-page">

      {/* SIDEBAR */}
      <aside className="business-sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>Business Portal</span>
          </div>
        </div>

        <div className="sidebar-section">

          <p className="sidebar-label">BUSINESS</p>

          <nav>
            <Link to="/business/dashboard" className="business-nav-link">
              <span className="nav-icon">⌂</span>
              Overview
            </Link>

            <Link to="/business/create-shipment" className="business-nav-link">
              <span className="nav-icon">＋</span>
              Create Shipment
            </Link>

            <Link to="/business/shipments" className="business-nav-link">
              <span className="nav-icon">▣</span>
              Shipment Management
            </Link>

            <Link to="/business/history" className="business-nav-link">
              <span className="nav-icon">◷</span>
              Shipment History
            </Link>

            <Link to="/business/packages" className="business-nav-link">
              <span className="nav-icon">▤</span>
              Package Information
            </Link>

            <Link to="/business/tracking" className="business-nav-link">
              <span className="nav-icon">⌖</span>
              Tracking
            </Link>

            <Link to="/business/performance" className="business-nav-link">
              <span className="nav-icon">◒</span>
              Delivery Performance
            </Link>

            <Link to="/business/delay-analysis" className="business-nav-link">
              <span className="nav-icon">!</span>
              Delay Analysis
            </Link>

            <Link to="/business/logistics" className="business-nav-link">
              <span className="nav-icon">◇</span>
              Logistics Overview
            </Link>

            <Link to="/business/customer-activity" className="business-nav-link">
              <span className="nav-icon">♙</span>
              Customer Activity
            </Link>

            <Link
              to="/business/reports"
              className="business-nav-link active"
            >
              <span className="nav-icon">▥</span>
              Reports & Export
            </Link>
          </nav>

        </div>

        <div className="sidebar-bottom">

          <div className="business-status">
            <span className="status-dot"></span>

            <div>
              <strong>Operational</strong>
              <small>All services running</small>
            </div>
          </div>

          <button
            type="button"
            className="business-logout"
            onClick={handleLogout}
          >
            <span className="nav-icon">↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="reports-main">

        {/* HEADER */}
        <header className="reports-topbar">

          <div>
            <span className="breadcrumb">
              Business Client / Reports & Export
            </span>

            <h1>Reports & Export</h1>

            <p>
              Generate reports using your current shipment data.
            </p>
          </div>

          <div className="topbar-right">

            <button
              type="button"
              className="topbar-notification"
              aria-label="Notifications"
            >
              ♧
            </button>

            <div className="business-user">

              <div className="user-avatar">
                {initials}
              </div>

              <div>
                <strong>{userName}</strong>
                <small>Business Client</small>
              </div>

            </div>

          </div>

        </header>

        {/* ERROR */}
        {error && (
          <div
            className="report-success"
            style={{
              color: "#ff6b6b",
              background: "rgba(255, 107, 107, 0.06)",
              borderColor: "rgba(255, 107, 107, 0.14)",
            }}
          >
            <span>!</span>
            {error}
          </div>
        )}

        {/* SUCCESS / STATUS */}
        {!error && (
          <div className="report-success">
            <span>✓</span>
            Report data loaded from the backend successfully.
          </div>
        )}

        {/* STATS */}
        <section className="report-stats">

          <div className="report-stat-card orange">
            <div className="report-stat-top">
              <span>Total Shipments</span>
              <div className="report-stat-icon">▣</div>
            </div>

            <h2>{total}</h2>
            <span className="report-stat-note">
              Current business shipments
            </span>
          </div>

          <div className="report-stat-card purple">
            <div className="report-stat-top">
              <span>Active Shipments</span>
              <div className="report-stat-icon">◌</div>
            </div>

            <h2>{active}</h2>
            <span className="report-stat-note">
              Currently active
            </span>
          </div>

          <div className="report-stat-card green">
            <div className="report-stat-top">
              <span>Delivered</span>
              <div className="report-stat-icon">✓</div>
            </div>

            <h2>{delivered}</h2>
            <span className="report-stat-note">
              Successfully delivered
            </span>
          </div>

          <div className="report-stat-card cyan">
            <div className="report-stat-top">
              <span>Delayed</span>
              <div className="report-stat-icon">!</div>
            </div>

            <h2>{delayed}</h2>
            <span className="report-stat-note">
              Failed delivery records
            </span>
          </div>

        </section>

        {/* GENERATE REPORT */}
        <section className="report-card generate-card">

          <div className="report-card-header">

            <div>
              <h3>Generate Report</h3>
              <p>
                Generate a report from the current shipment records.
              </p>
            </div>

            <span className="report-live">
              LIVE DATA
            </span>

          </div>

          <div className="generate-form">

            <div className="report-field">
              <label>REPORT TYPE</label>

              <select defaultValue="shipment">
                <option value="shipment">
                  Shipment Report
                </option>
              </select>
            </div>

            <div className="report-field">
              <label>STATUS</label>

              <select defaultValue="all">
                <option value="all">All Shipments</option>
                <option value="active">Active Shipments</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="report-field">
              <label>FORMAT</label>

              <select defaultValue="csv">
                <option value="csv">CSV</option>
              </select>
            </div>

            <button
              type="button"
              className="generate-button"
              onClick={exportCsv}
            >
              <span>↓</span>
              Generate
            </button>

          </div>

        </section>

        {/* REPORT LIST */}
        <section className="report-card reports-list-card">

          <div className="report-card-header">

            <div>
              <h3>Shipment Report</h3>
              <p>
                Current shipment records available from the backend.
              </p>
            </div>

            <span className="reports-count">
              {shipments.length} records
            </span>

          </div>

          <div className="reports-list">

            {shipments.length === 0 ? (
              <div className="report-item">
                <div className="report-details">
                  <strong>No shipment records available</strong>
                  <p>
                    No shipment data was returned by the backend.
                  </p>
                </div>
              </div>
            ) : (
              shipments.map((shipment) => {

                const status = getStatus(shipment);

                return (
                  <div
                    className="report-item"
                    key={shipment?.id ?? getTrackingNumber(shipment)}
                  >

                    <div className="report-file-icon">
                      ▤
                    </div>

                    <div className="report-details">

                      <strong>
                        {getTrackingNumber(shipment)}
                      </strong>

                      <p>
                        {getCustomerName(shipment)}
                      </p>

                      <div className="report-meta">

                        <span>
                          Status: {formatStatus(status)}
                        </span>

                        <span>
                          Created: {formatDate(shipment?.createdAt)}
                        </span>

                        <span>
                          Updated: {formatDate(shipment?.updatedAt)}
                        </span>

                      </div>

                    </div>

                    <div className="report-actions">

                      <span className="ready-badge">
                        READY
                      </span>

                      <button
                        type="button"
                        className="preview-button"
                        onClick={() =>
                          window.alert(
                            `${getTrackingNumber(shipment)}\nStatus: ${formatStatus(status)}`
                          )
                        }
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        className="export-button"
                        onClick={exportCsv}
                      >
                        Export
                      </button>

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </section>

        {/* EXPORT OPTIONS */}
        <div className="export-grid">

          <div className="report-card export-option">

            <div className="export-option-icon pdf-icon">
              PDF
            </div>

            <div>
              <strong>PDF Report</strong>
              <p>
                PDF generation is not available in the current backend.
              </p>
            </div>

            <button type="button" disabled>
              N/A
            </button>

          </div>

          <div className="report-card export-option">

            <div className="export-option-icon excel-icon">
              XLS
            </div>

            <div>
              <strong>Excel</strong>
              <p>
                Export current shipment data.
              </p>
            </div>

            <button type="button" onClick={exportCsv}>
              Export
            </button>

          </div>

          <div className="report-card export-option">

            <div className="export-option-icon csv-icon">
              CSV
            </div>

            <div>
              <strong>CSV</strong>
              <p>
                Download the current shipment records.
              </p>
            </div>

            <button type="button" onClick={exportCsv}>
              Export
            </button>

          </div>

        </div>

        {/* INSIGHTS */}
        <section className="report-card report-insights">

          <div className="report-card-header">

            <div>
              <h3>Report Insights</h3>
              <p>
                Calculated from the current shipment data.
              </p>
            </div>

          </div>

          <div className="report-insight-grid">

            <div className="report-insight">

              <div className="insight-icon green">
                ✓
              </div>

              <div>
                <strong>Delivery Rate</strong>
                <p>
                  {deliveryRate}% of current shipments are marked
                  as delivered.
                </p>
              </div>

            </div>

            <div className="report-insight">

              <div className="insight-icon purple">
                ▣
              </div>

              <div>
                <strong>Active Shipments</strong>
                <p>
                  {active} shipment{active === 1 ? "" : "s"} currently
                  have an active lifecycle status.
                </p>
              </div>

            </div>

            <div className="report-insight">

              <div className="insight-icon orange">
                !
              </div>

              <div>
                <strong>Cancelled Shipments</strong>
                <p>
                  {cancelled} shipment{cancelled === 1 ? "" : "s"} are
                  currently marked as cancelled.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="reports-footer">
          <span>© 2026 ShipTrack</span>
          <span>Reports & Export</span>
        </footer>

      </main>

    </div>
  );
}

export default Reports;