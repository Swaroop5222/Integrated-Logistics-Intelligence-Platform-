import { Link } from "react-router-dom";
import "./OperatorETADelays.css";

const delayedShipments = [
  {
    id: "TRK-2026-103",
    route: "Chennai → Hyderabad",
    driver: "Vijay Reddy",
    vehicle: "TN 38 EF 2910",
    eta: "Tomorrow, 10:00 AM",
    delay: "3h 20m",
    reason: "Heavy Traffic",
    risk: "High",
    progress: 48,
  },
  {
    id: "TRK-2026-108",
    route: "Hyderabad → Mumbai",
    driver: "Manoj Verma",
    vehicle: "TS 10 KL 5532",
    eta: "Tomorrow, 2:30 PM",
    delay: "1h 45m",
    reason: "Vehicle Issue",
    risk: "High",
    progress: 54,
  },
  {
    id: "TRK-2026-112",
    route: "Bengaluru → Chennai",
    driver: "Suresh Babu",
    vehicle: "KA 05 JK 8124",
    eta: "Today, 9:20 PM",
    delay: "52m",
    reason: "Weather",
    risk: "Medium",
    progress: 67,
  },
  {
    id: "TRK-2026-117",
    route: "Delhi → Jaipur",
    driver: "Amit Singh",
    vehicle: "DL 01 GH 6328",
    eta: "Tomorrow, 7:45 AM",
    delay: "35m",
    reason: "Route Congestion",
    risk: "Medium",
    progress: 64,
  },
  {
    id: "TRK-2026-121",
    route: "Mumbai → Pune",
    driver: "Rahul Sharma",
    vehicle: "MH 12 CD 7842",
    eta: "Today, 6:15 PM",
    delay: "18m",
    reason: "Traffic",
    risk: "Low",
    progress: 91,
  },
];

const delayReasons = [
  {
    name: "Heavy Traffic",
    count: 4,
    percentage: 44,
  },
  {
    name: "Vehicle Issue",
    count: 2,
    percentage: 22,
  },
  {
    name: "Weather",
    count: 2,
    percentage: 22,
  },
  {
    name: "Route Congestion",
    count: 1,
    percentage: 12,
  },
];

function OperatorETADelays() {
  return (
    <div className="eta-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="eta-sidebar">

        <div className="eta-brand">

          <div className="eta-brand-logo">
            S
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>Operator Console</span>
          </div>

        </div>


        <nav className="eta-nav">

          <Link
            to="/dashboard/operator"
            className="eta-nav-link"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/operator/shipment-tracking"
            className="eta-nav-link"
          >
            <span>▣</span>
            Shipment Tracking
          </Link>

          <Link
            to="/operator/live-delivery"
            className="eta-nav-link"
          >
            <span>◎</span>
            Live Deliveries
          </Link>

          <Link
            to="/operator/driver-tracking"
            className="eta-nav-link"
          >
            <span>♙</span>
            Driver Tracking
          </Link>

          <Link
            to="/operator/routes"
            className="eta-nav-link"
          >
            <span>⌁</span>
            Route Management
          </Link>

          <Link
            to="/operator/eta-delay"
            className="eta-nav-link active"
          >
            <span>◷</span>
            ETA & Delays
          </Link>

          <Link
            to="/operator/pod"
            className="eta-nav-link"
          >
            <span>✓</span>
            Proof of Delivery
          </Link>

        </nav>


        <div className="eta-sidebar-bottom">

          <div className="eta-user">

            <div className="eta-avatar">
              OP
            </div>

            <div>
              <strong>Logistics Operator</strong>
              <span>Operations Team</span>
            </div>

          </div>

          <Link
            to="/login"
            className="eta-logout"
          >
            <span>↪</span>
            Logout
          </Link>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="eta-main">

        {/* HEADER */}

        <header className="eta-header">

          <div>

            <span className="eta-eyebrow">
              LOGISTICS OPERATIONS
            </span>

            <h1>ETA & Delays</h1>

            <p>
              Monitor estimated delivery times, delay risks and shipment
              exceptions.
            </p>

          </div>


          <div className="eta-header-actions">

            <div className="eta-live-status">
              <span></span>
              System Live
            </div>

            <button className="eta-notification">
              ♢
              <span>3</span>
            </button>

          </div>

        </header>


        {/* ================= STATS ================= */}

        <section className="eta-stats">

          <div className="eta-stat-card orange">

            <div className="eta-stat-icon">
              ◷
            </div>

            <div>
              <span>Active Shipments</span>
              <strong>48</strong>
              <small>Currently monitored</small>
            </div>

          </div>


          <div className="eta-stat-card purple">

            <div className="eta-stat-icon">
              ⚠
            </div>

            <div>
              <span>ETA At Risk</span>
              <strong>06</strong>
              <small>May miss scheduled ETA</small>
            </div>

          </div>


          <div className="eta-stat-card red">

            <div className="eta-stat-icon">
              !
            </div>

            <div>
              <span>Delayed Shipments</span>
              <strong>09</strong>
              <small>Require attention</small>
            </div>

          </div>


          <div className="eta-stat-card green">

            <div className="eta-stat-icon">
              ✓
            </div>

            <div>
              <span>Avg Delay</span>
              <strong>1.8h</strong>
              <small>Across delayed shipments</small>
            </div>

          </div>

        </section>


        {/* ================= TOP GRID ================= */}

        <section className="eta-top-grid">

          {/* ETA OVERVIEW */}

          <div className="eta-panel">

            <div className="eta-panel-header">

              <div>
                <span className="eta-panel-label">
                  DELIVERY FORECAST
                </span>

                <h2>ETA Risk Overview</h2>
              </div>

              <span className="eta-live-badge">
                ● Live
              </span>

            </div>


            <div className="eta-risk-content">

              <div className="eta-risk-ring">

                <div>
                  <strong>87.5%</strong>
                  <span>On ETA</span>
                </div>

              </div>


              <div className="eta-risk-list">

                <div>
                  <span className="risk-dot on-time"></span>
                  <p>On Schedule</p>
                  <strong>42</strong>
                </div>

                <div>
                  <span className="risk-dot medium-risk"></span>
                  <p>At Risk</p>
                  <strong>06</strong>
                </div>

                <div>
                  <span className="risk-dot high-risk"></span>
                  <p>Delayed</p>
                  <strong>09</strong>
                </div>

              </div>

            </div>

          </div>


          {/* DELAY REASONS */}

          <div className="eta-panel">

            <div className="eta-panel-header">

              <div>
                <span className="eta-panel-label">
                  EXCEPTION ANALYSIS
                </span>

                <h2>Delay Reasons</h2>
              </div>

            </div>


            <div className="delay-reasons">

              {delayReasons.map((reason) => (

                <div
                  className="delay-reason"
                  key={reason.name}
                >

                  <div className="delay-reason-top">

                    <span>
                      {reason.name}
                    </span>

                    <strong>
                      {reason.count}
                    </strong>

                  </div>

                  <div className="delay-reason-bar">

                    <span
                      style={{
                        width: `${reason.percentage}%`,
                      }}
                    ></span>

                  </div>

                  <small>
                    {reason.percentage}% of delays
                  </small>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* ================= DELAY TREND ================= */}

        <section className="eta-panel delay-trend-panel">

          <div className="eta-panel-header">

            <div>
              <span className="eta-panel-label">
                PERFORMANCE TREND
              </span>

              <h2>Delay Trend</h2>

              <p>
                Delayed shipments recorded over the last 7 days.
              </p>

            </div>

            <span className="trend-value">
              7.0%
              <small>Delay Rate</small>
            </span>

          </div>


          <div className="delay-chart">

            <div className="chart-y-axis">
              <span>12</span>
              <span>9</span>
              <span>6</span>
              <span>3</span>
              <span>0</span>
            </div>


            <div className="chart-area">

              <div className="chart-grid-line one"></div>
              <div className="chart-grid-line two"></div>
              <div className="chart-grid-line three"></div>
              <div className="chart-grid-line four"></div>


              <div className="chart-bars">

                <div className="chart-bar-item">
                  <span style={{ height: "45%" }}></span>
                  <small>Mon</small>
                </div>

                <div className="chart-bar-item">
                  <span style={{ height: "62%" }}></span>
                  <small>Tue</small>
                </div>

                <div className="chart-bar-item">
                  <span style={{ height: "35%" }}></span>
                  <small>Wed</small>
                </div>

                <div className="chart-bar-item">
                  <span style={{ height: "76%" }}></span>
                  <small>Thu</small>
                </div>

                <div className="chart-bar-item">
                  <span style={{ height: "52%" }}></span>
                  <small>Fri</small>
                </div>

                <div className="chart-bar-item">
                  <span style={{ height: "68%" }}></span>
                  <small>Sat</small>
                </div>

                <div className="chart-bar-item">
                  <span style={{ height: "43%" }}></span>
                  <small>Sun</small>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= DELAYED SHIPMENTS ================= */}

        <section className="eta-panel delayed-table-panel">

          <div className="eta-panel-header">

            <div>

              <span className="eta-panel-label">
                ATTENTION REQUIRED
              </span>

              <h2>Delayed Shipments</h2>

              <p>
                Shipments currently experiencing ETA exceptions.
              </p>

            </div>

            <Link
              to="/operator/shipment-tracking"
              className="eta-view-link"
            >
              View shipments →
            </Link>

          </div>


          <div className="eta-table-wrapper">

            <table className="eta-table">

              <thead>

                <tr>
                  <th>Shipment</th>
                  <th>Route</th>
                  <th>Driver</th>
                  <th>ETA</th>
                  <th>Delay</th>
                  <th>Reason</th>
                  <th>Risk</th>
                  <th>Progress</th>
                </tr>

              </thead>


              <tbody>

                {delayedShipments.map((shipment) => (

                  <tr key={shipment.id}>

                    <td>

                      <div className="eta-shipment">

                        <span className="eta-shipment-icon">
                          ▣
                        </span>

                        <div>
                          <strong>{shipment.id}</strong>

                          <small>
                            {shipment.vehicle}
                          </small>
                        </div>

                      </div>

                    </td>


                    <td>
                      <span className="eta-route">
                        {shipment.route}
                      </span>
                    </td>


                    <td>
                      <span className="eta-driver">
                        {shipment.driver}
                      </span>
                    </td>


                    <td>
                      <span className="eta-time">
                        {shipment.eta}
                      </span>
                    </td>


                    <td>
                      <span className="delay-value">
                        +{shipment.delay}
                      </span>
                    </td>


                    <td>
                      <span className="delay-reason-text">
                        {shipment.reason}
                      </span>
                    </td>


                    <td>

                      <span
                        className={`risk-badge ${
                          shipment.risk === "High"
                            ? "high"
                            : shipment.risk === "Medium"
                            ? "medium"
                            : "low"
                        }`}
                      >
                        {shipment.risk}
                      </span>

                    </td>


                    <td>

                      <div className="eta-progress">

                        <div className="eta-progress-bar">

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

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* ================= BOTTOM INSIGHTS ================= */}

        <section className="eta-bottom-grid">

          <div className="eta-insight-card">

            <div className="eta-insight-icon">
              ⚡
            </div>

            <div>
              <span>Highest Delay Risk</span>

              <strong>
                Chennai → Hyderabad
              </strong>

              <small>
                3h 20m delay · Heavy traffic
              </small>
            </div>

          </div>


          <div className="eta-insight-card">

            <div className="eta-insight-icon">
              ◷
            </div>

            <div>
              <span>Average Recovery</span>

              <strong>
                42 minutes
              </strong>

              <small>
                Average delay recovery time
              </small>
            </div>

          </div>


          <div className="eta-insight-card success">

            <div className="eta-insight-icon">
              ✓
            </div>

            <div>
              <span>ETA Accuracy</span>

              <strong>
                94.2%
              </strong>

              <small>
                Predictions within 30 minutes
              </small>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default OperatorETADelays;