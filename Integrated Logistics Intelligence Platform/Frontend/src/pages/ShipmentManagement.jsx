import { useState } from "react";
import { Link } from "react-router-dom";
import "./ShipmentManagement.css";

const shipmentData = [
  {
    id: "TRK-2026-101",
    order: "ORD-2026-501",
    customer: "TechNova Pvt Ltd",
    route: "Hyderabad → Bangalore",
    status: "In Transit",
    priority: "Express",
    date: "02 Sep 2026",
    eta: "Today, 6:30 PM",
  },
  {
    id: "TRK-2026-102",
    order: "ORD-2026-502",
    customer: "UrbanMart",
    route: "Mumbai → Pune",
    status: "Delivered",
    priority: "Standard",
    date: "01 Sep 2026",
    eta: "Delivered",
  },
  {
    id: "TRK-2026-103",
    order: "ORD-2026-503",
    customer: "GreenLeaf Foods",
    route: "Chennai → Hyderabad",
    status: "Picked Up",
    priority: "Standard",
    date: "01 Sep 2026",
    eta: "03 Sep 2026",
  },
  {
    id: "TRK-2026-104",
    order: "ORD-2026-504",
    customer: "BuildPro Industries",
    route: "Delhi → Jaipur",
    status: "Delayed",
    priority: "Urgent",
    date: "31 Aug 2026",
    eta: "05 Sep 2026",
  },
  {
    id: "TRK-2026-105",
    order: "ORD-2026-505",
    customer: "FreshCart",
    route: "Bangalore → Chennai",
    status: "In Transit",
    priority: "Express",
    date: "30 Aug 2026",
    eta: "04 Sep 2026",
  },
  {
    id: "TRK-2026-106",
    order: "ORD-2026-506",
    customer: "MediCare Supplies",
    route: "Pune → Mumbai",
    status: "Delivered",
    priority: "Standard",
    date: "29 Aug 2026",
    eta: "Delivered",
  },
  {
    id: "TRK-2026-107",
    order: "ORD-2026-507",
    customer: "AutoParts India",
    route: "Hyderabad → Chennai",
    status: "Delayed",
    priority: "Urgent",
    date: "28 Aug 2026",
    eta: "06 Sep 2026",
  },
  {
    id: "TRK-2026-108",
    order: "ORD-2026-508",
    customer: "SmartHome",
    route: "Delhi → Gurgaon",
    status: "Picked Up",
    priority: "Standard",
    date: "27 Aug 2026",
    eta: "03 Sep 2026",
  },
];

function ShipmentManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredShipments = shipmentData.filter((shipment) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      shipment.id.toLowerCase().includes(searchValue) ||
      shipment.order.toLowerCase().includes(searchValue) ||
      shipment.customer.toLowerCase().includes(searchValue) ||
      shipment.route.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" ||
      shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="shipment-management-page">

      {/* =================================
          SIDEBAR
      ================================= */}

      <aside className="management-sidebar">

        <div className="management-logo">

          <div className="management-logo-icon">
            S
          </div>

          <div>
            <h2>ShipTrack Pro</h2>
            <span>LOGISTICS INTELLIGENCE</span>
          </div>

        </div>


        <div className="management-menu-title">
          BUSINESS CLIENT
        </div>


        <nav className="management-navigation">

          <Link
            to="/dashboard/business"
            className="management-nav-link"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="management-nav-link"
          >
            <span>＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="management-nav-link active"
          >
            <span>▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="management-nav-link"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="management-nav-link"
          >
            <span>□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="management-nav-link"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="management-nav-link"
          >
            <span>↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="management-nav-link"
          >
            <span>!</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="management-nav-link"
          >
            <span>◎</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="management-nav-link"
          >
            <span>♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="management-nav-link"
          >
            <span>▥</span>
            Reports & Export
          </Link>

        </nav>


        <Link
          to="/login"
          className="management-logout"
        >
          ⇥ Logout
        </Link>

      </aside>


      {/* =================================
          MAIN
      ================================= */}

      <main className="management-main">

        {/* HEADER */}

        <header className="management-header">

          <div>

            <div className="management-breadcrumb">
              BUSINESS CLIENT / SHIPMENT MANAGEMENT
            </div>

            <h1>
              Shipment Management
            </h1>

            <p>
              View, search and manage all your business shipments.
            </p>

          </div>


          <div className="management-profile">

            <div className="management-avatar">
              R
            </div>

            <div>
              <strong>Rekha Patil</strong>
              <span>Business Client</span>
            </div>

          </div>

        </header>


        {/* =================================
            SUMMARY
        ================================= */}

        <section className="management-summary">

          <div className="summary-card">

            <span>Total Shipments</span>

            <strong>128</strong>

            <small>All shipments</small>

          </div>


          <div className="summary-card">

            <span>In Transit</span>

            <strong>32</strong>

            <small>Currently moving</small>

          </div>


          <div className="summary-card">

            <span>Delivered</span>

            <strong>87</strong>

            <small>Successfully delivered</small>

          </div>


          <div className="summary-card">

            <span>Delayed</span>

            <strong>09</strong>

            <small>Needs attention</small>

          </div>

        </section>


        {/* =================================
            TABLE PANEL
        ================================= */}

        <section className="management-panel">

          <div className="management-panel-header">

            <div>

              <span>
                SHIPMENT DATABASE
              </span>

              <h2>
                All Shipments
              </h2>

            </div>


            <Link
              to="/business/create-shipment"
              className="management-create-btn"
            >
              + Create Shipment
            </Link>

          </div>


          {/* SEARCH / FILTER */}

          <div className="management-tools">

            <div className="management-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search tracking ID, order, customer or route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>


            <select
              className="management-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Picked Up">Picked Up</option>
              <option value="Delayed">Delayed</option>
            </select>

          </div>


          {/* TABLE */}

          <div className="management-table-wrapper">

            <table className="management-table">

              <thead>

                <tr>

                  <th>TRACKING ID</th>

                  <th>CUSTOMER</th>

                  <th>ROUTE</th>

                  <th>CREATED</th>

                  <th>PRIORITY</th>

                  <th>STATUS</th>

                  <th>ETA</th>

                  <th>ACTION</th>

                </tr>

              </thead>


              <tbody>

                {filteredShipments.map((shipment) => (

                  <tr key={shipment.id}>

                    <td>

                      <strong>
                        {shipment.id}
                      </strong>

                      <small>
                        {shipment.order}
                      </small>

                    </td>


                    <td>

                      <strong className="customer-name">
                        {shipment.customer}
                      </strong>

                    </td>


                    <td>

                      <span className="route-text">
                        {shipment.route}
                      </span>

                    </td>


                    <td>

                      <span className="date-text">
                        {shipment.date}
                      </span>

                    </td>


                    <td>

                      <span
                        className={`priority ${shipment.priority
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {shipment.priority}
                      </span>

                    </td>


                    <td>

                      <span
                        className={`management-status ${shipment.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        ● {shipment.status}
                      </span>

                    </td>


                    <td>

                      <span className="eta-text">
                        {shipment.eta}
                      </span>

                    </td>


                    <td>

                      <Link
                        to={`/business/tracking?trackingNumber=${shipment.id}`}
                        className="manage-action"
                      >
                        Track
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>


            {filteredShipments.length === 0 && (

              <div className="no-results">

                <div>
                  ⌕
                </div>

                <h3>
                  No shipments found
                </h3>

                <p>
                  Try changing your search or status filter.
                </p>

              </div>

            )}

          </div>


          {/* FOOTER */}

          <div className="management-table-footer">

            <span>
              Showing {filteredShipments.length} of 128 shipments
            </span>

            <div className="pagination">

              <button>
                ‹
              </button>

              <button className="current-page">
                1
              </button>

              <button>
                2
              </button>

              <button>
                3
              </button>

              <button>
                …
              </button>

              <button>
                13
              </button>

              <button>
                ›
              </button>

            </div>

          </div>

        </section>


        <footer className="management-footer">
          © 2026 ShipTrack Pro · Integrated Logistics Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default ShipmentManagement;