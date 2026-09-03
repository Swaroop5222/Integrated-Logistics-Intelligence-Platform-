import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Radio,
  Search,
  Truck,
  UserRound,
  AlertTriangle,
  MoreHorizontal,
  Phone,
  Gauge,
} from "lucide-react";

import "./DriverTracking.css";

function DriverTracking() {
  const drivers = [
    {
      name: "Rahul Kumar",
      initials: "RK",
      vehicle: "TS 09 AB 4521",
      shipment: "TRK-2026-101",
      location: "Kurnool Highway",
      speed: "68 km/h",
      eta: "2h 18m",
      status: "On Route",
    },
    {
      name: "Arjun Reddy",
      initials: "AR",
      vehicle: "TS 08 CD 7842",
      shipment: "TRK-2026-102",
      location: "Solapur",
      speed: "61 km/h",
      eta: "5h 42m",
      status: "On Route",
    },
    {
      name: "Vikram Singh",
      initials: "VS",
      vehicle: "KA 01 EF 2389",
      shipment: "TRK-2026-103",
      location: "Hosur",
      speed: "54 km/h",
      eta: "1h 05m",
      status: "Near Destination",
    },
    {
      name: "Suresh Babu",
      initials: "SB",
      vehicle: "TN 10 GH 9182",
      shipment: "TRK-2026-104",
      location: "Nellore",
      speed: "42 km/h",
      eta: "4h 26m",
      status: "Delayed",
    },
    {
      name: "Manoj Verma",
      initials: "MV",
      vehicle: "MH 12 JK 6321",
      shipment: "TRK-2026-105",
      location: "Lonavala",
      speed: "58 km/h",
      eta: "48m",
      status: "Near Destination",
    },
  ];

  return (
    <div className="driver-page">

      {/* Sidebar */}
      <aside className="driver-sidebar">

        <div className="driver-brand">
          <div className="driver-brand-icon">
            <Truck size={22} />
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="driver-role">
          <span></span>
          Logistics Operator
        </div>

        <nav className="driver-nav">

          <Link to="/dashboard/operator">
            <Navigation size={18} />
            Dashboard
          </Link>

          <Link to="/operator/live-delivery">
            <Radio size={18} />
            Live Deliveries
            <b>32</b>
          </Link>

          <Link to="/dashboard/operator">
            <Truck size={18} />
            Shipment Tracking
          </Link>

          <Link to="/operator/driver-tracking" className="active">
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

        <div className="driver-sidebar-bottom">

          <Link to="/dashboard/operator" className="back-link">
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="driver-profile">
            <div className="profile-avatar">RK</div>

            <div>
              <strong>Operator</strong>
              <span>Operations Team</span>
            </div>

            <MoreHorizontal size={18} />
          </div>

        </div>

      </aside>

      {/* Main */}
      <main className="driver-main">

        {/* Header */}
        <header className="driver-header">

          <div>
            <div className="driver-breadcrumb">
              Operations <span>/</span> Driver Tracking
            </div>

            <div className="driver-title-row">
              <div>
                <h1>Driver Tracking</h1>
                <p>
                  Monitor driver locations, vehicle movement and delivery
                  progress in real time.
                </p>
              </div>

              <div className="driver-live-badge">
                <span></span>
                LIVE TRACKING
              </div>
            </div>
          </div>

          <div className="driver-header-actions">

            <button className="driver-icon-btn">
              <Bell size={20} />
              <i></i>
            </button>

            <button className="driver-refresh">
              <Radio size={16} />
              Tracking Active
            </button>

          </div>

        </header>

        {/* Stats */}
        <section className="driver-stats">

          <div className="driver-stat">
            <div className="driver-stat-icon orange">
              <UserRound size={21} />
            </div>

            <div>
              <span>Total Drivers</span>
              <strong>41</strong>
              <small>Registered drivers</small>
            </div>
          </div>

          <div className="driver-stat">
            <div className="driver-stat-icon green">
              <Navigation size={21} />
            </div>

            <div>
              <span>On Road</span>
              <strong>33</strong>
              <small className="green-text">80.5% active</small>
            </div>
          </div>

          <div className="driver-stat">
            <div className="driver-stat-icon purple">
              <Gauge size={21} />
            </div>

            <div>
              <span>Avg Speed</span>
              <strong>56 km/h</strong>
              <small>Across active vehicles</small>
            </div>
          </div>

          <div className="driver-stat">
            <div className="driver-stat-icon red">
              <AlertTriangle size={21} />
            </div>

            <div>
              <span>Attention Needed</span>
              <strong>04</strong>
              <small className="red-text">Requires monitoring</small>
            </div>
          </div>

        </section>

        {/* Map + Driver Status */}
        <section className="driver-monitor-grid">

          {/* Map */}
          <div className="driver-map-card">

            <div className="driver-card-header">

              <div>
                <h2>Driver Location Map</h2>
                <p>Current positions of active drivers</p>
              </div>

              <button className="center-driver-map">
                <Navigation size={15} />
                Center Map
              </button>

            </div>

            <div className="driver-map">

              <div className="driver-map-grid"></div>

              <div className="driver-map-road map-road-a"></div>
              <div className="driver-map-road map-road-b"></div>
              <div className="driver-map-road map-road-c"></div>
              <div className="driver-map-road map-road-d"></div>

              <div className="driver-city hyd-city">
                <span></span>
                Hyderabad
              </div>

              <div className="driver-city blr-city">
                <span></span>
                Bengaluru
              </div>

              <div className="driver-city mum-city">
                <span></span>
                Mumbai
              </div>

              <div className="driver-city chn-city">
                <span></span>
                Chennai
              </div>

              <div className="driver-marker driver-marker-1">
                <Truck size={14} />
              </div>

              <div className="driver-marker driver-marker-2">
                <Truck size={14} />
              </div>

              <div className="driver-marker driver-marker-3">
                <Truck size={14} />
              </div>

              <div className="driver-marker driver-marker-4">
                <Truck size={14} />
              </div>

              <div className="driver-map-info">
                <div>
                  <span></span>
                  GPS Tracking Active
                </div>

                <strong>33 Drivers Online</strong>

                <small>
                  Location data updated 15 sec ago
                </small>
              </div>

            </div>

          </div>

          {/* Driver Status */}
          <div className="driver-status-card">

            <div className="driver-card-header">
              <div>
                <h2>Driver Status</h2>
                <p>Current availability</p>
              </div>
            </div>

            <div className="driver-status-chart">

              <div className="status-ring">
                <div>
                  <strong>41</strong>
                  <span>Drivers</span>
                </div>
              </div>

              <div className="status-legend">

                <div>
                  <span className="legend-dot green-dot"></span>
                  <label>On Road</label>
                  <strong>33</strong>
                </div>

                <div>
                  <span className="legend-dot blue-dot"></span>
                  <label>Available</label>
                  <strong>05</strong>
                </div>

                <div>
                  <span className="legend-dot orange-dot"></span>
                  <label>Break</label>
                  <strong>02</strong>
                </div>

                <div>
                  <span className="legend-dot red-dot"></span>
                  <label>Attention</label>
                  <strong>01</strong>
                </div>

              </div>

            </div>

            <div className="driver-performance">
              <div>
                <span>Driver utilization</span>
                <strong>80.5%</strong>
              </div>

              <div className="driver-performance-bar">
                <span></span>
              </div>
            </div>

          </div>

        </section>

        {/* Drivers Table */}
        <section className="drivers-table-card">

          <div className="drivers-table-header">

            <div>
              <h2>Active Drivers</h2>
              <p>Drivers currently handling deliveries</p>
            </div>

            <div className="driver-tools">

              <div className="driver-search">
                <Search size={16} />

                <input
                  type="text"
                  placeholder="Search driver or vehicle..."
                />
              </div>

              <button className="driver-filter">
                All Drivers
              </button>

            </div>

          </div>

          <div className="drivers-table-wrapper">

            <table className="drivers-table">

              <thead>
                <tr>
                  <th>DRIVER</th>
                  <th>VEHICLE</th>
                  <th>SHIPMENT</th>
                  <th>CURRENT LOCATION</th>
                  <th>SPEED</th>
                  <th>ETA</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>

                {drivers.map((driver) => (
                  <tr key={driver.shipment}>

                    <td>
                      <div className="driver-name-cell">

                        <div className="driver-small-avatar">
                          {driver.initials}
                        </div>

                        <div>
                          <strong>{driver.name}</strong>
                          <span>Verified Driver</span>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="vehicle-number">
                        {driver.vehicle}
                      </span>
                    </td>

                    <td>
                      <span className="driver-shipment">
                        {driver.shipment}
                      </span>
                    </td>

                    <td>
                      <div className="driver-location">
                        <MapPin size={14} />
                        {driver.location}
                      </div>
                    </td>

                    <td>
                      <div className="driver-speed">
                        <Gauge size={14} />
                        {driver.speed}
                      </div>
                    </td>

                    <td>
                      <div className="driver-eta">
                        <Clock3 size={14} />
                        {driver.eta}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`driver-status ${
                          driver.status === "Delayed"
                            ? "status-delayed"
                            : driver.status === "Near Destination"
                            ? "status-near"
                            : "status-route"
                        }`}
                      >
                        <i></i>
                        {driver.status}
                      </span>
                    </td>

                    <td>
                      <button className="call-driver">
                        <Phone size={14} />
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          <div className="drivers-footer">
            <span>
              Showing <strong>5</strong> of <strong>33</strong> drivers
              currently on road
            </span>

            <button>
              View All Drivers →
            </button>
          </div>

        </section>

        {/* Bottom cards */}
        <section className="driver-bottom-grid">

          <div className="driver-bottom-card">

            <div className="bottom-driver-icon">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Driver Safety Score</span>
              <strong>94.8%</strong>
              <p>Excellent fleet safety</p>
            </div>

          </div>

          <div className="driver-bottom-card">

            <div className="bottom-driver-icon purple-icon">
              <Navigation size={21} />
            </div>

            <div>
              <span>GPS Signal Health</span>
              <strong>98.7%</strong>
              <p>All systems operational</p>
            </div>

          </div>

          <div className="driver-bottom-card">

            <div className="bottom-driver-icon green-icon">
              <Clock3 size={21} />
            </div>

            <div>
              <span>Avg Driving Time</span>
              <strong>6.8 hrs</strong>
              <p>Daily driver average</p>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default DriverTracking;