import { useState } from "react";
import { Link } from "react-router-dom";
import "./BusinessShipmentHistory.css";

const historyData = [
  {
    id: "TRK-2026-098",
    order: "ORD-2026-498",
    customer: "MegaRetail",
    route: "Hyderabad → Mumbai",
    date: "28 Aug 2026",
    delivered: "31 Aug 2026",
    status: "Delivered",
  },
  {
    id: "TRK-2026-097",
    order: "ORD-2026-497",
    customer: "HealthPlus",
    route: "Pune → Bangalore",
    date: "27 Aug 2026",
    delivered: "30 Aug 2026",
    status: "Delivered",
  },
  {
    id: "TRK-2026-096",
    order: "ORD-2026-496",
    customer: "UrbanMart",
    route: "Mumbai → Pune",
    date: "25 Aug 2026",
    delivered: "28 Aug 2026",
    status: "Delivered",
  },
  {
    id: "TRK-2026-095",
    order: "ORD-2026-495",
    customer: "FreshCart",
    route: "Bangalore → Chennai",
    date: "23 Aug 2026",
    delivered: "27 Aug 2026",
    status: "Delivered",
  },
  {
    id: "TRK-2026-094",
    order: "ORD-2026-494",
    customer: "TechNova Pvt Ltd",
    route: "Delhi → Hyderabad",
    date: "21 Aug 2026",
    delivered: "25 Aug 2026",
    status: "Delivered",
  },
  {
    id: "TRK-2026-093",
    order: "ORD-2026-493",
    customer: "GreenLeaf Foods",
    route: "Chennai → Bangalore",
    date: "20 Aug 2026",
    delivered: "24 Aug 2026",
    status: "Returned",
  },
  {
    id: "TRK-2026-092",
    order: "ORD-2026-492",
    customer: "BuildPro Industries",
    route: "Delhi → Jaipur",
    date: "18 Aug 2026",
    delivered: "23 Aug 2026",
    status: "Delivered",
  },
  {
    id: "TRK-2026-091",
    order: "ORD-2026-491",
    customer: "AutoParts India",
    route: "Hyderabad → Chennai",
    date: "16 Aug 2026",
    delivered: "21 Aug 2026",
    status: "Cancelled",
  },
];

function BusinessShipmentHistory() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredHistory = historyData.filter((shipment) => {
    const value = search.toLowerCase();

    const matchesSearch =
      shipment.id.toLowerCase().includes(value) ||
      shipment.order.toLowerCase().includes(value) ||
      shipment.customer.toLowerCase().includes(value) ||
      shipment.route.toLowerCase().includes(value);

    const matchesStatus =
      status === "All" || shipment.status === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="business-history-page">

      {/* SIDEBAR */}

      <aside className="business-history-sidebar">

        <div className="business-history-logo">
          <div className="business-history-logo-icon">
            S
          </div>

          <div>
            <h2>ShipTrack Pro</h2>
            <span>LOGISTICS INTELLIGENCE</span>
          </div>
        </div>

        <div className="business-history-menu-title">
          BUSINESS CLIENT
        </div>

        <nav>

          <Link
            to="/dashboard/business"
            className="business-history-nav"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="business-history-nav"
          >
            <span>＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="business-history-nav"
          >
            <span>▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="business-history-nav active"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="business-history-nav"
          >
            <span>□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="business-history-nav"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="business-history-nav"
          >
            <span>↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-history-nav"
          >
            <span>!</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-history-nav"
          >
            <span>◎</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="business-history-nav"
          >
            <span>♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="business-history-nav"
          >
            <span>▥</span>
            Reports & Export
          </Link>

        </nav>

        <Link
          to="/login"
          className="business-history-logout"
        >
          ⇥ Logout
        </Link>

      </aside>


      {/* MAIN */}

      <main className="business-history-main">

        <header className="business-history-header">

          <div>

            <div className="business-history-breadcrumb">
              BUSINESS CLIENT / SHIPMENT HISTORY
            </div>

            <h1>
              Shipment History
            </h1>

            <p>
              Review completed and previous business shipments.
            </p>

          </div>

          <div className="business-history-profile">

            <div className="business-history-avatar">
              R
            </div>

            <div>
              <strong>Rekha Patil</strong>
              <span>Business Client</span>
            </div>

          </div>

        </header>


        {/* SUMMARY */}

        <section className="business-history-summary">

          <div className="history-summary-card">
            <span>Historical Shipments</span>
            <strong>96</strong>
            <small>Previous shipments</small>
          </div>

          <div className="history-summary-card">
            <span>Delivered</span>
            <strong>89</strong>
            <small>Successfully delivered</small>
          </div>

          <div className="history-summary-card">
            <span>Returned</span>
            <strong>04</strong>
            <small>Returned shipments</small>
          </div>

          <div className="history-summary-card">
            <span>Cancelled</span>
            <strong>03</strong>
            <small>Cancelled shipments</small>
          </div>

        </section>


        {/* HISTORY PANEL */}

        <section className="business-history-panel">

          <div className="business-history-panel-header">

            <div>
              <span>SHIPMENT RECORDS</span>
              <h2>Previous Shipments</h2>
            </div>

            <Link
              to="/business/create-shipment"
              className="history-create-btn"
            >
              + Create Shipment
            </Link>

          </div>


          {/* SEARCH */}

          <div className="history-tools">

            <div className="history-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search tracking ID, order, customer or route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="history-filter"
            >
              <option value="All">All Status</option>
              <option value="Delivered">Delivered</option>
              <option value="Returned">Returned</option>
              <option value="Cancelled">Cancelled</option>
            </select>

          </div>


          {/* TABLE */}

          <div className="history-table-wrapper">

            <table className="history-table">

              <thead>

                <tr>
                  <th>TRACKING ID</th>
                  <th>CUSTOMER</th>
                  <th>ROUTE</th>
                  <th>SHIPMENT DATE</th>
                  <th>DELIVERED</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>

              </thead>

              <tbody>

                {filteredHistory.map((shipment) => (

                  <tr key={shipment.id}>

                    <td>
                      <strong>{shipment.id}</strong>
                      <small>{shipment.order}</small>
                    </td>

                    <td>
                      <strong className="history-customer">
                        {shipment.customer}
                      </strong>
                    </td>

                    <td>
                      {shipment.route}
                    </td>

                    <td>
                      {shipment.date}
                    </td>

                    <td>
                      {shipment.delivered}
                    </td>

                    <td>
                      <span
                        className={`history-status ${shipment.status.toLowerCase()}`}
                      >
                        ● {shipment.status}
                      </span>
                    </td>

                    <td>

                      <Link
                        to={`/business/tracking?trackingNumber=${shipment.id}`}
                        className="history-view-btn"
                      >
                        View
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>


            {filteredHistory.length === 0 && (

              <div className="history-empty">

                <div>⌕</div>

                <h3>
                  No shipment history found
                </h3>

                <p>
                  Try changing your search or status filter.
                </p>

              </div>

            )}

          </div>


          <div className="history-footer">

            <span>
              Showing {filteredHistory.length} historical shipments
            </span>

            <div className="history-pages">

              <button>‹</button>
              <button className="selected">1</button>
              <button>2</button>
              <button>3</button>
              <button>›</button>

            </div>

          </div>

        </section>


        <footer className="business-history-bottom">
          © 2026 ShipTrack Pro · Integrated Logistics Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default BusinessShipmentHistory;