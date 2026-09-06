import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Reports.css";

const reportData = [
  {
    name: "Shipment Performance Report",
    description: "Overview of shipment volume, delivery status and performance.",
    type: "Shipment",
    period: "August 2026",
    generated: "Today, 10:25 AM",
    status: "Ready",
  },
  {
    name: "Delivery Performance Report",
    description: "On-time delivery, delays and average delivery time analysis.",
    type: "Performance",
    period: "August 2026",
    generated: "Today, 09:40 AM",
    status: "Ready",
  },
  {
    name: "Delay Analysis Report",
    description: "Detailed analysis of delayed shipments and delay reasons.",
    type: "Analytics",
    period: "August 2026",
    generated: "Yesterday, 06:15 PM",
    status: "Ready",
  },
  {
    name: "Fleet Utilization Report",
    description: "Vehicle utilization, availability and maintenance overview.",
    type: "Fleet",
    period: "August 2026",
    generated: "Yesterday, 04:30 PM",
    status: "Ready",
  },
];

function Reports() {
  const [reportType, setReportType] = useState("All Reports");
  const [period, setPeriod] = useState("August 2026");
  const [message, setMessage] = useState("");

  const filteredReports =
    reportType === "All Reports"
      ? reportData
      : reportData.filter((report) => report.type === reportType);

  const handleGenerate = () => {
    setMessage(
      `Report generated successfully for ${period}.`
    );

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

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

          <Link
            to="/dashboard/business"
            className="business-nav-link"
          >
            <span className="nav-icon">⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="business-nav-link"
          >
            <span className="nav-icon">＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="business-nav-link"
          >
            <span className="nav-icon">▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="business-nav-link"
          >
            <span className="nav-icon">◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="business-nav-link"
          >
            <span className="nav-icon">□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="business-nav-link"
          >
            <span className="nav-icon">⌖</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="business-nav-link"
          >
            <span className="nav-icon">↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-nav-link"
          >
            <span className="nav-icon">△</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-nav-link"
          >
            <span className="nav-icon">◈</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="business-nav-link"
          >
            <span className="nav-icon">♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="business-nav-link active"
          >
            <span className="nav-icon">▤</span>
            Reports & Export
          </Link>

          <Link
            to="/business/notifications"
            className="business-nav-link"
          >
            <span className="nav-icon">♢</span>
            Notifications
          </Link>

        </div>

        <div className="sidebar-bottom">

          <div className="business-status">
            <span className="status-dot"></span>

            <div>
              <strong>System Operational</strong>
              <small>All services running</small>
            </div>
          </div>

          <Link to="/login" className="business-logout">
            <span>↪</span>
            Logout
          </Link>

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
              Generate, review and export logistics performance reports.
            </p>
          </div>

          <div className="topbar-right">

            <button className="topbar-notification">
              ♢
              <span>3</span>
            </button>

            <div className="business-user">

              <div className="user-avatar">
                BC
              </div>

              <div>
                <strong>Business Client</strong>
                <small>Operations Manager</small>
              </div>

            </div>

          </div>

        </header>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="report-success">
            <span>✓</span>
            {message}
          </div>
        )}

        {/* SUMMARY */}
        <section className="report-stats">

          <div className="report-stat-card orange">

            <div className="report-stat-top">
              <span>Total Reports</span>
              <div className="report-stat-icon">▤</div>
            </div>

            <h2>24</h2>

            <span className="report-stat-note">
              Generated this year
            </span>

          </div>

          <div className="report-stat-card purple">

            <div className="report-stat-top">
              <span>This Month</span>
              <div className="report-stat-icon">◷</div>
            </div>

            <h2>08</h2>

            <span className="report-stat-note">
              Reports generated
            </span>

          </div>

          <div className="report-stat-card cyan">

            <div className="report-stat-top">
              <span>Exports</span>
              <div className="report-stat-icon">↓</div>
            </div>

            <h2>42</h2>

            <span className="report-stat-note">
              Files downloaded
            </span>

          </div>

          <div className="report-stat-card green">

            <div className="report-stat-top">
              <span>Data Coverage</span>
              <div className="report-stat-icon">✓</div>
            </div>

            <h2>100%</h2>

            <span className="report-stat-note">
              Current data available
            </span>

          </div>

        </section>

        {/* GENERATE REPORT */}
        <section className="report-card generate-card">

          <div className="report-card-header">

            <div>
              <h3>Generate New Report</h3>
              <p>
                Select the report type and reporting period.
              </p>
            </div>

            <span className="report-live">
              DATA READY
            </span>

          </div>

          <div className="generate-form">

            <div className="report-field">

              <label>REPORT TYPE</label>

              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option>All Reports</option>
                <option>Shipment</option>
                <option>Performance</option>
                <option>Analytics</option>
                <option>Fleet</option>
              </select>

            </div>

            <div className="report-field">

              <label>REPORTING PERIOD</label>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option>August 2026</option>
                <option>July 2026</option>
                <option>June 2026</option>
                <option>May 2026</option>
              </select>

            </div>

            <div className="report-field">

              <label>EXPORT FORMAT</label>

              <select defaultValue="PDF">
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>

            </div>

            <button
              className="generate-button"
              onClick={handleGenerate}
            >
              <span>＋</span>
              Generate Report
            </button>

          </div>

        </section>

        {/* REPORT LIST */}
        <section className="report-card reports-list-card">

          <div className="report-card-header">

            <div>
              <h3>Available Reports</h3>
              <p>
                Previously generated business intelligence reports.
              </p>
            </div>

            <span className="reports-count">
              {filteredReports.length} Reports
            </span>

          </div>

          <div className="reports-list">

            {filteredReports.map((report, index) => (

              <div className="report-item" key={index}>

                <div className="report-file-icon">
                  ▤
                </div>

                <div className="report-details">

                  <strong>{report.name}</strong>

                  <p>{report.description}</p>

                  <div className="report-meta">

                    <span>{report.type}</span>

                    <span>{report.period}</span>

                    <span>
                      Generated {report.generated}
                    </span>

                  </div>

                </div>

                <div className="report-actions">

                  <span className="ready-badge">
                    {report.status}
                  </span>

                  <button
                    className="preview-button"
                    onClick={() =>
                      setMessage(
                        `${report.name} is ready for preview.`
                      )
                    }
                  >
                    Preview
                  </button>

                  <button
                    className="export-button"
                    onClick={() =>
                      setMessage(
                        `${report.name} exported successfully.`
                      )
                    }
                  >
                    ↓ Export
                  </button>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* EXPORT OPTIONS */}
        <section className="export-grid">

          <div className="report-card export-option">

            <div className="export-option-icon pdf-icon">
              PDF
            </div>

            <div>
              <strong>PDF Reports</strong>
              <p>
                Download presentation-ready reports for sharing.
              </p>
            </div>

            <button
              onClick={() =>
                setMessage("PDF export selected.")
              }
            >
              Export
            </button>

          </div>

          <div className="report-card export-option">

            <div className="export-option-icon excel-icon">
              XLS
            </div>

            <div>
              <strong>Excel Reports</strong>
              <p>
                Export detailed operational data for analysis.
              </p>
            </div>

            <button
              onClick={() =>
                setMessage("Excel export selected.")
              }
            >
              Export
            </button>

          </div>

          <div className="report-card export-option">

            <div className="export-option-icon csv-icon">
              CSV
            </div>

            <div>
              <strong>CSV Data</strong>
              <p>
                Export raw shipment data for external systems.
              </p>
            </div>

            <button
              onClick={() =>
                setMessage("CSV export selected.")
              }
            >
              Export
            </button>

          </div>

        </section>

        {/* INSIGHTS */}
        <section className="report-card report-insights">

          <div className="report-card-header">

            <div>
              <h3>Reporting Insights</h3>
              <p>
                Useful information about your business reporting.
              </p>
            </div>

          </div>

          <div className="report-insight-grid">

            <div className="report-insight">

              <div className="insight-icon green">
                ✓
              </div>

              <div>
                <strong>Data is up to date</strong>
                <p>
                  Shipment and delivery data is synchronized with
                  the latest operational information.
                </p>
              </div>

            </div>

            <div className="report-insight">

              <div className="insight-icon purple">
                ↗
              </div>

              <div>
                <strong>Performance reporting available</strong>
                <p>
                  Delivery performance and delay analysis can be
                  reviewed for monthly operations.
                </p>
              </div>

            </div>

            <div className="report-insight">

              <div className="insight-icon orange">
                ↓
              </div>

              <div>
                <strong>Export ready</strong>
                <p>
                  Business data can be exported in multiple formats
                  for further analysis.
                </p>
              </div>

            </div>

          </div>

        </section>

        <footer className="reports-footer">
          <span>© 2026 ShipTrack Intelligence Platform</span>
          <span>Reporting System: Operational</span>
        </footer>

      </main>
    </div>
  );
}

export default Reports;