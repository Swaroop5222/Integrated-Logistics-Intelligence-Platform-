import { Link } from "react-router-dom";
import "./OperatorProofOfDelivery.css";

const deliveries = [
  {
    id: "TRK-2026-087",
    order: "ORD-88391",
    customer: "TechWorld Pvt Ltd",
    route: "Hyderabad → Bengaluru",
    driver: "Arjun Kumar",
    deliveredAt: "Today, 5:42 PM",
    receiver: "Ravi Kumar",
    pod: "Verified",
    method: "Signature",
  },
  {
    id: "TRK-2026-091",
    order: "ORD-88395",
    customer: "Global Retail Ltd",
    route: "Mumbai → Pune",
    driver: "Rahul Sharma",
    deliveredAt: "Today, 4:18 PM",
    receiver: "Priya Shah",
    pod: "Verified",
    method: "Photo + Signature",
  },
  {
    id: "TRK-2026-094",
    order: "ORD-88398",
    customer: "FreshMart India",
    route: "Bengaluru → Chennai",
    driver: "Suresh Babu",
    deliveredAt: "Today, 3:51 PM",
    receiver: "Kiran Rao",
    pod: "Verified",
    method: "Signature",
  },
  {
    id: "TRK-2026-098",
    order: "ORD-88402",
    customer: "Metro Electronics",
    route: "Chennai → Hyderabad",
    driver: "Vijay Reddy",
    deliveredAt: "Today, 2:35 PM",
    receiver: "Anil Kumar",
    pod: "Pending",
    method: "Awaiting POD",
  },
  {
    id: "TRK-2026-099",
    order: "ORD-88403",
    customer: "Urban Fashion",
    route: "Delhi → Jaipur",
    driver: "Amit Singh",
    deliveredAt: "Today, 1:48 PM",
    receiver: "Neha Gupta",
    pod: "Exception",
    method: "Signature Missing",
  },
  {
    id: "TRK-2026-100",
    order: "ORD-88404",
    customer: "Smart Home India",
    route: "Mumbai → Nashik",
    driver: "Manoj Verma",
    deliveredAt: "Today, 12:56 PM",
    receiver: "Vivek Joshi",
    pod: "Verified",
    method: "Photo + Signature",
  },
];

function OperatorProofOfDelivery() {
  return (
    <div className="pod-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="pod-sidebar">

        <div className="pod-brand">
          <div className="pod-brand-logo">
            S
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>Operator Console</span>
          </div>
        </div>


        <nav className="pod-nav">

          <Link
            to="/dashboard/operator"
            className="pod-nav-link"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/operator/shipment-tracking"
            className="pod-nav-link"
          >
            <span>▣</span>
            Shipment Tracking
          </Link>

          <Link
            to="/operator/live-delivery"
            className="pod-nav-link"
          >
            <span>◎</span>
            Live Deliveries
          </Link>

          <Link
            to="/operator/driver-tracking"
            className="pod-nav-link"
          >
            <span>♙</span>
            Driver Tracking
          </Link>

          <Link
            to="/operator/routes"
            className="pod-nav-link"
          >
            <span>⌁</span>
            Route Management
          </Link>

          <Link
            to="/operator/eta-delay"
            className="pod-nav-link"
          >
            <span>◷</span>
            ETA & Delays
          </Link>

          <Link
            to="/operator/pod"
            className="pod-nav-link active"
          >
            <span>✓</span>
            Proof of Delivery
          </Link>

        </nav>


        <div className="pod-sidebar-bottom">

          <div className="pod-user">

            <div className="pod-avatar">
              OP
            </div>

            <div>
              <strong>Logistics Operator</strong>
              <span>Operations Team</span>
            </div>

          </div>

          <Link
            to="/login"
            className="pod-logout"
          >
            <span>↪</span>
            Logout
          </Link>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="pod-main">

        {/* HEADER */}

        <header className="pod-header">

          <div>

            <span className="pod-eyebrow">
              LOGISTICS OPERATIONS
            </span>

            <h1>Proof of Delivery</h1>

            <p>
              Review delivery confirmations, signatures, photos and POD
              exceptions.
            </p>

          </div>


          <div className="pod-header-actions">

            <div className="pod-live-status">
              <span></span>
              System Live
            </div>

            <button className="pod-notification">
              ♢
              <span>3</span>
            </button>

          </div>

        </header>


        {/* ================= STATS ================= */}

        <section className="pod-stats">

          <div className="pod-stat-card orange">

            <div className="pod-stat-icon">
              ✓
            </div>

            <div>
              <span>Delivered Today</span>
              <strong>87</strong>
              <small>Successful deliveries</small>
            </div>

          </div>


          <div className="pod-stat-card green">

            <div className="pod-stat-icon">
              ✓
            </div>

            <div>
              <span>POD Verified</span>
              <strong>82</strong>
              <small>94.3% verified</small>
            </div>

          </div>


          <div className="pod-stat-card purple">

            <div className="pod-stat-icon">
              ◷
            </div>

            <div>
              <span>POD Pending</span>
              <strong>04</strong>
              <small>Awaiting confirmation</small>
            </div>

          </div>


          <div className="pod-stat-card red">

            <div className="pod-stat-icon">
              !
            </div>

            <div>
              <span>POD Exceptions</span>
              <strong>01</strong>
              <small>Needs review</small>
            </div>

          </div>

        </section>


        {/* ================= OVERVIEW ================= */}

        <section className="pod-top-grid">

          {/* POD COMPLETION */}

          <div className="pod-panel">

            <div className="pod-panel-header">

              <div>
                <span className="pod-panel-label">
                  DELIVERY CONFIRMATION
                </span>

                <h2>POD Completion</h2>
              </div>

              <span className="pod-live-badge">
                ● Live
              </span>

            </div>


            <div className="pod-completion">

              <div className="pod-ring">

                <div>
                  <strong>94.3%</strong>
                  <span>Verified</span>
                </div>

              </div>


              <div className="pod-completion-list">

                <div>
                  <span className="pod-dot verified"></span>
                  <p>Verified</p>
                  <strong>82</strong>
                </div>

                <div>
                  <span className="pod-dot pending"></span>
                  <p>Pending</p>
                  <strong>04</strong>
                </div>

                <div>
                  <span className="pod-dot exception"></span>
                  <p>Exception</p>
                  <strong>01</strong>
                </div>

              </div>

            </div>

          </div>


          {/* POD METHODS */}

          <div className="pod-panel">

            <div className="pod-panel-header">

              <div>
                <span className="pod-panel-label">
                  CONFIRMATION METHODS
                </span>

                <h2>POD Methods</h2>
              </div>

            </div>


            <div className="pod-method-list">

              <div className="pod-method">

                <div className="method-icon">
                  ✎
                </div>

                <div>
                  <strong>Signature</strong>
                  <span>56 deliveries</span>
                </div>

                <b>68%</b>

              </div>


              <div className="pod-method">

                <div className="method-icon purple">
                  ▣
                </div>

                <div>
                  <strong>Photo + Signature</strong>
                  <span>26 deliveries</span>
                </div>

                <b>32%</b>

              </div>


              <div className="pod-method">

                <div className="method-icon green">
                  ✓
                </div>

                <div>
                  <strong>Digital Confirmation</strong>
                  <span>Included in verified POD</span>
                </div>

                <b>100%</b>

              </div>

            </div>

          </div>

        </section>


        {/* ================= TABLE ================= */}

        <section className="pod-panel pod-table-panel">

          <div className="pod-panel-header">

            <div>

              <span className="pod-panel-label">
                RECENT DELIVERIES
              </span>

              <h2>Delivery Confirmation Records</h2>

              <p>
                Review proof of delivery information for completed shipments.
              </p>

            </div>

            <Link
              to="/operator/shipment-tracking"
              className="pod-view-link"
            >
              View shipments →
            </Link>

          </div>


          <div className="pod-table-wrapper">

            <table className="pod-table">

              <thead>

                <tr>
                  <th>Shipment</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Driver</th>
                  <th>Delivered</th>
                  <th>Receiver</th>
                  <th>POD</th>
                  <th>Method</th>
                </tr>

              </thead>


              <tbody>

                {deliveries.map((delivery) => (

                  <tr key={delivery.id}>

                    <td>

                      <div className="pod-shipment">

                        <span className="pod-shipment-icon">
                          ✓
                        </span>

                        <div>

                          <strong>
                            {delivery.id}
                          </strong>

                          <small>
                            {delivery.order}
                          </small>

                        </div>

                      </div>

                    </td>


                    <td>
                      <span className="pod-customer">
                        {delivery.customer}
                      </span>
                    </td>


                    <td>
                      <span className="pod-route">
                        {delivery.route}
                      </span>
                    </td>


                    <td>
                      <span className="pod-driver">
                        {delivery.driver}
                      </span>
                    </td>


                    <td>
                      <span className="pod-time">
                        {delivery.deliveredAt}
                      </span>
                    </td>


                    <td>
                      <span className="receiver-name">
                        {delivery.receiver}
                      </span>
                    </td>


                    <td>

                      <span
                        className={`pod-status ${
                          delivery.pod === "Verified"
                            ? "verified-status"
                            : delivery.pod === "Pending"
                            ? "pending-status"
                            : "exception-status"
                        }`}
                      >
                        <span></span>
                        {delivery.pod}
                      </span>

                    </td>


                    <td>
                      <span className="pod-method-text">
                        {delivery.method}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* ================= BOTTOM ================= */}

        <section className="pod-bottom-grid">

          <div className="pod-info-card">

            <div className="pod-info-icon">
              ✓
            </div>

            <div>
              <span>Verification Rate</span>
              <strong>94.3%</strong>
              <small>
                POD records successfully verified
              </small>
            </div>

          </div>


          <div className="pod-info-card">

            <div className="pod-info-icon purple">
              ◷
            </div>

            <div>
              <span>Average POD Time</span>
              <strong>8.4 min</strong>
              <small>
                From delivery completion to confirmation
              </small>
            </div>

          </div>


          <div className="pod-info-card warning">

            <div className="pod-info-icon">
              !
            </div>

            <div>
              <span>Needs Attention</span>
              <strong>1 Record</strong>
              <small>
                Signature missing from delivery record
              </small>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default OperatorProofOfDelivery;