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
  RefreshCw,
} from "lucide-react";

import "./OperatorLiveDelivery.css";

function OperatorLiveDelivery() {
  const deliveries = [
    {
      id: "TRK-2026-101",
      driver: "Rahul Kumar",
      vehicle: "TS 09 AB 4521",
      route: "Hyderabad → Bengaluru",
      location: "Kurnool Highway",
      eta: "2h 18m",
      progress: 72,
      status: "On Route",
    },
    {
      id: "TRK-2026-102",
      driver: "Arjun Reddy",
      vehicle: "TS 08 CD 7842",
      route: "Hyderabad → Mumbai",
      location: "Solapur",
      eta: "5h 42m",
      progress: 54,
      status: "On Route",
    },
    {
      id: "TRK-2026-103",
      driver: "Vikram Singh",
      vehicle: "KA 01 EF 2389",
      route: "Bengaluru → Chennai",
      location: "Hosur",
      eta: "1h 05m",
      progress: 86,
      status: "Near Destination",
    },
    {
      id: "TRK-2026-104",
      driver: "Suresh Babu",
      vehicle: "TN 10 GH 9182",
      route: "Chennai → Hyderabad",
      location: "Nellore",
      eta: "4h 26m",
      progress: 61,
      status: "Delayed",
    },
    {
      id: "TRK-2026-105",
      driver: "Manoj Verma",
      vehicle: "MH 12 JK 6321",
      route: "Mumbai → Pune",
      location: "Lonavala",
      eta: "48m",
      progress: 91,
      status: "Near Destination",
    },
  ];

  return (
    <div className="operator-live-page">

      {/* Sidebar */}
      <aside className="operator-live-sidebar">
        <div className="operator-brand">
          <div className="operator-brand-icon">
            <Truck size={22} />
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="operator-role">
          <span className="role-dot"></span>
          Logistics Operator
        </div>

        <nav className="operator-live-nav">

          <Link to="/dashboard/operator">
            <Navigation size={18} />
            Dashboard
          </Link>

          <Link to="/operator/live-delivery" className="active">
            <Radio size={18} />
            Live Deliveries
            <span className="nav-count">32</span>
          </Link>

          <Link to="/dashboard/operator">
            <Package size={18} />
            Shipment Tracking
          </Link>

          <Link to="/dashboard/operator">
            <UserRound size={18} />
            Driver Tracking
          </Link>

          <Link to="/dashboard/operator">
            <MapPin size={18} />
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

        <div className="sidebar-bottom">
          <Link to="/dashboard/operator" className="back-dashboard">
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="operator-user">
            <div className="operator-avatar">RK</div>

            <div>
              <strong>Operator</strong>
              <span>Operations Team</span>
            </div>

            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="operator-live-main">

        {/* Header */}
        <header className="operator-live-header">

          <div>
            <div className="page-breadcrumb">
              Operations <span>/</span> Live Deliveries
            </div>

            <div className="page-title-row">
              <div>
                <h1>Live Delivery Monitoring</h1>
                <p>
                  Monitor active deliveries, drivers and real-time shipment
                  movement.
                </p>
              </div>

              <div className="live-indicator">
                <span></span>
                LIVE
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button className="icon-button">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <button className="refresh-button">
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>

        </header>

        {/* Stats */}
        <section className="live-stats">

          <div className="live-stat-card">
            <div className="stat-icon orange">
              <Truck size={22} />
            </div>

            <div>
              <span>Active Deliveries</span>
              <strong>32</strong>
              <small className="positive">+8.4% today</small>
            </div>
          </div>

          <div className="live-stat-card">
            <div className="stat-icon purple">
              <UserRound size={22} />
            </div>

            <div>
              <span>Drivers On Road</span>
              <strong>33</strong>
              <small>of 41 active drivers</small>
            </div>
          </div>

          <div className="live-stat-card">
            <div className="stat-icon cyan">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Completed Today</span>
              <strong>87</strong>
              <small className="positive">92.6% on-time</small>
            </div>
          </div>

          <div className="live-stat-card">
            <div className="stat-icon red">
              <AlertTriangle size={22} />
            </div>

            <div>
              <span>Delayed Deliveries</span>
              <strong>09</strong>
              <small className="negative">Needs attention</small>
            </div>
          </div>

        </section>

        {/* Map + Activity */}
        <section className="monitor-grid">

          {/* Map */}
          <div className="live-map-card">

            <div className="card-header">
              <div>
                <h2>Live Fleet Map</h2>
                <p>Real-time vehicle locations</p>
              </div>

              <button className="map-control">
                <Navigation size={16} />
                Center Map
              </button>
            </div>

            <div className="fake-map">

              <div className="map-grid"></div>

              <div className="map-road road-one"></div>
              <div className="map-road road-two"></div>
              <div className="map-road road-three"></div>

              <div className="city city-hyd">
                <span></span>
                Hyderabad
              </div>

              <div className="city city-blr">
                <span></span>
                Bengaluru
              </div>

              <div className="city city-chn">
                <span></span>
                Chennai
              </div>

              <div className="city city-mum">
                <span></span>
                Mumbai
              </div>

              <div className="vehicle-marker marker-one">
                <Truck size={15} />
              </div>

              <div className="vehicle-marker marker-two">
                <Truck size={15} />
              </div>

              <div className="vehicle-marker marker-three">
                <Truck size={15} />
              </div>

              <div className="vehicle-marker marker-four">
                <Truck size={15} />
              </div>

              <div className="map-info-box">
                <div>
                  <span className="map-live-dot"></span>
                  Live tracking active
                </div>

                <strong>32 vehicles</strong>
                <small>Last updated 18 sec ago</small>
              </div>

            </div>

          </div>

          {/* Alerts */}
          <div className="activity-card">

            <div className="card-header">
              <div>
                <h2>Operational Alerts</h2>
                <p>Requires operator attention</p>
              </div>

              <span className="alert-count">4</span>
            </div>

            <div className="alert-list">

              <div className="alert-item danger">
                <div className="alert-icon">
                  <AlertTriangle size={17} />
                </div>

                <div>
                  <strong>Delivery delayed</strong>
                  <p>TRK-2026-104 is 42 min behind ETA.</p>
                  <span>8 min ago</span>
                </div>
              </div>

              <div className="alert-item warning">
                <div className="alert-icon">
                  <Clock3 size={17} />
                </div>

                <div>
                  <strong>ETA changed</strong>
                  <p>TRK-2026-102 ETA increased by 28 min.</p>
                  <span>16 min ago</span>
                </div>
              </div>

              <div className="alert-item info">
                <div className="alert-icon">
                  <MapPin size={17} />
                </div>

                <div>
                  <strong>Route deviation</strong>
                  <p>Vehicle TS 09 AB 4521 left planned route.</p>
                  <span>23 min ago</span>
                </div>
              </div>

              <div className="alert-item success">
                <div className="alert-icon">
                  <CheckCircle2 size={17} />
                </div>

                <div>
                  <strong>Delivery completed</strong>
                  <p>TRK-2026-099 successfully delivered.</p>
                  <span>31 min ago</span>
                </div>
              </div>

            </div>

            <button className="view-alerts">
              View all alerts
            </button>

          </div>

        </section>

        {/* Delivery Table */}
        <section className="delivery-card">

          <div className="delivery-card-header">

            <div>
              <h2>Active Deliveries</h2>
              <p>Currently moving shipments</p>
            </div>

            <div className="delivery-tools">

              <div className="search-box">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Search shipment or driver..."
                />
              </div>

              <button className="filter-button">
                All Deliveries
              </button>

            </div>

          </div>

          <div className="delivery-table-wrapper">

            <table className="delivery-table">

              <thead>
                <tr>
                  <th>SHIPMENT</th>
                  <th>DRIVER</th>
                  <th>ROUTE</th>
                  <th>CURRENT LOCATION</th>
                  <th>PROGRESS</th>
                  <th>ETA</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>

                {deliveries.map((delivery) => (
                  <tr key={delivery.id}>

                    <td>
                      <div className="shipment-id">
                        <div className="shipment-icon">
                          <Package size={16} />
                        </div>

                        <div>
                          <strong>{delivery.id}</strong>
                          <span>{delivery.vehicle}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="driver-cell">
                        <div className="small-avatar">
                          {delivery.driver
                            .split(" ")
                            .map((name) => name[0])
                            .join("")}
                        </div>

                        <span>{delivery.driver}</span>
                      </div>
                    </td>

                    <td>
                      <span className="route-text">
                        {delivery.route}
                      </span>
                    </td>

                    <td>
                      <div className="location-cell">
                        <MapPin size={15} />
                        {delivery.location}
                      </div>
                    </td>

                    <td>
                      <div className="progress-cell">

                        <div className="progress-top">
                          <span>{delivery.progress}%</span>
                        </div>

                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${delivery.progress}%`,
                            }}
                          ></div>
                        </div>

                      </div>
                    </td>

                    <td>
                      <div className="eta-cell">
                        <Clock3 size={15} />
                        {delivery.eta}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`delivery-status ${
                          delivery.status === "Delayed"
                            ? "delayed"
                            : delivery.status === "Near Destination"
                            ? "near"
                            : "route"
                        }`}
                      >
                        <span></span>
                        {delivery.status}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          <div className="table-footer">
            <span>
              Showing <strong>5</strong> of <strong>32</strong> active
              deliveries
            </span>

            <button>View All Deliveries →</button>
          </div>

        </section>

        {/* Bottom Cards */}
        <section className="bottom-monitor-grid">

          <div className="mini-monitor-card">

            <div className="mini-card-icon">
              <Navigation size={21} />
            </div>

            <div>
              <span>Routes Being Monitored</span>
              <strong>18</strong>
              <p>6 routes require attention</p>
            </div>

          </div>

          <div className="mini-monitor-card">

            <div className="mini-card-icon purple">
              <Radio size={21} />
            </div>

            <div>
              <span>Live Tracking Accuracy</span>
              <strong>98.4%</strong>
              <p>GPS signals healthy</p>
            </div>

          </div>

          <div className="mini-monitor-card">

            <div className="mini-card-icon green">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Successful Deliveries</span>
              <strong>92.6%</strong>
              <p>On-time performance today</p>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default OperatorLiveDelivery;