import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Package,
  BarChart3,
  Route,
  Monitor,
  FileText,
  Bell,
  Search,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Server,
  Database,
  Cloud,
  Eye,
  ArrowRight,
  Download,
  RefreshCw,
  LogOut,
  Menu,
  X,
  UserCog,
  CircleAlert,
  MessageCircle,
} from "lucide-react";

import "./AdminDashboard.css";

const users = [
  {
    name: "Rahul Kumar",
    email: "rahul@shiptrack.com",
    role: "Logistics Operator",
    status: "Active",
  },
  {
    name: "Priya Sharma",
    email: "priya@business.com",
    role: "Business Client",
    status: "Active",
  },
  {
    name: "Arjun Reddy",
    email: "arjun@shiptrack.com",
    role: "Support Agent",
    status: "Active",
  },
  {
    name: "Sneha Patel",
    email: "sneha@customer.com",
    role: "Customer",
    status: "Active",
  },
];

const routeData = [
  {
    route: "Hyderabad → Bengaluru",
    shipments: 18,
    performance: 96,
    status: "Excellent",
  },
  {
    route: "Hyderabad → Mumbai",
    shipments: 14,
    performance: 91,
    status: "Good",
  },
  {
    route: "Bengaluru → Chennai",
    shipments: 11,
    performance: 94,
    status: "Excellent",
  },
  {
    route: "Chennai → Hyderabad",
    shipments: 9,
    performance: 82,
    status: "Attention",
  },
];

function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  );

  return (
    <div className="admin-page">

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {mobileOpen && (
        <div
          className="admin-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>

        {/* Logo */}

        <div className="admin-logo">
          <div className="admin-logo-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>

          <button
            className="admin-close"
            onClick={() => setMobileOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        {/* Admin Profile */}

        <div className="admin-profile">
          <div className="admin-avatar">
            AD
          </div>

          <div>
            <strong>Administrator</strong>
            <span>System Control</span>
          </div>
        </div>

        {/* Navigation */}

        <nav className="admin-navigation">

          <p className="admin-nav-title">
            ADMIN CONSOLE
          </p>

          <Link
            to="/dashboard/admin"
            className="admin-nav-link active"
            onClick={() => setMobileOpen(false)}
          >
            <LayoutDashboard size={17} />
            <span>Overview</span>
          </Link>

          <a
            href="#users"
            className="admin-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <Users size={17} />
            <span>User Management</span>
          </a>

          <a
            href="#roles"
            className="admin-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <UserCog size={17} />
            <span>Role Management</span>
          </a>

          <a
            href="#shipments"
            className="admin-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <Package size={17} />
            <span>Shipment Monitoring</span>
          </a>

          <p className="admin-nav-title admin-nav-second">
            ANALYTICS & SYSTEM
          </p>

          <a
            href="#analytics"
            className="admin-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <BarChart3 size={17} />
            <span>Delivery Analytics</span>
          </a>

          <a
            href="#routes"
            className="admin-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <Route size={17} />
            <span>Route Performance</span>
          </a>

          <a
            href="#system"
            className="admin-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <Monitor size={17} />
            <span>System Monitoring</span>
          </a>

          <a
            href="#reports"
            className="admin-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <FileText size={17} />
            <span>Reports</span>
          </a>

        </nav>

        {/* Sidebar Bottom */}

        <div className="admin-sidebar-bottom">

          <div className="admin-system-mini">

            <div className="admin-mini-icon">
              <Activity size={16} />
            </div>

            <div>
              <strong>System Health</strong>

              <span>
                <i />
                Operational
              </span>
            </div>

          </div>

          <Link
            to="/login"
            className="admin-logout"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </Link>

        </div>

      </aside>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="admin-main">

        {/* =========================================
            HEADER
        ========================================= */}

        <header className="admin-header">

          <div className="admin-header-left">

            <button
              className="admin-mobile-menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>

            <div>

              <span className="admin-eyebrow">
                SYSTEM ADMINISTRATION
              </span>

              <h1>
                Administrator Console
              </h1>

              <p>
                Manage users, shipments, analytics and platform health.
              </p>

            </div>

          </div>

          <div className="admin-header-right">

            <div className="admin-live">
              <span />
              All Systems Live
            </div>

            <button className="admin-header-icon">
              <Bell size={18} />
              <i />
            </button>

            <div className="admin-header-user">

              <div>
                AD
              </div>

              <section>
                <strong>
                  Administrator
                </strong>

                <span>
                  System Admin
                </span>
              </section>

            </div>

          </div>

        </header>

        <div className="admin-content">

          {/* =========================================
              STATISTICS
          ========================================= */}

          <section className="admin-stats">

            {/* Users */}

            <div className="admin-stat-card">

              <div className="admin-stat-top">

                <div className="admin-stat-icon purple">
                  <Users size={20} />
                </div>

                <span className="admin-stat-up">
                  +12.4%
                </span>

              </div>

              <strong>
                524
              </strong>

              <span>
                Total Users
              </span>

              <small>
                Across all roles
              </small>

            </div>

            {/* Shipments */}

            <div className="admin-stat-card">

              <div className="admin-stat-top">

                <div className="admin-stat-icon orange">
                  <Package size={20} />
                </div>

                <span className="admin-stat-up">
                  +8.2%
                </span>

              </div>

              <strong>
                128
              </strong>

              <span>
                Total Shipments
              </span>

              <small>
                Current system records
              </small>

            </div>

            {/* Delivery */}

            <div className="admin-stat-card">

              <div className="admin-stat-top">

                <div className="admin-stat-icon cyan">
                  <TrendingUp size={20} />
                </div>

                <span className="admin-stat-up">
                  +2.6%
                </span>

              </div>

              <strong>
                92.6%
              </strong>

              <span>
                On-Time Delivery
              </span>

              <small>
                Platform average
              </small>

            </div>

            {/* Uptime */}

            <div className="admin-stat-card">

              <div className="admin-stat-top">

                <div className="admin-stat-icon green">
                  <Server size={20} />
                </div>

                <span className="admin-stat-live">
                  LIVE
                </span>

              </div>

              <strong>
                99.8%
              </strong>

              <span>
                System Uptime
              </span>

              <small>
                Last 30 days
              </small>

            </div>

          </section>

          {/* =========================================
              SYSTEM OVERVIEW
          ========================================= */}

          <section className="admin-overview-grid">

            {/* Platform Monitoring */}

            <div
              className="admin-card admin-monitor-card"
              id="system"
            >

              <div className="admin-card-header">

                <div>

                  <span>
                    SYSTEM OVERVIEW
                  </span>

                  <h2>
                    Platform Monitoring
                  </h2>

                </div>

                <button className="admin-refresh">
                  <RefreshCw size={15} />
                </button>

              </div>

              <div className="admin-health-grid">

                {/* Server */}

                <div className="health-item">

                  <div className="health-icon green">
                    <Server size={18} />
                  </div>

                  <div>
                    <strong>
                      Application Server
                    </strong>

                    <span>
                      Operational
                    </span>
                  </div>

                  <b>
                    99.9%
                  </b>

                </div>

                {/* Database */}

                <div className="health-item">

                  <div className="health-icon cyan">
                    <Database size={18} />
                  </div>

                  <div>
                    <strong>
                      Database
                    </strong>

                    <span>
                      Operational
                    </span>
                  </div>

                  <b>
                    99.8%
                  </b>

                </div>

                {/* Tracking */}

                <div className="health-item">

                  <div className="health-icon purple">
                    <Cloud size={18} />
                  </div>

                  <div>
                    <strong>
                      Tracking Service
                    </strong>

                    <span>
                      Operational
                    </span>
                  </div>

                  <b>
                    99.7%
                  </b>

                </div>

              </div>

            </div>

            {/* Shipment Analytics */}

            <div
              className="admin-card admin-delivery-card"
              id="analytics"
            >

              <div className="admin-card-header">

                <div>

                  <span>
                    DELIVERY ANALYTICS
                  </span>

                  <h2>
                    Shipment Status
                  </h2>

                </div>

                <BarChart3 size={18} />

              </div>

              <div className="admin-status-content">

                <div className="admin-status-ring">

                  <div>

                    <strong>
                      128
                    </strong>

                    <span>
                      Shipments
                    </span>

                  </div>

                </div>

                <div className="admin-status-list">

                  <div>

                    <span>
                      <i className="delivered-dot" />
                      Delivered
                    </span>

                    <strong>
                      87
                    </strong>

                  </div>

                  <div>

                    <span>
                      <i className="transit-dot" />
                      In Transit
                    </span>

                    <strong>
                      32
                    </strong>

                  </div>

                  <div>

                    <span>
                      <i className="delay-dot" />
                      Delayed
                    </span>

                    <strong>
                      09
                    </strong>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =========================================
              USERS + ALERTS
          ========================================= */}

          <section className="admin-middle-grid">

            {/* USER MANAGEMENT */}

            <div
              className="admin-card users-card"
              id="users"
            >

              <div className="admin-card-header">

                <div>

                  <span>
                    USER MANAGEMENT
                  </span>

                  <h2>
                    Recent Users
                  </h2>

                </div>

                <button className="admin-outline-btn">
                  Manage Users
                  <ArrowRight size={13} />
                </button>

              </div>

              {/* Search */}

              <div className="admin-user-search">

                <Search size={15} />

                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) =>
                    setUserSearch(e.target.value)
                  }
                />

              </div>

              {/* Users */}

              <div className="admin-user-list">

                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (

                    <div
                      className="admin-user-row"
                      key={index}
                    >

                      <div className="admin-user-avatar">

                        {user.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}

                      </div>

                      <div className="admin-user-info">

                        <strong>
                          {user.name}
                        </strong>

                        <span>
                          {user.email}
                        </span>

                      </div>

                      <div className="admin-user-role">
                        {user.role}
                      </div>

                      <div className="admin-user-status">

                        <i />

                        {user.status}

                      </div>

                      <button className="admin-view-user">
                        <Eye size={15} />
                      </button>

                    </div>

                  ))
                ) : (

                  <div className="admin-no-users">
                    No users found.
                  </div>

                )}

              </div>

            </div>

            {/* SYSTEM ALERTS */}

            <div className="admin-card alerts-card">

              <div className="admin-card-header">

                <div>

                  <span>
                    SYSTEM ALERTS
                  </span>

                  <h2>
                    Attention Required
                  </h2>

                </div>

                <div className="admin-alert-count">
                  04
                </div>

              </div>

              <div className="admin-alert-list">

                {/* Alert 1 */}

                <div className="admin-alert-item danger">

                  <div>
                    <AlertTriangle size={16} />
                  </div>

                  <section>

                    <strong>
                      Delayed shipments
                    </strong>

                    <span>
                      9 shipments require monitoring.
                    </span>

                  </section>

                  <ArrowRight size={14} />

                </div>

                {/* Alert 2 */}

                <div className="admin-alert-item warning">

                  <div>
                    <CircleAlert size={16} />
                  </div>

                  <section>

                    <strong>
                      Route performance
                    </strong>

                    <span>
                      Chennai → Hyderabad needs attention.
                    </span>

                  </section>

                  <ArrowRight size={14} />

                </div>

                {/* Alert 3 */}

                <div className="admin-alert-item info">

                  <div>
                    <Users size={16} />
                  </div>

                  <section>

                    <strong>
                      User activity
                    </strong>

                    <span>
                      12 new users registered today.
                    </span>

                  </section>

                  <ArrowRight size={14} />

                </div>

                {/* Alert 4 */}

                <div className="admin-alert-item success">

                  <div>
                    <CheckCircle2 size={16} />
                  </div>

                  <section>

                    <strong>
                      System backup
                    </strong>

                    <span>
                      Latest backup completed successfully.
                    </span>

                  </section>

                  <ArrowRight size={14} />

                </div>

              </div>

            </div>

          </section>

          {/* =========================================
              SHIPMENT MONITORING
          ========================================= */}

          <section
            className="admin-card route-card"
            id="shipments"
          >

            <div className="admin-card-header">

              <div>

                <span>
                  SHIPMENT MONITORING
                </span>

                <h2>
                  Route & Delivery Performance
                </h2>

              </div>

              <button className="admin-outline-btn">
                View Analytics
                <ArrowRight size={13} />
              </button>

            </div>

            <div className="route-table">

              <div className="route-table-head">

                <span>
                  ROUTE
                </span>

                <span>
                  SHIPMENTS
                </span>

                <span>
                  PERFORMANCE
                </span>

                <span>
                  STATUS
                </span>

              </div>

              {routeData.map((route, index) => (

                <div
                  className="route-row"
                  key={index}
                >

                  <div className="route-name">

                    <div className="route-icon">
                      <Route size={15} />
                    </div>

                    <strong>
                      {route.route}
                    </strong>

                  </div>

                  <span className="route-shipments">
                    {route.shipments}
                  </span>

                  <div className="route-progress">

                    <div>
                      <span
                        style={{
                          width: `${route.performance}%`,
                        }}
                      />
                    </div>

                    <b>
                      {route.performance}%
                    </b>

                  </div>

                  <span
                    className={`route-status ${route.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {route.status}
                  </span>

                </div>

              ))}

            </div>

          </section>

          {/* =========================================
              ROLE MANAGEMENT + REPORTS
          ========================================= */}

          <section className="admin-role-grid">

            {/* ROLE MANAGEMENT */}

            <div
              className="admin-card role-card"
              id="roles"
            >

              <div className="admin-card-header">

                <div>

                  <span>
                    ROLE MANAGEMENT
                  </span>

                  <h2>
                    Platform Roles
                  </h2>

                </div>

                <ShieldCheck size={18} />

              </div>

              <div className="role-grid">

                {/* Customer */}

                <div>

                  <Users size={17} />

                  <strong>
                    Customer
                  </strong>

                  <span>
                    386 users
                  </span>

                </div>

                {/* Business */}

                <div>

                  <Package size={17} />

                  <strong>
                    Business Client
                  </strong>

                  <span>
                    74 users
                  </span>

                </div>

                {/* Operator */}

                <div>

                  <Route size={17} />

                  <strong>
                    Logistics Operator
                  </strong>

                  <span>
                    41 users
                  </span>

                </div>

                {/* Support */}

                <div>

                  <MessageCircle size={17} />

                  <strong>
                    Support Agent
                  </strong>

                  <span>
                    18 users
                  </span>

                </div>

                {/* Admin */}

                <div>

                  <ShieldCheck size={17} />

                  <strong>
                    Administrator
                  </strong>

                  <span>
                    5 users
                  </span>

                </div>

              </div>

            </div>

            {/* REPORTS */}

            <div
              className="admin-card reports-card"
              id="reports"
            >

              <div className="admin-card-header">

                <div>

                  <span>
                    REPORTING
                  </span>

                  <h2>
                    Administrative Reports
                  </h2>

                </div>

                <FileText size={18} />

              </div>

              <div className="admin-report-list">

                {/* Report 1 */}

                <div>

                  <div className="report-icon">
                    <BarChart3 size={17} />
                  </div>

                  <section>

                    <strong>
                      Delivery Performance
                    </strong>

                    <span>
                      Monthly analytics report
                    </span>

                  </section>

                  <button>
                    <Download size={15} />
                  </button>

                </div>

                {/* Report 2 */}

                <div>

                  <div className="report-icon">
                    <Users size={17} />
                  </div>

                  <section>

                    <strong>
                      User Activity
                    </strong>

                    <span>
                      Platform user activity report
                    </span>

                  </section>

                  <button>
                    <Download size={15} />
                  </button>

                </div>

                {/* Report 3 */}

                <div>

                  <div className="report-icon">
                    <Package size={17} />
                  </div>

                  <section>

                    <strong>
                      Shipment Summary
                    </strong>

                    <span>
                      System shipment overview
                    </span>

                  </section>

                  <button>
                    <Download size={15} />
                  </button>

                </div>

              </div>

            </div>

          </section>

          {/* =========================================
              FOOTER STATUS
          ========================================= */}

          <div className="admin-footer">

            <div>

              <span className="admin-green-dot" />

              <strong>
                Platform operational
              </strong>

              <small>
                Last synchronized just now
              </small>

            </div>

            <div className="admin-footer-right">

              <span>
                API
                <b>Healthy</b>
              </span>

              <span>
                Database
                <b>Healthy</b>
              </span>

              <span>
                Tracking
                <b>Live</b>
              </span>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;