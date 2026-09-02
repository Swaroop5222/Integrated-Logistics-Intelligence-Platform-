import React from "react";
import { Link } from "react-router-dom";
import "./LogisticsOverview.css";

const activeRoutes = [
  {
    route: "Hyderabad → Bengaluru",
    vehicle: "TRK-204",
    progress: 82,
    eta: "Today, 6:30 PM",
    status: "On Track",
  },
  {
    route: "Mumbai → Pune",
    vehicle: "TRK-118",
    progress: 64,
    eta: "Today, 8:15 PM",
    status: "On Track",
  },
  {
    route: "Chennai → Hyderabad",
    vehicle: "TRK-327",
    progress: 48,
    eta: "Tomorrow, 10:20 AM",
    status: "Delayed",
  },
  {
    route: "Delhi → Jaipur",
    vehicle: "TRK-091",
    progress: 71,
    eta: "Today, 9:40 PM",
    status: "On Track",
  },
  {
    route: "Bengaluru → Chennai",
    vehicle: "TRK-256",
    progress: 36,
    eta: "Tomorrow, 7:50 AM",
    status: "On Track",
  },
];

const networkCities = [
  { city: "Hyderabad", shipments: 38, type: "Hub" },
  { city: "Bengaluru", shipments: 31, type: "Hub" },
  { city: "Mumbai", shipments: 27, type: "Hub" },
  { city: "Chennai", shipments: 24, type: "Hub" },
  { city: "Delhi", shipments: 19, type: "Hub" },
];

function LogisticsOverview() {
  return (
    <div className="logistics-page">

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

          <Link to="/dashboard/business" className="business-nav-link">
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
            className="business-nav-link active"
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
            className="business-nav-link"
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

      {/* MAIN CONTENT */}
      <main className="logistics-main">

        {/* TOP BAR */}
        <header className="logistics-topbar">
          <div>
            <span className="breadcrumb">
              Business Client / Logistics Overview
            </span>

            <h1>Logistics Overview</h1>

            <p>
              Monitor your logistics network, fleet and shipment operations
              from one place.
            </p>
          </div>

          <div className="topbar-right">
            <button className="topbar-notification">
              ♢
              <span>3</span>
            </button>

            <div className="business-user">
              <div className="user-avatar">BC</div>

              <div>
                <strong>Business Client</strong>
                <small>Operations Manager</small>
              </div>
            </div>
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <section className="logistics-stats">

          <div className="logistics-stat-card orange">
            <div className="stat-top">
              <span>Total Shipments</span>
              <div className="stat-icon">▣</div>
            </div>

            <h2>128</h2>

            <div className="stat-change positive">
              ↑ 12.4%
              <span>vs last month</span>
            </div>
          </div>

          <div className="logistics-stat-card purple">
            <div className="stat-top">
              <span>Active Routes</span>
              <div className="stat-icon">⌁</div>
            </div>

            <h2>18</h2>

            <div className="stat-change positive">
              ↑ 3
              <span>new routes</span>
            </div>
          </div>

          <div className="logistics-stat-card cyan">
            <div className="stat-top">
              <span>Fleet Utilization</span>
              <div className="stat-icon">▰</div>
            </div>

            <h2>78%</h2>

            <div className="progress-small">
              <div style={{ width: "78%" }}></div>
            </div>

            <div className="stat-caption">
              33 of 42 vehicles active
            </div>
          </div>

          <div className="logistics-stat-card green">
            <div className="stat-top">
              <span>On-Time Delivery</span>
              <div className="stat-icon">✓</div>
            </div>

            <h2>92.6%</h2>

            <div className="stat-change positive">
              ↑ 2.1%
              <span>this month</span>
            </div>
          </div>

        </section>

        {/* NETWORK + SHIPMENT STATUS */}
        <section className="overview-grid">

          {/* NETWORK */}
          <div className="overview-card network-card">

            <div className="card-header">
              <div>
                <h3>Logistics Network</h3>
                <p>Current activity across major operational hubs</p>
              </div>

              <span className="live-indicator">
                <span></span>
                LIVE
              </span>
            </div>

            <div className="network-map">

              <div className="route-line line-one"></div>
              <div className="route-line line-two"></div>
              <div className="route-line line-three"></div>
              <div className="route-line line-four"></div>

              <div className="network-node node-hyd">
                <span></span>
                <strong>Hyderabad</strong>
                <small>38 shipments</small>
              </div>

              <div className="network-node node-blr">
                <span></span>
                <strong>Bengaluru</strong>
                <small>31 shipments</small>
              </div>

              <div className="network-node node-mum">
                <span></span>
                <strong>Mumbai</strong>
                <small>27 shipments</small>
              </div>

              <div className="network-node node-che">
                <span></span>
                <strong>Chennai</strong>
                <small>24 shipments</small>
              </div>

              <div className="network-node node-del">
                <span></span>
                <strong>Delhi</strong>
                <small>19 shipments</small>
              </div>

            </div>

            <div className="network-footer">
              <div>
                <span className="network-dot active"></span>
                Active Hub
              </div>

              <div>
                <span className="network-dot route"></span>
                Active Route
              </div>

              <div>
                <span className="network-dot delayed"></span>
                Attention Required
              </div>
            </div>

          </div>

          {/* SHIPMENT STATUS */}
          <div className="overview-card status-card">

            <div className="card-header">
              <div>
                <h3>Shipment Status</h3>
                <p>Current shipment distribution</p>
              </div>

              <Link to="/business/shipment-management">
                View all
              </Link>
            </div>

            <div className="status-chart">

              <div className="donut">
                <div className="donut-center">
                  <strong>128</strong>
                  <span>Total</span>
                </div>
              </div>

              <div className="status-legend">

                <div className="legend-item">
                  <span className="legend-color delivered"></span>

                  <div>
                    <strong>87</strong>
                    <span>Delivered</span>
                  </div>

                  <b>68%</b>
                </div>

                <div className="legend-item">
                  <span className="legend-color transit"></span>

                  <div>
                    <strong>32</strong>
                    <span>In Transit</span>
                  </div>

                  <b>25%</b>
                </div>

                <div className="legend-item">
                  <span className="legend-color delayed"></span>

                  <div>
                    <strong>09</strong>
                    <span>Delayed</span>
                  </div>

                  <b>7%</b>
                </div>

              </div>

            </div>

            <div className="status-summary">
              <span>
                <b>92.6%</b> overall on-time performance
              </span>
            </div>

          </div>

        </section>

        {/* ACTIVE ROUTES */}
        <section className="overview-card routes-card">

          <div className="card-header">
            <div>
              <h3>Active Routes</h3>
              <p>Live shipment movement across operational routes</p>
            </div>

            <Link to="/business/tracking">
              Track Shipments →
            </Link>
          </div>

          <div className="routes-table-wrapper">

            <table className="routes-table">

              <thead>
                <tr>
                  <th>ROUTE</th>
                  <th>VEHICLE</th>
                  <th>PROGRESS</th>
                  <th>ETA</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {activeRoutes.map((item, index) => (
                  <tr key={index}>

                    <td>
                      <div className="route-name">
                        <span className="route-icon">⌁</span>
                        <strong>{item.route}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="vehicle-id">
                        {item.vehicle}
                      </span>
                    </td>

                    <td>
                      <div className="route-progress">

                        <div className="progress-track">
                          <div
                            className={
                              item.status === "Delayed"
                                ? "progress-fill delayed-progress"
                                : "progress-fill"
                            }
                            style={{
                              width: `${item.progress}%`,
                            }}
                          ></div>
                        </div>

                        <span>{item.progress}%</span>

                      </div>
                    </td>

                    <td>
                      <span className="eta">
                        {item.eta}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          item.status === "Delayed"
                            ? "route-status delayed-status"
                            : "route-status ontrack-status"
                        }
                      >
                        {item.status}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>

        </section>

        {/* FLEET + INSIGHTS */}
        <section className="bottom-grid">

          {/* FLEET */}
          <div className="overview-card fleet-card">

            <div className="card-header">
              <div>
                <h3>Fleet Overview</h3>
                <p>Vehicle availability and utilization</p>
              </div>

              <span className="fleet-total">
                42 Vehicles
              </span>
            </div>

            <div className="fleet-content">

              <div className="fleet-circle">
                <div>
                  <strong>78%</strong>
                  <span>Utilized</span>
                </div>
              </div>

              <div className="fleet-stats">

                <div className="fleet-stat">
                  <span className="fleet-indicator active"></span>

                  <div>
                    <strong>33</strong>
                    <span>Active</span>
                  </div>
                </div>

                <div className="fleet-stat">
                  <span className="fleet-indicator available"></span>

                  <div>
                    <strong>06</strong>
                    <span>Available</span>
                  </div>
                </div>

                <div className="fleet-stat">
                  <span className="fleet-indicator maintenance"></span>

                  <div>
                    <strong>03</strong>
                    <span>Maintenance</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* OPERATIONAL INSIGHTS */}
          <div className="overview-card insights-card">

            <div className="card-header">
              <div>
                <h3>Operational Insights</h3>
                <p>Important observations from your network</p>
              </div>
            </div>

            <div className="insight-list">

              <div className="insight-item">
                <div className="insight-icon green-icon">✓</div>

                <div>
                  <strong>Best Performing Route</strong>
                  <p>
                    Hyderabad → Bengaluru has a 96.8% on-time rate.
                  </p>
                </div>

                <span className="insight-arrow">→</span>
              </div>

              <div className="insight-item">
                <div className="insight-icon purple-icon">↗</div>

                <div>
                  <strong>Fleet Utilization Improved</strong>
                  <p>
                    Fleet utilization increased by 6.4% this month.
                  </p>
                </div>

                <span className="insight-arrow">→</span>
              </div>

              <div className="insight-item warning">
                <div className="insight-icon orange-icon">!</div>

                <div>
                  <strong>Route Needs Attention</strong>
                  <p>
                    Chennai → Hyderabad currently has a delivery delay.
                  </p>
                </div>

                <span className="insight-arrow">→</span>
              </div>

            </div>

          </div>

        </section>

        {/* NETWORK SUMMARY */}
        <section className="overview-card hub-card">

          <div className="card-header">
            <div>
              <h3>Operational Hubs</h3>
              <p>Shipment activity across your logistics network</p>
            </div>

            <span className="hub-count">
              5 Active Hubs
            </span>
          </div>

          <div className="hub-grid">

            {networkCities.map((hub, index) => (
              <div className="hub-item" key={index}>

                <div className="hub-icon">
                  ◉
                </div>

                <div className="hub-info">
                  <strong>{hub.city}</strong>
                  <span>{hub.type}</span>
                </div>

                <div className="hub-shipments">
                  <strong>{hub.shipments}</strong>
                  <span>shipments</span>
                </div>

              </div>
            ))}

          </div>

        </section>

        <footer className="logistics-footer">
          <span>© 2026 ShipTrack Intelligence Platform</span>
          <span>Logistics Network Status: Operational</span>
        </footer>

      </main>
    </div>
  );
}

export default LogisticsOverview;