import React from "react";
import { Link } from "react-router-dom";

import "./CustomerDashboard.css";


// =========================================================
// DEMO SHIPMENT DATA
// =========================================================

const shipments = [
  {
    id: "TRK-2026-001",
    route: "Hyderabad → Bengaluru",
    status: "In Transit",
    date: "02 Sep 2026",
    eta: "Today, 6:30 PM",
  },
  {
    id: "TRK-2026-002",
    route: "Chennai → Hyderabad",
    status: "Delivered",
    date: "01 Sep 2026",
    eta: "Delivered",
  },
  {
    id: "TRK-2026-003",
    route: "Mumbai → Pune",
    status: "Picked Up",
    date: "01 Sep 2026",
    eta: "03 Sep 2026",
  },
  {
    id: "TRK-2026-004",
    route: "Delhi → Jaipur",
    status: "In Transit",
    date: "31 Aug 2026",
    eta: "04 Sep 2026",
  },
];


// =========================================================
// CUSTOMER DASHBOARD
// =========================================================

function CustomerDashboard() {

  // =======================================================
  // GET CURRENT LOGGED-IN USER
  // =======================================================

  const savedUser = localStorage.getItem("shiptrackUser");

  let loggedInUser = {};

  try {
    loggedInUser = savedUser
      ? JSON.parse(savedUser)
      : {};
  } catch (error) {
    console.error(
      "Unable to read logged-in user:",
      error
    );

    loggedInUser = {};
  }


  // =======================================================
  // USER NAME
  // =======================================================

  const fullName =
    loggedInUser.name ||
    `${loggedInUser.firstName || ""} ${
      loggedInUser.lastName || ""
    }`.trim() ||
    loggedInUser.email?.split("@")[0] ||
    "Customer";


  // =======================================================
  // FIRST NAME
  // =======================================================

  const firstName =
    loggedInUser.firstName ||
    fullName
      .split(/[\s._]+/)
      .filter(Boolean)[0] ||
    "Customer";


  // =======================================================
  // AVATAR LETTER
  // =======================================================

  const avatarLetter =
    firstName.charAt(0).toUpperCase() ||
    "C";


  // =======================================================
  // USER ROLE
  // =======================================================

  const userRole =
    loggedInUser.role === "customer"
      ? "Customer"
      : loggedInUser.role || "Customer";


  return (
    <div className="customer-dashboard">


      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="customer-sidebar">


        {/* =================================================
            BRAND
        ================================================= */}

        <div className="customer-brand">

          <div className="brand-icon">
            ◇
          </div>

          <div>

            <h2>
              ShipTrack <span>Pro</span>
            </h2>

            <p>
              LOGISTICS INTELLIGENCE
            </p>

          </div>

        </div>


        {/* =================================================
            MAIN MENU
        ================================================= */}

        <div className="sidebar-section">

          <p className="sidebar-title">
            MAIN MENU
          </p>


          {/* =================================================
              OVERVIEW
          ================================================= */}

          <Link
            to="/dashboard/customer"
            className="sidebar-link active"
          >

            <span>
              ⌂
            </span>

            Overview

          </Link>


          {/* =================================================
              ACTIVE SHIPMENTS
          ================================================= */}

          <Link
            to="/shipments/active"
            className="sidebar-link"
          >

            <span>
              ▣
            </span>

            Active Shipments

          </Link>


          {/* =================================================
              SHIPMENT HISTORY
          ================================================= */}

          <Link
            to="/shipments/history"
            className="sidebar-link"
          >

            <span>
              ◫
            </span>

            Shipment History

          </Link>


          {/* =================================================
              TRACKING
          ================================================= */}

          <Link
            to="/tracking"
            className="sidebar-link"
          >

            <span>
              ◎
            </span>

            Tracking

          </Link>


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <Link
            to="/notifications"
            className="sidebar-link"
          >

            <span>
              ◉
            </span>

            Notifications

            <b className="notification-count">
              3
            </b>

          </Link>


          {/* =================================================
              TRACKING INSIGHTS
          ================================================= */}

          <Link
            to="/tracking-insights"
            className="sidebar-link"
          >

            <span>
              ⌁
            </span>

            Tracking Insights

          </Link>

        </div>


        {/* =================================================
            SIDEBAR BOTTOM
        ================================================= */}

        <div className="sidebar-bottom">


          {/* =================================================
              HELP
          ================================================= */}

          <Link
            to="/notifications"
            className="help-card"
          >

            <div className="help-icon">
              ?
            </div>

            <div>

              <strong>
                Need help?
              </strong>

              <p>
                We're here for you.
              </p>

            </div>

          </Link>


          {/* =================================================
              LOGOUT
          ================================================= */}

          <Link
            to="/login"
            className="logout-button"
            onClick={() => {

              localStorage.removeItem(
                "shiptrackUser"
              );

            }}
          >

            <span>
              ↪
            </span>

            Logout

          </Link>

        </div>

      </aside>


      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <main className="customer-main">


        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="customer-topbar">


          {/* =================================================
              WELCOME
          ================================================= */}

          <div>

            <p className="welcome-small">
              CUSTOMER PORTAL
            </p>

            <h1>
              Good afternoon, {firstName}
            </h1>

            <p className="welcome-text">
              Here's what's happening with your shipments today.
            </p>

          </div>


          {/* =================================================
              TOP BAR ACTIONS
          ================================================= */}

          <div className="topbar-actions">


            {/* =================================================
                NOTIFICATION
            ================================================= */}

            <Link
              to="/notifications"
              className="top-icon"
            >

              🔔

              <span className="red-dot"></span>

            </Link>


            {/* =================================================
                PROFILE
            ================================================= */}

            <div className="profile">


              {/* AVATAR */}

              <div className="profile-avatar">
                {avatarLetter}
              </div>


              {/* USER INFORMATION */}

              <div className="profile-info">

                <strong>
                  {fullName}
                </strong>

                <span>
                  {userRole}
                </span>

              </div>


              {/* ARROW */}

              <span className="profile-arrow">
                ⌄
              </span>

            </div>

          </div>

        </header>


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="stats-grid">


          {/* =================================================
              ACTIVE SHIPMENTS
          ================================================= */}

          <Link
            to="/shipments/active"
            className="stat-card orange"
          >

            <div className="stat-top">

              <span>
                ACTIVE SHIPMENTS
              </span>

              <div className="stat-icon">
                ▣
              </div>

            </div>

            <h2>
              07
            </h2>

            <p>

              <span className="positive">
                ↑ 12%
              </span>

              compared to last month

            </p>

          </Link>


          {/* =================================================
              IN TRANSIT
          ================================================= */}

          <Link
            to="/tracking"
            className="stat-card purple"
          >

            <div className="stat-top">

              <span>
                IN TRANSIT
              </span>

              <div className="stat-icon">
                ➜
              </div>

            </div>

            <h2>
              04
            </h2>

            <p>

              <span className="positive">
                ●
              </span>

              Currently moving

            </p>

          </Link>


          {/* =================================================
              DELIVERED
          ================================================= */}

          <Link
            to="/shipments/history"
            className="stat-card green"
          >

            <div className="stat-top">

              <span>
                DELIVERED
              </span>

              <div className="stat-icon">
                ✓
              </div>

            </div>

            <h2>
              15
            </h2>

            <p>

              <span className="positive">
                ↑ 8%
              </span>

              successful deliveries

            </p>

          </Link>


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <Link
            to="/notifications"
            className="stat-card pink"
          >

            <div className="stat-top">

              <span>
                NOTIFICATIONS
              </span>

              <div className="stat-icon">
                ●
              </div>

            </div>

            <h2>
              03
            </h2>

            <p>
              Unread updates available
            </p>

          </Link>

        </section>


        {/* =================================================
            CONTENT GRID
        ================================================= */}

        <section className="dashboard-content">


          {/* =================================================
              RECENT SHIPMENTS
          ================================================= */}

          <div className="panel shipments-panel">

            <div className="panel-header">

              <div>

                <p className="panel-label">
                  SHIPMENT ACTIVITY
                </p>

                <h2>
                  Recent Shipments
                </h2>

              </div>


              <Link
                to="/shipments/active"
                className="view-all"
              >
                View all →
              </Link>

            </div>


            <div className="shipment-list">

              {shipments.map((shipment) => (

                <div
                  className="shipment-row"
                  key={shipment.id}
                >


                  {/* SHIPMENT */}

                  <div className="shipment-main">

                    <div className="shipment-box">
                      □
                    </div>

                    <div>

                      <strong>
                        {shipment.id}
                      </strong>

                      <p>
                        {shipment.route}
                      </p>

                    </div>

                  </div>


                  {/* DATE */}

                  <div className="shipment-date">

                    <span>
                      Created
                    </span>

                    <strong>
                      {shipment.date}
                    </strong>

                  </div>


                  {/* STATUS */}

                  <div className="shipment-status">

                    <span
                      className={`status-badge ${shipment.status
                        .toLowerCase()
                        .replace(/\s/g, "-")}`}
                    >

                      <i></i>

                      {shipment.status}

                    </span>

                    <small>
                      {shipment.eta}
                    </small>

                  </div>


                  {/* TRACK */}

                  <Link
                    to={`/tracking?trackingNumber=${shipment.id}`}
                    className="track-arrow"
                  >
                    →
                  </Link>

                </div>

              ))}

            </div>

          </div>


          {/* =================================================
              TRACKING INSIGHTS
          ================================================= */}

          <div className="panel insights-panel">

            <div className="panel-header">

              <div>

                <p className="panel-label">
                  LIVE VISIBILITY
                </p>

                <h2>
                  Tracking Insights
                </h2>

              </div>


              <Link
                to="/tracking-insights"
                className="live-badge"
              >

                <i></i>

                LIVE

              </Link>

            </div>


            {/* =================================================
                ROUTE
            ================================================= */}

            <div className="insight-route">


              {/* FROM */}

              <div className="location">

                <div className="location-icon orange-icon">
                  ●
                </div>

                <div>

                  <span>
                    FROM
                  </span>

                  <strong>
                    Hyderabad
                  </strong>

                  <small>
                    Telangana, India
                  </small>

                </div>

              </div>


              {/* ROUTE LINE */}

              <div className="route-line">

                <div className="route-dot"></div>

                <div className="route-progress"></div>

                <div className="route-dot"></div>

              </div>


              {/* TO */}

              <div className="location destination">

                <div>

                  <span>
                    TO
                  </span>

                  <strong>
                    Bengaluru
                  </strong>

                  <small>
                    Karnataka, India
                  </small>

                </div>

                <div className="location-icon purple-icon">
                  ●
                </div>

              </div>

            </div>


            {/* =================================================
                TRACKING DETAILS
            ================================================= */}

            <div className="insight-details">


              <div>

                <span>
                  TRACKING ID
                </span>

                <strong>
                  TRK-2026-001
                </strong>

              </div>


              <div>

                <span>
                  CURRENT STATUS
                </span>

                <strong className="green-text">
                  In Transit
                </strong>

              </div>


              <div>

                <span>
                  ESTIMATED ARRIVAL
                </span>

                <strong>
                  Today, 6:30 PM
                </strong>

              </div>

            </div>


            {/* TRACK BUTTON */}

            <Link
              to="/tracking?trackingNumber=TRK-2026-001"
              className="tracking-button"
            >
              Track Shipment →
            </Link>

          </div>

        </section>


        {/* =================================================
            LOWER GRID
        ================================================= */}

        <section className="lower-grid">


          {/* =================================================
              DELIVERY STATUS
          ================================================= */}

          <div className="panel delivery-panel">

            <div className="panel-header">

              <div>

                <p className="panel-label">
                  OVERVIEW
                </p>

                <h2>
                  Delivery Status
                </h2>

              </div>

              <span className="period">
                Last 30 days ⌄
              </span>

            </div>


            <div className="delivery-chart">


              {/* NUMBER */}

              <div className="chart-number">

                <strong>
                  94%
                </strong>

                <span>
                  On-time delivery
                </span>

              </div>


              {/* BARS */}

              <div className="chart-bars">


                <div className="bar-group">

                  <div className="bar bar-1"></div>

                  <span>
                    W1
                  </span>

                </div>


                <div className="bar-group">

                  <div className="bar bar-2"></div>

                  <span>
                    W2
                  </span>

                </div>


                <div className="bar-group">

                  <div className="bar bar-3"></div>

                  <span>
                    W3
                  </span>

                </div>


                <div className="bar-group">

                  <div className="bar bar-4"></div>

                  <span>
                    W4
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div className="panel notifications-panel">

            <div className="panel-header">

              <div>

                <p className="panel-label">
                  UPDATES
                </p>

                <h2>
                  Notifications
                </h2>

              </div>


              <Link
                to="/notifications"
                className="notification-number"
              >
                3 new
              </Link>

            </div>


            {/* =================================================
                NOTIFICATION 1
            ================================================= */}

            <div className="notification-item">

              <div className="notification-icon orange-notification">
                !
              </div>

              <div>

                <strong>
                  Shipment is in transit
                </strong>

                <p>
                  TRK-2026-001 is moving to Bengaluru.
                </p>

                <span>
                  15 minutes ago
                </span>

              </div>

            </div>


            {/* =================================================
                NOTIFICATION 2
            ================================================= */}

            <div className="notification-item">

              <div className="notification-icon green-notification">
                ✓
              </div>

              <div>

                <strong>
                  Shipment delivered
                </strong>

                <p>
                  TRK-2026-002 was successfully delivered.
                </p>

                <span>
                  Yesterday
                </span>

              </div>

            </div>


            {/* =================================================
                NOTIFICATION 3
            ================================================= */}

            <div className="notification-item">

              <div className="notification-icon purple-notification">
                i
              </div>

              <div>

                <strong>
                  ETA updated
                </strong>

                <p>
                  Estimated arrival time has changed.
                </p>

                <span>
                  Yesterday
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="dashboard-footer">

          <span>
            © 2026 ShipTrack Pro
          </span>

          <span>
            Secure logistics intelligence platform
          </span>

        </footer>

      </main>

    </div>
  );
}

export default CustomerDashboard;