import { Link } from "react-router-dom";
import "./OperatorDashboard.css";

const activeShipments = [
  {
    id: "TRK-2026-101",
    route: "Hyderabad → Bengaluru",
    driver: "Arjun Kumar",
    vehicle: "TS 09 AB 4521",
    status: "In Transit",
    eta: "Today, 8:30 PM",
    progress: 72,
  },
  {
    id: "TRK-2026-102",
    route: "Mumbai → Pune",
    driver: "Rahul Sharma",
    vehicle: "MH 12 CD 7842",
    status: "Out for Delivery",
    eta: "Today, 6:15 PM",
    progress: 91,
  },
  {
    id: "TRK-2026-103",
    route: "Chennai → Hyderabad",
    driver: "Vijay Reddy",
    vehicle: "TN 38 EF 2910",
    status: "Delayed",
    eta: "Tomorrow, 10:00 AM",
    progress: 48,
  },
  {
    id: "TRK-2026-104",
    route: "Delhi → Jaipur",
    driver: "Amit Singh",
    vehicle: "DL 01 GH 6328",
    status: "In Transit",
    eta: "Tomorrow, 7:45 AM",
    progress: 64,
  },
];

const routes = [
  {
    route: "Hyderabad → Bengaluru",
    shipments: 14,
    distance: "575 km",
    status: "On Route",
  },
  {
    route: "Mumbai → Pune",
    shipments: 9,
    distance: "150 km",
    status: "On Route",
  },
  {
    route: "Chennai → Hyderabad",
    shipments: 11,
    distance: "630 km",
    status: "Attention",
  },
  {
    route: "Delhi → Jaipur",
    shipments: 7,
    distance: "280 km",
    status: "On Route",
  },
];

function OperatorDashboard() {
  return (
    <div className="operator-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="operator-sidebar">

        {/* Brand */}
        <div className="operator-brand">
          <div className="operator-brand-logo">
            S
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>Operator Console</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="operator-nav">

          {/* Dashboard */}
          <Link
            to="/dashboard/operator"
            className="operator-nav-link active"
          >
            <span className="operator-nav-icon">⌂</span>
            Dashboard
          </Link>

          {/* Shipment Tracking */}
          <Link
            to="/operator/shipment-tracking"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">▣</span>
            Shipment Tracking
          </Link>

          {/* Live Deliveries */}
          <Link
            to="/operator/live-delivery"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">◎</span>
            Live Deliveries
          </Link>

          {/* Driver Tracking */}
          <Link
            to="/operator/driver-tracking"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">♙</span>
            Driver Tracking
          </Link>

          {/* Route Management */}
          <Link
            to="/operator/routes"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">⌁</span>
            Route Management
          </Link>

          {/* ETA & Delays */}
          <Link
            to="/operator/eta-delay"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">◷</span>
            ETA & Delays
          </Link>

          {/* Proof of Delivery */}
          <Link
            to="/operator/pod"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">✓</span>
            Proof of Delivery
          </Link>

        </nav>

        {/* Bottom */}
        <div className="operator-sidebar-bottom">

          <div className="operator-user">
            <div className="operator-avatar">
              OP
            </div>

            <div>
              <strong>Logistics Operator</strong>
              <span>Operations Team</span>
            </div>
          </div>

          <Link
            to="/login"
            className="operator-logout"
          >
            <span>↪</span>
            Logout
          </Link>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="operator-main">

        {/* Header */}
        <header className="operator-header">

          <div>
            <span className="operator-eyebrow">
              LOGISTICS OPERATIONS
            </span>

            <h1>Operator Dashboard</h1>

            <p>
              Monitor deliveries, drivers, routes and shipment operations
              from one place.
            </p>
          </div>

          <div className="operator-header-actions">

            <div className="operator-live-status">
              <span></span>
              System Live
            </div>

            <button className="operator-notification">
              ♢
              <span>3</span>
            </button>

          </div>

        </header>


        {/* ================= STAT CARDS ================= */}

        <section className="operator-stats">

          {/* Active Shipments */}
          <div className="operator-stat-card orange">

            <div className="operator-stat-icon">
              ▣
            </div>

            <div>
              <span>Active Shipments</span>
              <strong>48</strong>
              <small>+6 from yesterday</small>
            </div>

          </div>


          {/* Live Deliveries */}
          <div className="operator-stat-card purple">

            <div className="operator-stat-icon">
              ◎
            </div>

            <div>
              <span>Live Deliveries</span>
              <strong>32</strong>
              <small>Currently on route</small>
            </div>

          </div>


          {/* Active Drivers */}
          <div className="operator-stat-card green">

            <div className="operator-stat-icon">
              ♙
            </div>

            <div>
              <span>Active Drivers</span>
              <strong>33</strong>
              <small>42 total drivers</small>
            </div>

          </div>


          {/* Delayed Shipments */}
          <div className="operator-stat-card red">

            <div className="operator-stat-icon">
              ⚠
            </div>

            <div>
              <span>Delayed Shipments</span>
              <strong>09</strong>
              <small>Needs attention</small>
            </div>

          </div>

        </section>


        {/* ================= TOP GRID ================= */}

        <section className="operator-top-grid">

          {/* Live Delivery Overview */}

          <div className="operator-panel live-panel">

            <div className="operator-panel-header">

              <div>
                <span className="panel-label">
                  LIVE OPERATIONS
                </span>

                <h2>Delivery Overview</h2>
              </div>

              <Link
                to="/operator/live-delivery"
                className="panel-link"
              >
                View all →
              </Link>

            </div>


            <div className="delivery-overview">

              <div className="delivery-ring">

                <div className="delivery-ring-inner">
                  <strong>67%</strong>
                  <span>On Route</span>
                </div>

              </div>


              <div className="delivery-legend">

                <div>
                  <span className="legend-dot delivered"></span>
                  <p>Delivered</p>
                  <strong>87</strong>
                </div>

                <div>
                  <span className="legend-dot transit"></span>
                  <p>In Transit</p>
                  <strong>32</strong>
                </div>

                <div>
                  <span className="legend-dot delayed"></span>
                  <p>Delayed</p>
                  <strong>09</strong>
                </div>

              </div>

            </div>

          </div>


          {/* Operational Alerts */}

          <div className="operator-panel alert-panel">

            <div className="operator-panel-header">

              <div>
                <span className="panel-label">
                  ATTENTION REQUIRED
                </span>

                <h2>Operational Alerts</h2>
              </div>

              <span className="alert-count">
                3
              </span>

            </div>


            <div className="alerts-list">

              <div className="operator-alert red-alert">

                <div className="alert-icon">
                  !
                </div>

                <div>
                  <strong>Shipment Delayed</strong>

                  <p>
                    TRK-2026-103 is delayed by 3h 20m.
                  </p>
                </div>

                <span>Now</span>

              </div>


              <div className="operator-alert orange-alert">

                <div className="alert-icon">
                  !
                </div>

                <div>
                  <strong>ETA Risk</strong>

                  <p>
                    Route Chennai → Hyderabad has high traffic.
                  </p>
                </div>

                <span>18m</span>

              </div>


              <div className="operator-alert purple-alert">

                <div className="alert-icon">
                  i
                </div>

                <div>
                  <strong>Vehicle Update</strong>

                  <p>
                    Vehicle MH 12 CD 7842 requires inspection.
                  </p>
                </div>

                <span>1h</span>

              </div>

            </div>

          </div>

        </section>


        {/* ================= SHIPMENTS ================= */}

        <section className="operator-panel shipments-panel">

          <div className="operator-panel-header">

            <div>
              <span className="panel-label">
                ACTIVE SHIPMENTS
              </span>

              <h2>Shipment Operations</h2>

              <p>
                Monitor active shipments and delivery progress.
              </p>
            </div>

            <Link
              to="/operator/shipment-tracking"
              className="panel-link"
            >
              View all shipments →
            </Link>

          </div>


          <div className="operator-table-wrapper">

            <table className="operator-table">

              <thead>

                <tr>
                  <th>Shipment</th>
                  <th>Route</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>ETA</th>
                </tr>

              </thead>

              <tbody>

                {activeShipments.map((shipment) => (

                  <tr key={shipment.id}>

                    <td>

                      <div className="shipment-id">

                        <span className="shipment-box">
                          □
                        </span>

                        <div>
                          <strong>{shipment.id}</strong>
                          <small>{shipment.vehicle}</small>
                        </div>

                      </div>

                    </td>


                    <td>
                      <span className="route-text">
                        {shipment.route}
                      </span>
                    </td>


                    <td>
                      <span className="driver-name">
                        {shipment.driver}
                      </span>
                    </td>


                    <td>

                      <span
                        className={`operator-status ${
                          shipment.status === "Delayed"
                            ? "delayed-status"
                            : shipment.status === "Out for Delivery"
                            ? "delivery-status"
                            : "transit-status"
                        }`}
                      >
                        <span></span>
                        {shipment.status}
                      </span>

                    </td>


                    <td>

                      <div className="progress-cell">

                        <div className="progress-bar">

                          <span
                            style={{
                              width: `${shipment.progress}%`,
                            }}
                          ></span>

                        </div>

                        <small>
                          {shipment.progress}%
                        </small>

                      </div>

                    </td>


                    <td>
                      <span className="eta-text">
                        {shipment.eta}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* ================= BOTTOM GRID ================= */}

        <section className="operator-bottom-grid">

          {/* Routes */}

          <div className="operator-panel routes-panel">

            <div className="operator-panel-header">

              <div>
                <span className="panel-label">
                  ROUTE MANAGEMENT
                </span>

                <h2>Active Routes</h2>
              </div>

              <Link
                to="/operator/routes"
                className="panel-link"
              >
                Manage →
              </Link>

            </div>


            <div className="routes-list">

              {routes.map((route) => (

                <div
                  className="route-item"
                  key={route.route}
                >

                  <div className="route-icon">
                    ⌁
                  </div>

                  <div className="route-info">

                    <strong>
                      {route.route}
                    </strong>

                    <span>
                      {route.shipments} shipments · {route.distance}
                    </span>

                  </div>

                  <span
                    className={
                      route.status === "Attention"
                        ? "route-status attention"
                        : "route-status"
                    }
                  >
                    {route.status}
                  </span>

                </div>

              ))}

            </div>

          </div>


          {/* Fleet */}

          <div className="operator-panel fleet-panel">

            <div className="operator-panel-header">

              <div>
                <span className="panel-label">
                  FLEET STATUS
                </span>

                <h2>Fleet Overview</h2>
              </div>

              <Link
                to="/operator/driver-tracking"
                className="panel-link"
              >
                Drivers →
              </Link>

            </div>


            <div className="fleet-main">

              <div className="fleet-number">
                <strong>42</strong>
                <span>Total Vehicles</span>
              </div>

              <div className="fleet-utilization">

                <div className="fleet-progress">
                  <span style={{ width: "78%" }}></span>
                </div>

                <div className="fleet-progress-info">
                  <span>Fleet Utilization</span>
                  <strong>78%</strong>
                </div>

              </div>

            </div>


            <div className="fleet-stats">

              <div>
                <span className="fleet-dot active"></span>
                <p>Active</p>
                <strong>33</strong>
              </div>

              <div>
                <span className="fleet-dot available"></span>
                <p>Available</p>
                <strong>6</strong>
              </div>

              <div>
                <span className="fleet-dot maintenance"></span>
                <p>Maintenance</p>
                <strong>3</strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= QUICK ACTIONS ================= */}

        <section className="operator-quick-actions">

          {/* Track Shipment */}
          <Link
            to="/operator/shipment-tracking"
            className="quick-action"
          >
            <span>▣</span>

            <div>
              <strong>Track Shipment</strong>
              <small>View shipment status</small>
            </div>

            <b>→</b>
          </Link>


          {/* Track Driver */}
          <Link
            to="/operator/driver-tracking"
            className="quick-action"
          >
            <span>♙</span>

            <div>
              <strong>Track Driver</strong>
              <small>Monitor driver activity</small>
            </div>

            <b>→</b>
          </Link>


          {/* Check Delays */}
          <Link
            to="/operator/eta-delay"
            className="quick-action"
          >
            <span>◷</span>

            <div>
              <strong>Check Delays</strong>
              <small>Review ETA risks</small>
            </div>

            <b>→</b>
          </Link>


          {/* Proof of Delivery */}
          <Link
            to="/operator/pod"
            className="quick-action"
          >
            <span>✓</span>

            <div>
              <strong>Proof of Delivery</strong>
              <small>Review completed deliveries</small>
            </div>

            <b>→</b>
          </Link>

        </section>

      </main>

    </div>
  );
}

export default OperatorDashboard;