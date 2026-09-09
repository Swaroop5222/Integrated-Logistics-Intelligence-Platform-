import { Link } from "react-router-dom";
import "./ShipmentHistory.css";

const shipments = [
  {
    id: "TRK-2026-001",
    from: "Hyderabad",
    to: "Bangalore",
    date: "Aug 28, 2026",
    delivered: "Aug 30, 2026",
    status: "Delivered",
    type: "Electronics",
  },
  {
    id: "TRK-2026-002",
    from: "Mumbai",
    to: "Pune",
    date: "Aug 25, 2026",
    delivered: "Aug 27, 2026",
    status: "Delivered",
    type: "Documents",
  },
  {
    id: "TRK-2026-003",
    from: "Delhi",
    to: "Jaipur",
    date: "Aug 20, 2026",
    delivered: "Aug 22, 2026",
    status: "Delivered",
    type: "Clothing",
  },
  {
    id: "TRK-2026-004",
    from: "Chennai",
    to: "Hyderabad",
    date: "Aug 15, 2026",
    delivered: "Aug 18, 2026",
    status: "Delivered",
    type: "Home Appliances",
  },
  {
    id: "TRK-2026-005",
    from: "Kolkata",
    to: "Bangalore",
    date: "Aug 10, 2026",
    delivered: "Aug 13, 2026",
    status: "Delivered",
    type: "Books",
  },
];

function ShipmentHistory() {
  return (
    <div className="history-page">
      {/* SIDEBAR */}
      <aside className="history-sidebar">
        <div className="history-logo">
          <div className="logo-icon">S</div>
          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="history-menu-title">CUSTOMER</div>

        <nav>
          <Link to="/dashboard/customer" className="history-nav-link">
            <span>⌂</span>
            Overview
          </Link>

          <Link to="/shipments/active" className="history-nav-link">
            <span>▣</span>
            Active Shipments
          </Link>

          <Link
            to="/shipments/history"
            className="history-nav-link active"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link to="/tracking" className="history-nav-link">
            <span>⌖</span>
            Tracking
          </Link>

          <Link to="/notifications" className="history-nav-link">
            <span>♢</span>
            Notifications
          </Link>

          <Link to="/tracking-insights" className="history-nav-link">
            <span>▥</span>
            Tracking Insights
          </Link>
        </nav>

        <div className="history-sidebar-bottom">
          <Link to="/login" className="history-logout">
            ⇥ Logout
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="history-main">
        <header className="history-header">
          <div>
            <div className="history-breadcrumb">
              Customer / Shipment History
            </div>
            <h1>Shipment History</h1>
            <p>View and review your previously completed shipments.</p>
          </div>

          <div className="history-header-actions">
            <Link to="/notifications" className="history-icon-btn">
              ♢
            </Link>

            <div className="history-avatar">R</div>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="history-stats">
          <div className="history-stat-card">
            <span>Total Shipments</span>
            <strong>24</strong>
            <small>All time shipments</small>
          </div>

          <div className="history-stat-card">
            <span>Delivered</span>
            <strong>22</strong>
            <small>Successfully delivered</small>
          </div>

          <div className="history-stat-card">
            <span>Success Rate</span>
            <strong>91.7%</strong>
            <small>Delivery performance</small>
          </div>

          <div className="history-stat-card">
            <span>Avg. Delivery</span>
            <strong>2.4d</strong>
            <small>Average delivery time</small>
          </div>
        </section>

        {/* TABLE */}
        <section className="history-panel">
          <div className="history-panel-header">
            <div>
              <h2>Completed Shipments</h2>
              <p>Your recently completed shipments</p>
            </div>

            <button className="history-filter">
              All Shipments ▾
            </button>
          </div>

          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Route</th>
                  <th>Type</th>
                  <th>Shipped</th>
                  <th>Delivered</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>
                      <strong>{shipment.id}</strong>
                    </td>

                    <td>
                      <div className="route-cell">
                        <span>{shipment.from}</span>
                        <b>→</b>
                        <span>{shipment.to}</span>
                      </div>
                    </td>

                    <td>{shipment.type}</td>

                    <td>{shipment.date}</td>

                    <td>{shipment.delivered}</td>

                    <td>
                      <span className="status-delivered">
                        ● {shipment.status}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/tracking?trackingNumber=${shipment.id}`}
                        className="history-view-btn"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="history-footer">
          © 2026 ShipTrack Pro · Integrated Logistics Intelligence Platform
        </footer>
      </main>
    </div>
  );
}

export default ShipmentHistory;