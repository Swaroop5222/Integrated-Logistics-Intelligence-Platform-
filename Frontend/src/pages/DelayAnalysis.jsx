import { Link } from "react-router-dom";
import "./DelayAnalysis.css";

function DelayAnalysis() {
  const delayReasons = [
    {
      reason: "Traffic Congestion",
      shipments: 18,
      percentage: 32,
    },
    {
      reason: "Weather Conditions",
      shipments: 12,
      percentage: 21,
    },
    {
      reason: "Warehouse Processing",
      shipments: 10,
      percentage: 18,
    },
    {
      reason: "Vehicle Breakdown",
      shipments: 8,
      percentage: 14,
    },
    {
      reason: "Address Issues",
      shipments: 5,
      percentage: 9,
    },
    {
      reason: "Other",
      shipments: 3,
      percentage: 6,
    },
  ];

  const routeData = [
    {
      route: "Chennai → Hyderabad",
      delayed: 7,
      total: 28,
      rate: "25.0%",
      avgDelay: "6.4 hrs",
      risk: "High Risk",
    },
    {
      route: "Hyderabad → Bengaluru",
      delayed: 5,
      total: 42,
      rate: "11.9%",
      avgDelay: "4.2 hrs",
      risk: "Medium",
    },
    {
      route: "Mumbai → Pune",
      delayed: 3,
      total: 36,
      rate: "8.3%",
      avgDelay: "2.8 hrs",
      risk: "Medium",
    },
    {
      route: "Bengaluru → Chennai",
      delayed: 2,
      total: 31,
      rate: "6.5%",
      avgDelay: "2.1 hrs",
      risk: "Low Risk",
    },
    {
      route: "Delhi → Jaipur",
      delayed: 1,
      total: 22,
      rate: "4.5%",
      avgDelay: "1.7 hrs",
      risk: "Low Risk",
    },
  ];

  const monthlyData = [
    { month: "Apr", value: 18 },
    { month: "May", value: 14 },
    { month: "Jun", value: 21 },
    { month: "Jul", value: 12 },
    { month: "Aug", value: 16 },
    { month: "Sep", value: 9 },
  ];

  return (
    <div className="delay-analysis-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="business-sidebar">

        <div className="business-brand">
          <div className="brand-logo">S</div>

          <div>
            <h2>ShipTrack Pro</h2>
            <span>LOGISTICS INTELLIGENCE</span>
          </div>
        </div>

        <div className="sidebar-section-title">
          BUSINESS CLIENT
        </div>

        <nav className="business-navigation">

          <Link
            to="/dashboard/business"
            className="business-nav-link"
          >
            <span className="nav-icon">⌂</span>
            <span>Overview</span>
          </Link>

          <Link
            to="/business/create-shipment"
            className="business-nav-link"
          >
            <span className="nav-icon">＋</span>
            <span>Create Shipment</span>
          </Link>

          <Link
            to="/business/shipment-management"
            className="business-nav-link"
          >
            <span className="nav-icon">▣</span>
            <span>Shipment Management</span>
          </Link>

          <Link
            to="/business/shipment-history"
            className="business-nav-link"
          >
            <span className="nav-icon">◷</span>
            <span>Shipment History</span>
          </Link>

          <Link
            to="/business/package-information"
            className="business-nav-link"
          >
            <span className="nav-icon">□</span>
            <span>Package Information</span>
          </Link>

          <Link
            to="/business/tracking"
            className="business-nav-link"
          >
            <span className="nav-icon">⌁</span>
            <span>Tracking</span>
          </Link>

          <Link
            to="/business/delivery-performance"
            className="business-nav-link"
          >
            <span className="nav-icon">↗</span>
            <span>Delivery Performance</span>
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-nav-link active"
          >
            <span className="nav-icon">!</span>
            <span>Delay Analysis</span>
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-nav-link"
          >
            <span className="nav-icon">◎</span>
            <span>Logistics Overview</span>
          </Link>

          <Link
            to="/business/customer-activity"
            className="business-nav-link"
          >
            <span className="nav-icon">♙</span>
            <span>Customer Activity</span>
          </Link>

          <Link
            to="/business/reports"
            className="business-nav-link"
          >
            <span className="nav-icon">▥</span>
            <span>Reports & Export</span>
          </Link>

        </nav>

        <Link
          to="/login"
          className="business-logout"
        >
          <span>⇥</span>
          <span>Logout</span>
        </Link>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="delay-analysis-main">

        {/* HEADER */}

        <header className="business-topbar">

          <div>
            <div className="breadcrumb">
              Business Client / Delay Analysis
            </div>

            <h1>Delay Analysis</h1>

            <p>
              Identify shipment delays, their causes and
              routes requiring attention.
            </p>
          </div>

          <div className="business-user">

            <div className="user-avatar">
              B
            </div>

            <div>
              <strong>Business Client</strong>
              <span>Account</span>
            </div>

          </div>

        </header>


        {/* ================= SUMMARY CARDS ================= */}

        <section className="delay-stats">

          <div className="delay-stat orange">

            <div className="delay-stat-top">
              <span>TOTAL DELAYS</span>

              <div className="delay-stat-icon">
                !
              </div>
            </div>

            <strong>09</strong>

            <p>
              Current delayed shipments
            </p>

          </div>


          <div className="delay-stat pink">

            <div className="delay-stat-top">
              <span>DELAY RATE</span>

              <div className="delay-stat-icon">
                %
              </div>
            </div>

            <strong>7.0%</strong>

            <p>
              Of total shipments
            </p>

          </div>


          <div className="delay-stat purple">

            <div className="delay-stat-top">
              <span>AVG DELAY</span>

              <div className="delay-stat-icon">
                ◷
              </div>
            </div>

            <strong>4.2 hrs</strong>

            <p>
              Average additional time
            </p>

          </div>


          <div className="delay-stat green">

            <div className="delay-stat-top">
              <span>RECOVERED</span>

              <div className="delay-stat-icon">
                ✓
              </div>
            </div>

            <strong>14</strong>

            <p>
              Delays resolved this month
            </p>

          </div>

        </section>


        {/* ================= ANALYTICS ================= */}

        <section className="delay-analytics-grid">

          {/* DELAY TREND */}

          <div className="delay-panel trend-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  DELAY MONITORING
                </span>

                <h2>Delay Trend</h2>

                <p>
                  Number of delayed shipments over the
                  last six months.
                </p>
              </div>

              <span className="panel-badge">
                Last 6 Months
              </span>

            </div>


            <div className="delay-chart">

              <div className="delay-y-axis">
                <span>30</span>
                <span>20</span>
                <span>10</span>
                <span>0</span>
              </div>


              <div className="delay-chart-area">

                <div className="delay-grid">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>


                <div className="delay-columns">

                  {monthlyData.map((item) => (

                    <div
                      className="delay-column"
                      key={item.month}
                    >

                      <span className="delay-value">
                        {item.value}
                      </span>

                      <div
                        className="delay-bar"
                        style={{
                          height: `${item.value * 6}px`,
                        }}
                      ></div>

                      <small>
                        {item.month}
                      </small>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>


          {/* DELAY REASONS */}

          <div className="delay-panel reasons-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  ROOT CAUSE
                </span>

                <h2>Delay Reasons</h2>
              </div>

              <span className="panel-badge">
                56 Cases
              </span>

            </div>


            <div className="reason-list">

              {delayReasons.map((item, index) => (

                <div
                  className="reason-item"
                  key={item.reason}
                >

                  <div className="reason-info">

                    <div className="reason-title">

                      <span
                        className={`reason-dot reason-${index}`}
                      ></span>

                      <strong>
                        {item.reason}
                      </strong>

                    </div>

                    <span>
                      {item.shipments} shipments
                    </span>

                  </div>


                  <div className="reason-progress">

                    <div className="reason-track">

                      <span
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      ></span>

                    </div>

                    <b>
                      {item.percentage}%
                    </b>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* ================= ROUTE TABLE ================= */}

        <section className="delay-panel route-delay-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                ROUTE PERFORMANCE
              </span>

              <h2>Delayed Shipments by Route</h2>

              <p>
                Routes with the highest delay frequency
                and average delay duration.
              </p>
            </div>

            <button className="filter-button">
              This Month ▾
            </button>

          </div>


          <div className="delay-table-wrapper">

            <table className="delay-table">

              <thead>

                <tr>
                  <th>ROUTE</th>
                  <th>DELAYED</th>
                  <th>TOTAL</th>
                  <th>DELAY RATE</th>
                  <th>AVG DELAY</th>
                  <th>RISK LEVEL</th>
                </tr>

              </thead>


              <tbody>

                {routeData.map((route) => (

                  <tr key={route.route}>

                    <td>
                      <strong>
                        {route.route}
                      </strong>
                    </td>

                    <td>
                      <span className="delayed-count">
                        {route.delayed}
                      </span>
                    </td>

                    <td>
                      {route.total}
                    </td>

                    <td>

                      <span
                        className={
                          parseFloat(route.rate) >= 15
                            ? "rate-high"
                            : "rate-normal"
                        }
                      >
                        {route.rate}
                      </span>

                    </td>

                    <td>
                      {route.avgDelay}
                    </td>

                    <td>

                      <span
                        className={`risk-badge ${
                          route.risk === "High Risk"
                            ? "high"
                            : route.risk === "Medium"
                            ? "medium"
                            : "low"
                        }`}
                      >
                        {route.risk}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* ================= INSIGHTS ================= */}

        <section className="delay-insights">

          <div className="delay-insight critical">

            <div className="insight-symbol">
              !
            </div>

            <div>

              <span>
                HIGH PRIORITY
              </span>

              <strong>
                Chennai → Hyderabad
              </strong>

              <p>
                Highest delay rate at 25%. Review traffic
                and route conditions.
              </p>

            </div>

          </div>


          <div className="delay-insight warning">

            <div className="insight-symbol">
              ◷
            </div>

            <div>

              <span>
                AVERAGE IMPACT
              </span>

              <strong>
                4.2 hours
              </strong>

              <p>
                Current average delay across affected
                shipments.
              </p>

            </div>

          </div>


          <div className="delay-insight positive">

            <div className="insight-symbol">
              ✓
            </div>

            <div>

              <span>
                IMPROVEMENT
              </span>

              <strong>
                14 delays recovered
              </strong>

              <p>
                Previously delayed shipments successfully
                brought back on schedule.
              </p>

            </div>

          </div>

        </section>


        {/* ================= FOOTER ================= */}

        <footer className="business-footer">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default DelayAnalysis;