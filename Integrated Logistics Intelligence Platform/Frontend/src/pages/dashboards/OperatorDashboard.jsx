import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./OperatorDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api/shipments";
const nextStatuses = { CREATED: ["PICKED_UP"], PICKED_UP: ["IN_TRANSIT"], IN_TRANSIT: ["OUT_FOR_DELIVERY"], OUT_FOR_DELIVERY: ["DELIVERED", "FAILED_DELIVERY"], FAILED_DELIVERY: ["OUT_FOR_DELIVERY"] };

function formatStatus(status) {
  return status?.replaceAll("_", " ") || "UNKNOWN";
}

function progressFor(status) {
  return { CREATED: 0, PICKED_UP: 25, IN_TRANSIT: 50, OUT_FOR_DELIVERY: 75, DELIVERED: 100, FAILED_DELIVERY: 75, CANCELLED: 0 }[status] || 0;
}

function OperatorDashboard() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");

  async function request(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status})`);
    return response.json();
  }

  useEffect(() => {
    let mounted = true;
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load shipments (${response.status})`);
        return response.json();
      })
      .then((data) => {
        if (mounted) {
          setShipments(data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message);
      });
    return () => { mounted = false; };
  }, []);

  async function updateShipment(id, method, body) {
    try {
      const updated = await request(`${API_URL}/${id}${method === "PATCH" ? "/status" : ""}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setShipments((current) => current.map((item) => item.id === updated.id ? updated : item));
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const activeShipments = shipments.filter((shipment) => !["DELIVERED", "CANCELLED"].includes(shipment.status));
  const liveDeliveries = shipments.filter((shipment) => ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(shipment.status));
  const delayedShipments = shipments.filter((shipment) => shipment.status === "FAILED_DELIVERY");
  const deliveredShipments = shipments.filter((shipment) => shipment.status === "DELIVERED");
  const routes = Object.values(shipments.reduce((grouped, shipment) => {
    const route = `${shipment.senderAddress} to ${shipment.receiverAddress}`;
    grouped[route] = grouped[route] || { route, shipments: 0, status: "On Route" };
    grouped[route].shipments += 1;
    if (shipment.status === "FAILED_DELIVERY") grouped[route].status = "Attention";
    return grouped;
  }, {}));

  return (
    <div className="operator-dashboard">

      {error && <div className="operator-error">{error}</div>}

      {/* ================= SIDEBAR ================= */}

      <aside className="operator-sidebar">

        {/* Brand */}
        <div className="operator-brand">
          <div className="operator-brand-logo">
            S
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>Operator Console</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="operator-nav">

          {/* Dashboard */}
          <Link
            to="/dashboard/operator"
            className="operator-nav-link active"
          >
            <span className="operator-nav-icon">⌂</span>
            Dashboard
          </Link>

          {/* Shipment Tracking */}
          <Link
            to="/operator/shipment-tracking"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">▣</span>
            Shipment Tracking
          </Link>

          {/* Live Deliveries */}
          <Link
            to="/operator/live-delivery"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">◎</span>
            Live Deliveries
          </Link>

          {/* Driver Tracking */}
          <Link
            to="/operator/driver-tracking"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">♙</span>
            Driver Tracking
          </Link>

          {/* Route Management */}
          <Link
            to="/operator/routes"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">⌁</span>
            Route Management
          </Link>

          {/* ETA & Delays */}
          <Link
            to="/operator/eta-delay"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">◷</span>
            ETA & Delays
          </Link>

          {/* Proof of Delivery */}
          <Link
            to="/operator/pod"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">✓</span>
            Proof of Delivery
          </Link>

        </nav>

        {/* Bottom */}
        <div className="operator-sidebar-bottom">

          <div className="operator-user">
            <div className="operator-avatar">
              OP
            </div>

            <div>
              <strong>Logistics Operator</strong>
              <span>Operations Team</span>
            </div>
          </div>

          <Link
            to="/login"
            className="operator-logout"
          >
            <span>↪</span>
            Logout
          </Link>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="operator-main">

        {/* Header */}
        <header className="operator-header">

          <div>
            <span className="operator-eyebrow">
              LOGISTICS OPERATIONS
            </span>

            <h1>Operator Dashboard</h1>

            <p>
              Monitor deliveries, drivers, routes and shipment operations
              from one place.
            </p>
          </div>

          <div className="operator-header-actions">

            <div className="operator-live-status">
              <span></span>
              System Live
            </div>

            <button className="operator-notification">
              ♢
              <span>3</span>
            </button>

          </div>

        </header>


        {/* ================= STAT CARDS ================= */}

        <section className="operator-stats">

          {/* Active Shipments */}
          <div className="operator-stat-card orange">

            <div className="operator-stat-icon">
              ▣
            </div>

            <div>
              <span>Active Shipments</span>
              <strong>{activeShipments.length}</strong>
              <small>From backend</small>
            </div>

          </div>


          {/* Live Deliveries */}
          <div className="operator-stat-card purple">

            <div className="operator-stat-icon">
              ◎
            </div>

            <div>
              <span>Live Deliveries</span>
              <strong>{liveDeliveries.length}</strong>
              <small>Currently on route</small>
            </div>

          </div>


          {/* Active Drivers */}
          <div className="operator-stat-card green">

            <div className="operator-stat-icon">
              ♙
            </div>

            <div>
              <span>Active Drivers</span>
              <strong>{liveDeliveries.length}</strong>
              <small>Shipment assignments</small>
            </div>

          </div>


          {/* Delayed Shipments */}
          <div className="operator-stat-card red">

            <div className="operator-stat-icon">
              ⚠
            </div>

            <div>
              <span>Delayed Shipments</span>
              <strong>{delayedShipments.length}</strong>
              <small>Needs attention</small>
            </div>

          </div>

        </section>


        {/* ================= TOP GRID ================= */}

        <section className="operator-top-grid">

          {/* Live Delivery Overview */}

          <div className="operator-panel live-panel">

            <div className="operator-panel-header">

              <div>
                <span className="panel-label">
                  LIVE OPERATIONS
                </span>

                <h2>Delivery Overview</h2>
              </div>

              <Link
                to="/operator/live-delivery"
                className="panel-link"
              >
                View all →
              </Link>

            </div>


            <div className="delivery-overview">

              <div className="delivery-ring">

                <div className="delivery-ring-inner">
                  <strong>{shipments.length ? Math.round((liveDeliveries.length / shipments.length) * 100) : 0}%</strong>
                  <span>On Route</span>
                </div>

              </div>


              <div className="delivery-legend">

                <div>
                  <span className="legend-dot delivered"></span>
                  <p>Delivered</p>
                  <strong>{deliveredShipments.length}</strong>
                </div>

                <div>
                  <span className="legend-dot transit"></span>
                  <p>In Transit</p>
                  <strong>{liveDeliveries.length}</strong>
                </div>

                <div>
                  <span className="legend-dot delayed"></span>
                  <p>Delayed</p>
                  <strong>{delayedShipments.length}</strong>
                </div>

              </div>

            </div>

          </div>


          {/* Operational Alerts */}

          <div className="operator-panel alert-panel">

            <div className="operator-panel-header">

              <div>
                <span className="panel-label">
                  ATTENTION REQUIRED
                </span>

                <h2>Operational Alerts</h2>
              </div>

              <span className="alert-count">
                3
              </span>

            </div>


            <div className="alerts-list">

              <div className="operator-alert red-alert">

                <div className="alert-icon">
                  !
                </div>

                <div>
                  <strong>Shipment Delayed</strong>

                  <p>
                    TRK-2026-103 is delayed by 3h 20m.
                  </p>
                </div>

                <span>Now</span>

              </div>


              <div className="operator-alert orange-alert">

                <div className="alert-icon">
                  !
                </div>

                <div>
                  <strong>ETA Risk</strong>

                  <p>
                    Route Chennai → Hyderabad has high traffic.
                  </p>
                </div>

                <span>18m</span>

              </div>


              <div className="operator-alert purple-alert">

                <div className="alert-icon">
                  i
                </div>

                <div>
                  <strong>Vehicle Update</strong>

                  <p>
                    Vehicle MH 12 CD 7842 requires inspection.
                  </p>
                </div>

                <span>1h</span>

              </div>

            </div>

          </div>

        </section>


        {/* ================= SHIPMENTS ================= */}

        <section className="operator-panel shipments-panel">

          <div className="operator-panel-header">

            <div>
              <span className="panel-label">
                ACTIVE SHIPMENTS
              </span>

              <h2>Shipment Operations</h2>

              <p>
                Monitor active shipments and delivery progress.
              </p>
            </div>

            <Link
              to="/operator/shipment-tracking"
              className="panel-link"
            >
              View all shipments →
            </Link>

          </div>


          <div className="operator-table-wrapper">

            <table className="operator-table">

              <thead>

                <tr>
                  <th>Shipment</th>
                  <th>Route</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>ETA</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {activeShipments.map((shipment) => (

                  <tr key={shipment.id}>

                    <td>

                      <div className="shipment-id">

                        <span className="shipment-box">
                          □
                        </span>

                        <div>
                          <strong>{shipment.trackingNumber}</strong>
                          <small>Shipment #{shipment.id}</small>
                        </div>

                      </div>

                    </td>


                    <td>
                      <span className="route-text">
                        {shipment.senderAddress} to {shipment.receiverAddress}
                      </span>
                    </td>


                    <td>
                      <span className="driver-name">
                        {shipment.senderName}
                      </span>
                    </td>


                    <td>

                      <span
                        className={`operator-status ${shipment.status === "FAILED_DELIVERY"
                          ? "delayed-status"
                          : shipment.status === "OUT_FOR_DELIVERY"
                            ? "delivery-status"
                            : "transit-status"
                          }`}
                      >
                        <span></span>
                        {formatStatus(shipment.status)}
                      </span>

                    </td>


                    <td>

                      <div className="progress-cell">

                        <div className="progress-bar">

                          <span
                            style={{
                              width: `${progressFor(shipment.status)}%`,
                            }}
                          ></span>

                        </div>

                        <small>
                          {progressFor(shipment.status)}%
                        </small>

                      </div>

                    </td>


                    <td>
                      <span className="eta-text">
                        {shipment.status === "DELIVERED" ? "Delivered" : "Not available"}
                      </span>
                    </td>

                    <td>
                      <select
                        defaultValue=""
                        disabled={!nextStatuses[shipment.status]}
                        onChange={(event) => updateShipment(shipment.id, "PATCH", { status: event.target.value, description: "Operator status update" })}
                      >
                        <option value="">Update</option>
                        {(nextStatuses[shipment.status] || []).map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                      </select>
                      <button type="button" disabled={["DELIVERED", "CANCELLED"].includes(shipment.status)} onClick={() => updateShipment(shipment.id, "PUT", { receiverName: window.prompt("Receiver name", shipment.receiverName) || shipment.receiverName, receiverAddress: window.prompt("Receiver address", shipment.receiverAddress) || shipment.receiverAddress, packageDescription: shipment.packageDescription, packageWeight: shipment.packageWeight })}>Edit</button>
                      <button type="button" disabled={["DELIVERED", "CANCELLED"].includes(shipment.status)} onClick={() => window.confirm(`Cancel ${shipment.trackingNumber}?`) && updateShipment(shipment.id, "DELETE")}>Cancel</button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* ================= BOTTOM GRID ================= */}

        <section className="operator-bottom-grid">

          {/* Routes */}

          <div className="operator-panel routes-panel">

            <div className="operator-panel-header">

              <div>
                <span className="panel-label">
                  ROUTE MANAGEMENT
                </span>

                <h2>Active Routes</h2>
              </div>

              <Link
                to="/operator/routes"
                className="panel-link"
              >
                Manage →
              </Link>

            </div>


            <div className="routes-list">

              {routes.map((route) => (

                <div
                  className="route-item"
                  key={route.route}
                >

                  <div className="route-icon">
                    ⌁
                  </div>

                  <div className="route-info">

                    <strong>
                      {route.route}
                    </strong>

                    <span>
                      {route.shipments} shipments · {route.distance}
                    </span>

                  </div>

                  <span
                    className={
                      route.status === "Attention"
                        ? "route-status attention"
                        : "route-status"
                    }
                  >
                    {route.status}
                  </span>

                </div>

              ))}

            </div>

          </div>


          {/* Fleet */}

          <div className="operator-panel fleet-panel">

            <div className="operator-panel-header">

              <div>
                <span className="panel-label">
                  FLEET STATUS
                </span>

                <h2>Fleet Overview</h2>
              </div>

              <Link
                to="/operator/driver-tracking"
                className="panel-link"
              >
                Drivers →
              </Link>

            </div>


            <div className="fleet-main">

              <div className="fleet-number">
                <strong>42</strong>
                <span>Total Vehicles</span>
              </div>

              <div className="fleet-utilization">

                <div className="fleet-progress">
                  <span style={{ width: "78%" }}></span>
                </div>

                <div className="fleet-progress-info">
                  <span>Fleet Utilization</span>
                  <strong>78%</strong>
                </div>

              </div>

            </div>


            <div className="fleet-stats">

              <div>
                <span className="fleet-dot active"></span>
                <p>Active</p>
                <strong>33</strong>
              </div>

              <div>
                <span className="fleet-dot available"></span>
                <p>Available</p>
                <strong>6</strong>
              </div>

              <div>
                <span className="fleet-dot maintenance"></span>
                <p>Maintenance</p>
                <strong>3</strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= QUICK ACTIONS ================= */}

        <section className="operator-quick-actions">

          {/* Track Shipment */}
          <Link
            to="/operator/shipment-tracking"
            className="quick-action"
          >
            <span>▣</span>

            <div>
              <strong>Track Shipment</strong>
              <small>View shipment status</small>
            </div>

            <b>→</b>
          </Link>


          {/* Track Driver */}
          <Link
            to="/operator/driver-tracking"
            className="quick-action"
          >
            <span>♙</span>

            <div>
              <strong>Track Driver</strong>
              <small>Monitor driver activity</small>
            </div>

            <b>→</b>
          </Link>


          {/* Check Delays */}
          <Link
            to="/operator/eta-delay"
            className="quick-action"
          >
            <span>◷</span>

            <div>
              <strong>Check Delays</strong>
              <small>Review ETA risks</small>
            </div>

            <b>→</b>
          </Link>


          {/* Proof of Delivery */}
          <Link
            to="/operator/pod"
            className="quick-action"
          >
            <span>✓</span>

            <div>
              <strong>Proof of Delivery</strong>
              <small>Review completed deliveries</small>
            </div>

            <b>→</b>
          </Link>

        </section>

      </main>

    </div>
  );
}

export default OperatorDashboard;