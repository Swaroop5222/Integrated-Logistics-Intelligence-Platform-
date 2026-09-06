import { Link } from "react-router-dom";
import "./PackageInformation.css";

const packages = [
  {
    id: "PKG-2026-001",
    tracking: "TRK-2026-101",
    type: "Box",
    quantity: 2,
    weight: "12.5 kg",
    dimensions: "40 × 30 × 25 cm",
    category: "Electronics",
    value: "₹45,000",
    status: "In Transit",
  },
  {
    id: "PKG-2026-002",
    tracking: "TRK-2026-102",
    type: "Pallet",
    quantity: 1,
    weight: "85 kg",
    dimensions: "120 × 80 × 100 cm",
    category: "Industrial",
    value: "₹78,500",
    status: "Delivered",
  },
  {
    id: "PKG-2026-003",
    tracking: "TRK-2026-103",
    type: "Box",
    quantity: 4,
    weight: "24 kg",
    dimensions: "50 × 40 × 30 cm",
    category: "Food Products",
    value: "₹18,200",
    status: "Picked Up",
  },
  {
    id: "PKG-2026-004",
    tracking: "TRK-2026-104",
    type: "Crate",
    quantity: 1,
    weight: "120 kg",
    dimensions: "150 × 90 × 80 cm",
    category: "Machinery",
    value: "₹1,25,000",
    status: "Delayed",
  },
  {
    id: "PKG-2026-005",
    tracking: "TRK-2026-105",
    type: "Envelope",
    quantity: 3,
    weight: "2.4 kg",
    dimensions: "35 × 25 × 5 cm",
    category: "Documents",
    value: "₹8,500",
    status: "In Transit",
  },
];

function PackageInformation() {
  return (
    <div className="package-info-page">

      {/* SIDEBAR */}

      <aside className="package-sidebar">

        <div className="package-logo">
          <div className="package-logo-icon">S</div>

          <div>
            <h2>ShipTrack Pro</h2>
            <span>LOGISTICS INTELLIGENCE</span>
          </div>
        </div>

        <div className="package-menu-title">
          BUSINESS CLIENT
        </div>

        <nav>

          <Link to="/dashboard/business" className="package-nav">
            <span>⌂</span>
            Overview
          </Link>

          <Link to="/business/create-shipment" className="package-nav">
            <span>＋</span>
            Create Shipment
          </Link>

          <Link to="/business/shipment-management" className="package-nav">
            <span>▣</span>
            Shipment Management
          </Link>

          <Link to="/business/shipment-history" className="package-nav">
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="package-nav active"
          >
            <span>□</span>
            Package Information
          </Link>

          <Link to="/business/tracking" className="package-nav">
            <span>⌖</span>
            Tracking
          </Link>

          <Link to="/business/delivery-performance" className="package-nav">
            <span>↗</span>
            Delivery Performance
          </Link>

          <Link to="/business/delay-analysis" className="package-nav">
            <span>!</span>
            Delay Analysis
          </Link>

          <Link to="/business/logistics-overview" className="package-nav">
            <span>◎</span>
            Logistics Overview
          </Link>

          <Link to="/business/customer-activity" className="package-nav">
            <span>♙</span>
            Customer Activity
          </Link>

          <Link to="/business/reports" className="package-nav">
            <span>▥</span>
            Reports & Export
          </Link>

        </nav>

        <Link to="/login" className="package-logout">
          ⇥ Logout
        </Link>

      </aside>


      {/* MAIN */}

      <main className="package-main">

        <header className="package-header">

          <div>
            <div className="package-breadcrumb">
              BUSINESS CLIENT / PACKAGE INFORMATION
            </div>

            <h1>Package Information</h1>

            <p>
              View package dimensions, weight, category and shipment details.
            </p>
          </div>

          <div className="package-profile">

            <div className="package-avatar">
              R
            </div>

            <div>
              <strong>Rekha Patil</strong>
              <span>Business Client</span>
            </div>

          </div>

        </header>


        {/* SUMMARY */}

        <section className="package-summary">

          <div className="package-summary-card">
            <span>Total Packages</span>
            <strong>256</strong>
            <small>Across all shipments</small>
          </div>

          <div className="package-summary-card">
            <span>Total Weight</span>
            <strong>4.8T</strong>
            <small>Current shipment volume</small>
          </div>

          <div className="package-summary-card">
            <span>Electronics</span>
            <strong>82</strong>
            <small>Package category</small>
          </div>

          <div className="package-summary-card">
            <span>High Value</span>
            <strong>24</strong>
            <small>Insurance required</small>
          </div>

        </section>


        {/* PACKAGE TABLE */}

        <section className="package-panel">

          <div className="package-panel-header">

            <div>
              <span>PACKAGE DATABASE</span>
              <h2>Package Records</h2>
            </div>

            <Link
              to="/business/create-shipment"
              className="package-create-btn"
            >
              + Add Package
            </Link>

          </div>


          {/* FILTER BAR */}

          <div className="package-filter-bar">

            <div className="package-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search package or tracking ID..."
              />
            </div>

            <select className="package-filter">
              <option>All Package Types</option>
              <option>Box</option>
              <option>Envelope</option>
              <option>Pallet</option>
              <option>Crate</option>
            </select>

            <select className="package-filter">
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Industrial</option>
              <option>Food Products</option>
              <option>Documents</option>
              <option>Machinery</option>
            </select>

          </div>


          <div className="package-table-wrapper">

            <table className="package-table">

              <thead>

                <tr>
                  <th>PACKAGE ID</th>
                  <th>TRACKING ID</th>
                  <th>TYPE</th>
                  <th>QUANTITY</th>
                  <th>WEIGHT</th>
                  <th>DIMENSIONS</th>
                  <th>CATEGORY</th>
                  <th>VALUE</th>
                  <th>STATUS</th>
                </tr>

              </thead>

              <tbody>

                {packages.map((item) => (

                  <tr key={item.id}>

                    <td>
                      <strong>{item.id}</strong>
                    </td>

                    <td>
                      <span className="tracking-id">
                        {item.tracking}
                      </span>
                    </td>

                    <td>
                      <span className="package-type">
                        {item.type}
                      </span>
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      <strong className="weight">
                        {item.weight}
                      </strong>
                    </td>

                    <td>
                      {item.dimensions}
                    </td>

                    <td>
                      <span className="category">
                        {item.category}
                      </span>
                    </td>

                    <td>
                      {item.value}
                    </td>

                    <td>
                      <span
                        className={`package-status ${item.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        ● {item.status}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          <div className="package-table-footer">

            <span>
              Showing 5 of 256 packages
            </span>

            <div className="package-pagination">

              <button>‹</button>
              <button className="selected">1</button>
              <button>2</button>
              <button>3</button>
              <button>…</button>
              <button>26</button>
              <button>›</button>

            </div>

          </div>

        </section>


        <footer className="package-bottom-footer">
          © 2026 ShipTrack Pro · Integrated Logistics Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default PackageInformation;