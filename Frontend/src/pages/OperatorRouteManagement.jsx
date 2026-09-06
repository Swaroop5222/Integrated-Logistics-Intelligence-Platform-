import { Link } from "react-router-dom";
import "./OperatorRouteManagement.css";

const routes = [
  {
    id: "RT-001",
    route: "Hyderabad → Bengaluru",
    shipments: 14,
    distance: "575 km",
    driver: "Arjun Kumar",
    vehicle: "TS 09 AB 4521",
    status: "On Route",
    eta: "2h 18m",
    progress: 72,
  },
  {
    id: "RT-002",
    route: "Mumbai → Pune",
    shipments: 9,
    distance: "150 km",
    driver: "Rahul Sharma",
    vehicle: "MH 12 CD 7842",
    status: "On Route",
    eta: "48m",
    progress: 91,
  },
  {
    id: "RT-003",
    route: "Chennai → Hyderabad",
    shipments: 11,
    distance: "630 km",
    driver: "Vijay Reddy",
    vehicle: "TN 38 EF 2910",
    status: "Attention",
    eta: "4h 26m",
    progress: 61,
  },
  {
    id: "RT-004",
    route: "Delhi → Jaipur",
    shipments: 7,
    distance: "280 km",
    driver: "Amit Singh",
    vehicle: "DL 01 GH 6328",
    status: "On Route",
    eta: "3h 05m",
    progress: 64,
  },
  {
    id: "RT-005",
    route: "Bengaluru → Chennai",
    shipments: 8,
    distance: "350 km",
    driver: "Suresh Babu",
    vehicle: "KA 05 JK 8124",
    status: "On Route",
    eta: "1h 42m",
    progress: 84,
  },
];

function OperatorRouteManagement() {
  return (
    <div className="route-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="route-sidebar">

        <div className="route-brand">
          <div className="route-brand-logo">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>Operator Console</span>
          </div>
        </div>

        <nav className="route-nav">

          <Link
            to="/dashboard/operator"
            className="route-nav-link"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/operator/shipment-tracking"
            className="route-nav-link"
          >
            <span>▣</span>
            Shipment Tracking
          </Link>

          <Link
            to="/operator/live-delivery"
            className="route-nav-link"
          >
            <span>◎</span>
            Live Deliveries
          </Link>

          <Link
            to="/operator/driver-tracking"
            className="route-nav-link"
          >
            <span>♙</span>
            Driver Tracking
          </Link>

          <Link
            to="/operator/routes"
            className="route-nav-link active"
          >
            <span>⌁</span>
            Route Management
          </Link>

          <Link
            to="/operator/eta-delay"
            className="route-nav-link"
          >
            <span>◷</span>
            ETA & Delays
          </Link>

          <Link
            to="/operator/pod"
            className="route-nav-link"
          >
            <span>✓</span>
            Proof of Delivery
          </Link>

        </nav>

        <div className="route-sidebar-bottom">

          <div className="route-user">

            <div className="route-avatar">
              OP
            </div>

            <div>
              <strong>Logistics Operator</strong>
              <span>Operations Team</span>
            </div>

          </div>

          <Link
            to="/login"
            className="route-logout"
          >
            <span>↪</span>
            Logout
          </Link>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="route-main">

        {/* Header */}

        <header className="route-header">

          <div>
            <span className="route-eyebrow">
              LOGISTICS OPERATIONS
            </span>

            <h1>Route Management</h1>

            <p>
              Monitor active routes, assigned shipments and route performance.
            </p>
          </div>

          <div className="route-header-actions">

            <div className="route-live-status">
              <span></span>
              System Live
            </div>

            <button className="route-notification">
              ♢
              <span>3</span>
            </button>

          </div>

        </header>


        {/* ================= STATS ================= */}

        <section className="route-stats">

          <div className="route-stat-card orange">

            <div className="route-stat-icon">
              ⌁
            </div>

            <div>
              <span>Active Routes</span>
              <strong>18</strong>
              <small>Currently operating</small>
            </div>

          </div>


          <div className="route-stat-card purple">

            <div className="route-stat-icon">
              ▣
            </div>

            <div>
              <span>Shipments On Route</span>
              <strong>48</strong>
              <small>Across active routes</small>
            </div>

          </div>


          <div className="route-stat-card green">

            <div className="route-stat-icon">
              ✓
            </div>

            <div>
              <span>On-Time Routes</span>
              <strong>15</strong>
              <small>83.3% of active routes</small>
            </div>

          </div>


          <div className="route-stat-card red">

            <div className="route-stat-icon">
              ⚠
            </div>

            <div>
              <span>Attention Needed</span>
              <strong>03</strong>
              <small>Requires action</small>
            </div>

          </div>

        </section>


        {/* ================= ROUTE OVERVIEW ================= */}

        <section className="route-top-grid">

          <div className="route-panel route-map-panel">

            <div className="route-panel-header">

              <div>
                <span className="route-panel-label">
                  NETWORK VIEW
                </span>

                <h2>Active Route Network</h2>
              </div>

              <span className="route-live-badge">
                ● Live
              </span>

            </div>

            <div className="route-map">

              <div className="map-grid"></div>

              <div className="map-node node-hyd">
                <span></span>
                <strong>Hyderabad</strong>
              </div>

              <div className="map-node node-blr">
                <span></span>
                <strong>Bengaluru</strong>
              </div>

              <div className="map-node node-mum">
                <span></span>
                <strong>Mumbai</strong>
              </div>

              <div className="map-node node-pune">
                <span></span>
                <strong>Pune</strong>
              </div>

              <div className="map-node node-chn">
                <span></span>
                <strong>Chennai</strong>
              </div>

              <div className="map-node node-del">
                <span></span>
                <strong>Delhi</strong>
              </div>

              <div className="route-line line-one"></div>
              <div className="route-line line-two"></div>
              <div className="route-line line-three"></div>
              <div className="route-line line-four"></div>

            </div>

          </div>


          <div className="route-panel performance-panel">

            <div className="route-panel-header">

              <div>
                <span className="route-panel-label">
                  PERFORMANCE
                </span>

                <h2>Route Efficiency</h2>
              </div>

            </div>

            <div className="efficiency-main">

              <div className="efficiency-ring">

                <div>
                  <strong>92.6%</strong>
                  <span>Efficiency</span>
                </div>

              </div>

            </div>

            <div className="efficiency-list">

              <div>
                <span className="efficiency-dot green-dot"></span>
                <p>On-Time Routes</p>
                <strong>15</strong>
              </div>

              <div>
                <span className="efficiency-dot orange-dot"></span>
                <p>At Risk</p>
                <strong>2</strong>
              </div>

              <div>
                <span className="efficiency-dot red-dot"></span>
                <p>Delayed</p>
                <strong>1</strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= ROUTE TABLE ================= */}

        <section className="route-panel routes-table-panel">

          <div className="route-panel-header">

            <div>
              <span className="route-panel-label">
                ACTIVE ROUTES
              </span>

              <h2>Route Operations</h2>

              <p>
                Monitor routes, drivers, vehicles and shipment progress.
              </p>
            </div>

            <button className="route-action-button">
              + Create Route
            </button>

          </div>


          <div className="route-table-wrapper">

            <table className="route-table">

              <thead>
                <tr>
                  <th>Route</th>
                  <th>Shipments</th>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>ETA</th>
                </tr>
              </thead>

              <tbody>

                {routes.map((route) => (

                  <tr key={route.id}>

                    <td>
                      <div className="route-name">

                        <span className="route-table-icon">
                          ⌁
                        </span>

                        <div>
                          <strong>{route.route}</strong>
                          <small>
                            {route.id} · {route.distance}
                          </small>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="shipment-count">
                        {route.shipments}
                      </span>
                    </td>

                    <td>
                      <span className="driver-text">
                        {route.driver}
                      </span>
                    </td>

                    <td>
                      <span className="vehicle-text">
                        {route.vehicle}
                      </span>
                    </td>

                    <td>

                      <span
                        className={`route-status ${
                          route.status === "Attention"
                            ? "attention-status"
                            : "onroute-status"
                        }`}
                      >
                        <span></span>
                        {route.status}
                      </span>

                    </td>

                    <td>

                      <div className="route-progress">

                        <div className="route-progress-bar">
                          <span
                            style={{
                              width: `${route.progress}%`,
                            }}
                          ></span>
                        </div>

                        <small>{route.progress}%</small>

                      </div>

                    </td>

                    <td>
                      <span className="route-eta">
                        {route.eta}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* ================= BOTTOM CARDS ================= */}

        <section className="route-bottom-grid">

          <div className="route-info-card">

            <div className="info-card-icon">
              ⚡
            </div>

            <div>
              <span>Fastest Route</span>
              <strong>Mumbai → Pune</strong>
              <small>150 km · 48 min remaining</small>
            </div>

          </div>


          <div className="route-info-card">

            <div className="info-card-icon">
              ◷
            </div>

            <div>
              <span>Longest Route</span>
              <strong>Chennai → Hyderabad</strong>
              <small>630 km · 4h 26m remaining</small>
            </div>

          </div>


          <div className="route-info-card warning">

            <div className="info-card-icon">
              ⚠
            </div>

            <div>
              <span>Route Attention</span>
              <strong>Chennai → Hyderabad</strong>
              <small>Traffic delay detected</small>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default OperatorRouteManagement;