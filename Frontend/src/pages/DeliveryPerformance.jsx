import { Link } from "react-router-dom";
import "./DeliveryPerformance.css";

function DeliveryPerformance() {
  const routeData = [
    {
      route: "Hyderabad → Bengaluru",
      shipments: 42,
      delivered: 39,
      onTime: "92.8%",
      avgTime: "18.4 hrs",
    },
    {
      route: "Mumbai → Pune",
      shipments: 36,
      delivered: 34,
      onTime: "94.4%",
      avgTime: "8.2 hrs",
    },
    {
      route: "Chennai → Hyderabad",
      shipments: 28,
      delivered: 25,
      onTime: "89.3%",
      avgTime: "21.6 hrs",
    },
    {
      route: "Delhi → Jaipur",
      shipments: 22,
      delivered: 21,
      onTime: "95.5%",
      avgTime: "7.8 hrs",
    },
    {
      route: "Bengaluru → Chennai",
      shipments: 31,
      delivered: 29,
      onTime: "93.5%",
      avgTime: "9.6 hrs",
    },
  ];

  const monthlyData = [
    { month: "Apr", value: 88 },
    { month: "May", value: 91 },
    { month: "Jun", value: 89 },
    { month: "Jul", value: 94 },
    { month: "Aug", value: 92 },
    { month: "Sep", value: 96 },
  ];

  return (
    <div className="delivery-performance-page">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

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
            className="business-nav-link active"
          >
            <span className="nav-icon">↗</span>
            <span>Delivery Performance</span>
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-nav-link"
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


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="delivery-performance-main">

        {/* TOP BAR */}

        <header className="business-topbar">

          <div>
            <div className="breadcrumb">
              Business Client / Delivery Performance
            </div>

            <h1>Delivery Performance</h1>

            <p>
              Monitor delivery efficiency, on-time performance
              and route-level results.
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


        {/* ==========================================
            PERFORMANCE SUMMARY
        ========================================== */}

        <section className="performance-stats">

          <div className="performance-stat orange">
            <div className="stat-top">
              <span>ON-TIME RATE</span>
              <div className="stat-icon">↗</div>
            </div>

            <strong>92.6%</strong>

            <div className="stat-change positive">
              +3.8% <span>vs last month</span>
            </div>
          </div>


          <div className="performance-stat purple">
            <div className="stat-top">
              <span>AVG DELIVERY TIME</span>
              <div className="stat-icon">◷</div>
            </div>

            <strong>14.8 hrs</strong>

            <div className="stat-change positive">
              -1.6 hrs <span>vs last month</span>
            </div>
          </div>


          <div className="performance-stat green">
            <div className="stat-top">
              <span>DELIVERED</span>
              <div className="stat-icon">✓</div>
            </div>

            <strong>87</strong>

            <div className="stat-change positive">
              +8.4% <span>this month</span>
            </div>
          </div>


          <div className="performance-stat pink">
            <div className="stat-top">
              <span>DELAYED</span>
              <div className="stat-icon">!</div>
            </div>

            <strong>09</strong>

            <div className="stat-change negative">
              -2.1% <span>vs last month</span>
            </div>
          </div>

        </section>


        {/* ==========================================
            CHART + BREAKDOWN
        ========================================== */}

        <section className="performance-grid">

          {/* MONTHLY CHART */}

          <div className="performance-panel chart-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  DELIVERY ANALYTICS
                </span>

                <h2>Monthly On-Time Performance</h2>

                <p>
                  Percentage of shipments delivered within
                  the expected delivery window.
                </p>
              </div>

              <div className="period-selector">
                Last 6 Months ▾
              </div>

            </div>


            <div className="chart-area">

              <div className="chart-y-axis">
                <span>100%</span>
                <span>90%</span>
                <span>80%</span>
                <span>70%</span>
                <span>60%</span>
              </div>

              <div className="chart-body">

                <div className="chart-grid-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="bars">

                  {monthlyData.map((item) => (

                    <div
                      className="bar-column"
                      key={item.month}
                    >

                      <div className="bar-value">
                        {item.value}%
                      </div>

                      <div
                        className="performance-bar"
                        style={{
                          height: `${item.value - 55}%`,
                        }}
                      ></div>

                      <span className="bar-label">
                        {item.month}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>


          {/* DELIVERY BREAKDOWN */}

          <div className="performance-panel breakdown-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  SHIPMENT STATUS
                </span>

                <h2>Delivery Breakdown</h2>
              </div>

            </div>


            <div className="breakdown-content">

              <div className="donut-wrapper">

                <div className="donut-chart">
                  <div className="donut-center">
                    <strong>128</strong>
                    <span>Total</span>
                  </div>
                </div>

              </div>


              <div className="breakdown-list">

                <div className="breakdown-item">
                  <span className="legend delivered"></span>

                  <div>
                    <strong>Delivered</strong>
                    <small>87 shipments</small>
                  </div>

                  <b>68%</b>
                </div>


                <div className="breakdown-item">
                  <span className="legend transit"></span>

                  <div>
                    <strong>In Transit</strong>
                    <small>32 shipments</small>
                  </div>

                  <b>25%</b>
                </div>


                <div className="breakdown-item">
                  <span className="legend delayed"></span>

                  <div>
                    <strong>Delayed</strong>
                    <small>9 shipments</small>
                  </div>

                  <b>7%</b>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ==========================================
            ROUTE PERFORMANCE
        ========================================== */}

        <section className="performance-panel route-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                ROUTE ANALYTICS
              </span>

              <h2>Performance by Route</h2>

              <p>
                Compare delivery performance across active
                logistics routes.
              </p>
            </div>

            <button className="export-button">
              ↓ Export Data
            </button>

          </div>


          <div className="route-table-wrapper">

            <table className="route-table">

              <thead>
                <tr>
                  <th>ROUTE</th>
                  <th>SHIPMENTS</th>
                  <th>DELIVERED</th>
                  <th>ON-TIME RATE</th>
                  <th>AVG DELIVERY</th>
                  <th>PERFORMANCE</th>
                </tr>
              </thead>

              <tbody>

                {routeData.map((route, index) => {

                  const percentage =
                    parseFloat(route.onTime);

                  return (
                    <tr key={index}>

                      <td>
                        <strong>
                          {route.route}
                        </strong>
                      </td>

                      <td>
                        {route.shipments}
                      </td>

                      <td>
                        {route.delivered}
                      </td>

                      <td>
                        <span className="on-time-value">
                          {route.onTime}
                        </span>
                      </td>

                      <td>
                        {route.avgTime}
                      </td>

                      <td>

                        <div className="mini-performance">

                          <div className="mini-track">
                            <span
                              style={{
                                width: `${percentage}%`,
                              }}
                            ></span>
                          </div>

                          <small>
                            {percentage >= 93
                              ? "Excellent"
                              : percentage >= 90
                              ? "Good"
                              : "Needs Attention"}
                          </small>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </section>


        {/* ==========================================
            PERFORMANCE INSIGHTS
        ========================================== */}

        <section className="insights-grid">

          <div className="insight-card positive-insight">

            <div className="insight-icon">
              ↗
            </div>

            <div>
              <span>BEST PERFORMING ROUTE</span>

              <strong>
                Delhi → Jaipur
              </strong>

              <p>
                95.5% of shipments are delivered on time.
              </p>
            </div>

          </div>


          <div className="insight-card warning-insight">

            <div className="insight-icon">
              !
            </div>

            <div>
              <span>ROUTE NEEDING ATTENTION</span>

              <strong>
                Chennai → Hyderabad
              </strong>

              <p>
                On-time delivery is currently at 89.3%.
              </p>
            </div>

          </div>


          <div className="insight-card neutral-insight">

            <div className="insight-icon">
              ◷
            </div>

            <div>
              <span>AVERAGE IMPROVEMENT</span>

              <strong>
                1.6 hours faster
              </strong>

              <p>
                Average delivery time improved this month.
              </p>
            </div>

          </div>

        </section>


        {/* ==========================================
            FOOTER
        ========================================== */}

        <footer className="business-footer">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default DeliveryPerformance;