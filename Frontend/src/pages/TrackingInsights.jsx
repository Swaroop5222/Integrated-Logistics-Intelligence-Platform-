import { Link } from "react-router-dom";
import "./TrackingInsights.css";

function TrackingInsights() {
  return (
    <div className="insights-page">
      {/* SIDEBAR */}
      <aside className="insights-sidebar">
        <div className="insights-logo">
          <div className="insights-logo-icon">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="insights-menu-title">CUSTOMER</div>

        <nav>
          <Link to="/dashboard/customer" className="insights-nav-link">
            <span>⌂</span>
            Overview
          </Link>

          <Link to="/shipments/active" className="insights-nav-link">
            <span>▣</span>
            Active Shipments
          </Link>

          <Link to="/shipments/history" className="insights-nav-link">
            <span>◷</span>
            Shipment History
          </Link>

          <Link to="/tracking" className="insights-nav-link">
            <span>⌖</span>
            Tracking
          </Link>

          <Link to="/notifications" className="insights-nav-link">
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
          <Link to="/login" className="insights-logout">
            ⇥ Logout
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="insights-main">
        <header className="insights-header">
          <div>
            <div className="insights-breadcrumb">
              Customer / Tracking Insights
            </div>

            <h1>Tracking Insights</h1>

            <p>
              Understand your shipment performance and delivery trends.
            </p>
          </div>

          <div className="insights-avatar">R</div>
        </header>

        {/* STATS */}
        <section className="insights-stats">
          <div className="insight-stat-card">
            <span>ON-TIME DELIVERY</span>
            <strong>91.7%</strong>
            <small>↑ 4.2% from last month</small>
          </div>

          <div className="insight-stat-card">
            <span>AVG. DELIVERY TIME</span>
            <strong>2.4 days</strong>
            <small>↓ 0.3 days improvement</small>
          </div>

          <div className="insight-stat-card">
            <span>ACTIVE SHIPMENTS</span>
            <strong>6</strong>
            <small>Currently in transit</small>
          </div>

          <div className="insight-stat-card">
            <span>SUCCESSFUL DELIVERIES</span>
            <strong>22</strong>
            <small>Out of 24 shipments</small>
          </div>
        </section>

        {/* ANALYTICS */}
        <section className="insights-grid">
          <div className="insights-panel large">
            <div className="insights-panel-header">
              <div>
                <h2>Delivery Performance</h2>
                <p>Shipment delivery trend over the last 6 months.</p>
              </div>

              <span className="insights-period">6 Months ▾</span>
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
                <div className="chart-bar">
                  <span style={{ height: "62%" }}></span>
                  <small>Apr</small>
                </div>

                <div className="chart-bar">
                  <span style={{ height: "72%" }}></span>
                  <small>May</small>
                </div>

                <div className="chart-bar">
                  <span style={{ height: "68%" }}></span>
                  <small>Jun</small>
                </div>

                <div className="chart-bar">
                  <span style={{ height: "82%" }}></span>
                  <small>Jul</small>
                </div>

                <div className="chart-bar">
                  <span style={{ height: "76%" }}></span>
                  <small>Aug</small>
                </div>

                <div className="chart-bar current">
                  <span style={{ height: "92%" }}></span>
                  <small>Sep</small>
                </div>
              </div>
            </div>
          </div>

          <div className="insights-panel">
            <div className="insights-panel-header">
              <div>
                <h2>Shipment Status</h2>
                <p>Current shipment distribution</p>
              </div>
            </div>

            <div className="status-breakdown">
              <div>
                <span className="status-dot transit"></span>
                <label>In Transit</label>
                <strong>6</strong>
              </div>

              <div>
                <span className="status-dot delivered"></span>
                <label>Delivered</label>
                <strong>22</strong>
              </div>

              <div>
                <span className="status-dot delayed"></span>
                <label>Delayed</label>
                <strong>1</strong>
              </div>

              <div>
                <span className="status-dot pending"></span>
                <label>Pending</label>
                <strong>2</strong>
              </div>
            </div>
          </div>
        </section>

        {/* INSIGHTS */}
        <section className="insight-bottom-grid">
          <div className="insight-highlight">
            <span>BEST PERFORMANCE</span>
            <h2>Express shipments are performing 14% faster.</h2>
            <p>
              Your express deliveries have the highest on-time
              delivery rate compared with standard shipments.
            </p>

            <Link to="/shipments/history">
              View shipment history →
            </Link>
          </div>

          <div className="insight-highlight purple">
            <span>TRACKING VISIBILITY</span>
            <h2>Real-time tracking is active.</h2>
            <p>
              You can follow the latest location and estimated
              delivery time for your active shipments.
            </p>

            <Link to="/tracking">
              Track a shipment →
            </Link>
          </div>
        </section>

        <footer className="insights-footer">
          © 2026 ShipTrack Pro · Integrated Logistics Intelligence Platform
        </footer>
      </main>
    </div>
  );
}

export default TrackingInsights;