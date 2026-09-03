import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Package,
  Radio,
  Search,
  Truck,
  UserRound,
  AlertTriangle,
  MoreHorizontal,
  Route,
} from "lucide-react";

import "./OperatorShipmentTracking.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api/shipments";

function toOperatorShipment(shipment) {
  const statusLabels = {
    CREATED: "Created",
    PICKED_UP: "Picked Up",
    IN_TRANSIT: "In Transit",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    FAILED_DELIVERY: "Delayed",
    CANCELLED: "Cancelled",
  };

  return {
    id: shipment.trackingNumber,
    order: `Shipment #${shipment.id}`,
    customer: shipment.receiverName,
    route: `${shipment.senderAddress} -> ${shipment.receiverAddress}`,
    location: shipment.status === "DELIVERED" ? "Delivered" : "In transit",
    eta: shipment.status === "DELIVERED" ? "Delivered" : "Not available",
    progress: shipment.status === "DELIVERED" ? 100 : shipment.status === "CREATED" ? 10 : 50,
    status: statusLabels[shipment.status] || shipment.status,
    priority: "Normal",
  };
}

function OperatorShipmentTracking() {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load shipments (${response.status})`);
        return response.json();
      })
      .then((data) => setShipments(data.map(toOperatorShipment)))
      .catch(() => setShipments([]));
  }, []);

  return (
    <div className="operator-shipment-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="operator-shipment-sidebar">

        <div className="shipment-brand">
          <div className="shipment-brand-icon">
            <Truck size={22} />
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="shipment-role">
          <span></span>
          Logistics Operator
        </div>

        <nav className="shipment-nav">

          <Link to="/dashboard/operator">
            <Navigation size={18} />
            Dashboard
          </Link>

          <Link
            to="/operator/shipment-tracking"
            className="active"
          >
            <Package size={18} />
            Shipment Tracking
          </Link>

          <Link to="/operator/live-delivery">
            <Radio size={18} />
            Live Deliveries
            <b>32</b>
          </Link>

          <Link to="/operator/driver-tracking">
            <UserRound size={18} />
            Driver Tracking
          </Link>

          <Link to="/dashboard/operator">
            <Route size={18} />
            Route Management
          </Link>

          <Link to="/dashboard/operator">
            <Clock3 size={18} />
            ETA & Delays
          </Link>

          <Link to="/dashboard/operator">
            <CheckCircle2 size={18} />
            Proof of Delivery
          </Link>

        </nav>

        <div className="shipment-sidebar-bottom">

          <Link
            to="/dashboard/operator"
            className="shipment-back"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="shipment-user">

            <div className="shipment-avatar">
              RK
            </div>

            <div>
              <strong>Operator</strong>
              <span>Operations Team</span>
            </div>

            <MoreHorizontal size={18} />

          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="operator-shipment-main">

        {/* HEADER */}

        <header className="shipment-header">

          <div>

            <div className="shipment-breadcrumb">
              Operations <span>/</span> Shipment Tracking
            </div>

            <div className="shipment-title-row">

              <div>
                <h1>Shipment Tracking</h1>

                <p>
                  Track active shipments, locations, routes and delivery
                  progress in real time.
                </p>
              </div>

              <div className="shipment-live">
                <span></span>
                LIVE
              </div>

            </div>

          </div>

          <div className="shipment-header-actions">

            <button className="shipment-icon-button">
              <Bell size={20} />
              <i></i>
            </button>

            <button className="shipment-refresh">
              <Radio size={16} />
              Tracking Active
            </button>

          </div>

        </header>

        {/* ================= STATS ================= */}

        <section className="shipment-stats">

          <div className="shipment-stat-card">

            <div className="shipment-stat-icon orange">
              <Package size={22} />
            </div>

            <div>
              <span>Active Shipments</span>
              <strong>48</strong>
              <small>Currently monitored</small>
            </div>

          </div>

          <div className="shipment-stat-card">

            <div className="shipment-stat-icon green">
              <Truck size={22} />
            </div>

            <div>
              <span>In Transit</span>
              <strong>32</strong>
              <small className="green-text">
                Moving normally
              </small>
            </div>

          </div>

          <div className="shipment-stat-card">

            <div className="shipment-stat-icon purple">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Delivered Today</span>
              <strong>87</strong>
              <small className="green-text">
                92.6% on time
              </small>
            </div>

          </div>

          <div className="shipment-stat-card">

            <div className="shipment-stat-icon red">
              <AlertTriangle size={22} />
            </div>

            <div>
              <span>Delayed</span>
              <strong>09</strong>
              <small className="red-text">
                Requires attention
              </small>
            </div>

          </div>

        </section>

        {/* ================= MAP + SUMMARY ================= */}

        <section className="shipment-monitor-grid">

          {/* MAP */}

          <div className="shipment-map-card">

            <div className="shipment-card-header">

              <div>
                <h2>Live Shipment Map</h2>
                <p>
                  Current locations of active shipments
                </p>
              </div>

              <button className="shipment-map-button">
                <Navigation size={15} />
                Center Map
              </button>

            </div>

            <div className="shipment-map">

              <div className="shipment-map-grid"></div>

              <div className="shipment-road road-a"></div>
              <div className="shipment-road road-b"></div>
              <div className="shipment-road road-c"></div>
              <div className="shipment-road road-d"></div>

              <div className="shipment-city city-hyd">
                <span></span>
                Hyderabad
              </div>

              <div className="shipment-city city-blr">
                <span></span>
                Bengaluru
              </div>

              <div className="shipment-city city-mum">
                <span></span>
                Mumbai
              </div>

              <div className="shipment-city city-chn">
                <span></span>
                Chennai
              </div>

              <div className="shipment-marker marker-1">
                <Package size={14} />
              </div>

              <div className="shipment-marker marker-2">
                <Package size={14} />
              </div>

              <div className="shipment-marker marker-3">
                <Package size={14} />
              </div>

              <div className="shipment-marker marker-4">
                <Package size={14} />
              </div>

              <div className="shipment-map-info">

                <div>
                  <span></span>
                  Live shipment tracking
                </div>

                <strong>48 Active Shipments</strong>

                <small>
                  Updated 18 seconds ago
                </small>

              </div>

            </div>

          </div>

          {/* STATUS */}

          <div className="shipment-status-card">

            <div className="shipment-card-header">

              <div>
                <h2>Shipment Status</h2>
                <p>Current delivery breakdown</p>
              </div>

            </div>

            <div className="shipment-status-ring">

              <div>
                <strong>48</strong>
                <span>Active</span>
              </div>

            </div>

            <div className="shipment-status-list">

              <div>
                <span className="status-dot transit"></span>
                <label>In Transit</label>
                <strong>32</strong>
              </div>

              <div>
                <span className="status-dot near"></span>
                <label>Near Destination</label>
                <strong>07</strong>
              </div>

              <div>
                <span className="status-dot delayed"></span>
                <label>Delayed</label>
                <strong>09</strong>
              </div>

            </div>

            <div className="shipment-performance">

              <div>
                <span>On-time delivery</span>
                <strong>92.6%</strong>
              </div>

              <div className="shipment-performance-bar">
                <span></span>
              </div>

            </div>

          </div>

        </section>

        {/* ================= TABLE ================= */}

        <section className="shipment-table-card">

          <div className="shipment-table-header">

            <div>
              <h2>Active Shipments</h2>
              <p>
                Shipments currently being monitored
              </p>
            </div>

            <div className="shipment-tools">

              <div className="shipment-search">

                <Search size={16} />

                <input
                  type="text"
                  placeholder="Search shipment or customer..."
                />

              </div>

              <button className="shipment-filter">
                All Shipments
              </button>

            </div>

          </div>

          <div className="shipment-table-wrapper">

            <table className="shipment-table">

              <thead>

                <tr>
                  <th>SHIPMENT</th>
                  <th>CUSTOMER</th>
                  <th>ROUTE</th>
                  <th>CURRENT LOCATION</th>
                  <th>PROGRESS</th>
                  <th>ETA</th>
                  <th>STATUS</th>
                  <th>PRIORITY</th>
                </tr>

              </thead>

              <tbody>

                {shipments.map((shipment) => (

                  <tr key={shipment.id}>

                    <td>

                      <div className="shipment-id-cell">

                        <div className="shipment-id-icon">
                          <Package size={16} />
                        </div>

                        <div>
                          <strong>{shipment.id}</strong>
                          <span>{shipment.order}</span>
                        </div>

                      </div>

                    </td>

                    <td>
                      <span className="shipment-customer">
                        {shipment.customer}
                      </span>
                    </td>

                    <td>
                      <span className="shipment-route">
                        {shipment.route}
                      </span>
                    </td>

                    <td>

                      <div className="shipment-location">
                        <MapPin size={14} />
                        {shipment.location}
                      </div>

                    </td>

                    <td>

                      <div className="shipment-progress">

                        <div className="shipment-progress-top">
                          <span>{shipment.progress}%</span>
                        </div>

                        <div className="shipment-progress-bar">
                          <span
                            style={{
                              width: `${shipment.progress}%`,
                            }}
                          ></span>
                        </div>

                      </div>

                    </td>

                    <td>

                      <div className="shipment-eta">
                        <Clock3 size={14} />
                        {shipment.eta}
                      </div>

                    </td>

                    <td>

                      <span
                        className={`shipment-status ${shipment.status === "Delayed"
                          ? "status-delay"
                          : shipment.status === "Near Destination"
                            ? "status-near-destination"
                            : "status-in-transit"
                          }`}
                      >
                        <i></i>
                        {shipment.status}
                      </span>

                    </td>

                    <td>

                      <span
                        className={`shipment-priority ${shipment.priority === "High"
                          ? "priority-high"
                          : "priority-normal"
                          }`}
                      >
                        {shipment.priority}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <div className="shipment-table-footer">

            <span>
              Showing <strong>5</strong> of{" "}
              <strong>48</strong> active shipments
            </span>

            <button>
              View All Shipments →
            </button>

          </div>

        </section>

        {/* ================= BOTTOM CARDS ================= */}

        <section className="shipment-bottom-grid">

          <div className="shipment-bottom-card">

            <div className="bottom-icon orange-bottom">
              <Navigation size={21} />
            </div>

            <div>
              <span>Routes Being Monitored</span>
              <strong>18</strong>
              <p>6 routes require attention</p>
            </div>

          </div>

          <div className="shipment-bottom-card">

            <div className="bottom-icon purple-bottom">
              <Radio size={21} />
            </div>

            <div>
              <span>Tracking Accuracy</span>
              <strong>98.4%</strong>
              <p>GPS signals healthy</p>
            </div>

          </div>

          <div className="shipment-bottom-card">

            <div className="bottom-icon green-bottom">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Successful Deliveries</span>
              <strong>92.6%</strong>
              <p>On-time performance</p>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default OperatorShipmentTracking;