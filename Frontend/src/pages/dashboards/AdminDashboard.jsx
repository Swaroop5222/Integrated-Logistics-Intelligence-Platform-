import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api";
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
  RefreshCw,
  LogOut,
  Menu,
  X,
  UserCog,
  MessageCircle,
} from "lucide-react";

import "./AdminDashboard.css";

function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");
  const [routeData, setRouteData] = useState([]);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [performanceReport, setPerformanceReport] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/users")
      .then((response) => {
        if (active) setUsers(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to load administrator user list:", err);
          setUserError(err.message || "Unable to load users.");
        }
      })
      .finally(() => {
        if (active) setUserLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadRoutes() {
      try {
        if (fromDate && toDate && fromDate > toDate) {
          setRouteData([]);
          setRouteError("The start date must be on or before the end date.");
          setRouteLoading(false);
          return;
        }

        setRouteLoading(true);
        setRouteError("");
        const shipmentResponse = await apiRequest("/api/shipments");
        const allShipments = Array.isArray(shipmentResponse) ? shipmentResponse : [];
        const shipments = allShipments.filter((shipment) => {
          const createdDate = shipment.createdAt?.slice(0, 10);
          return (!fromDate || (createdDate && createdDate >= fromDate))
            && (!toDate || (createdDate && createdDate <= toDate));
        });
        const results = await Promise.allSettled(
          shipments.filter((shipment) => shipment?.id).map(async (shipment) => ({
            shipment,
            route: await apiRequest(`/api/routes/shipment/${shipment.id}`),
          }))
        );
        const failedRequests = results.filter(
          (result) =>
            result.status === "rejected" &&
            result.reason?.status !== 404
        );
        if (failedRequests.length > 0) throw failedRequests[0].reason;

        const grouped = new Map();
        results.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const { shipment, route } = result.value;
          const name = `${route.origin || shipment.senderAddress} → ${
            route.destination || shipment.receiverAddress
          }`;
          const row = grouped.get(name) || {
            route: name,
            shipments: 0,
            delivered: 0,
          };
          row.shipments += 1;
          if (shipment.status === "DELIVERED") row.delivered += 1;
          grouped.set(name, row);
        });

        const rows = [...grouped.values()].map((row) => {
          const performance = row.shipments
            ? Math.round((row.delivered / row.shipments) * 100)
            : 0;
          return {
            ...row,
            performance,
            status:
              performance >= 90
                ? "Excellent"
                : performance >= 75
                  ? "Good"
                  : "Attention",
          };
        });
        if (active) setRouteData(rows);
      } catch (err) {
        if (active) {
          console.error("Failed to load saved route data:", err);
          setRouteError(err.message || "Unable to load saved route data.");
        }
      } finally {
        if (active) setRouteLoading(false);
      }
    }

    loadRoutes();
    return () => {
      active = false;
    };
  }, [fromDate, toDate]);

  useEffect(() => {
    let active = true;
    apiRequest("/api/notifications")
      .then((response) => {
        if (active) setNotifications(Array.isArray(response) ? response.slice(0, 4) : []);
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to load administrator notifications:", err);
          setNotificationError(err.message || "Unable to load notifications.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      if (fromDate && toDate && fromDate > toDate) {
        setAnalytics(null);
        setPerformanceReport(null);
        setAnalyticsError("The start date must be on or before the end date.");
        setAnalyticsLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const query = params.toString();
      const suffix = query ? `?${query}` : "";

      try {
        setAnalyticsLoading(true);
        setAnalyticsError("");
        const [analyticsResponse, reportResponse] = await Promise.all([
          apiRequest(`/api/analytics${suffix}`),
          apiRequest(`/api/reports/performance${suffix}`),
        ]);
        if (active) {
          setAnalytics(analyticsResponse);
          setPerformanceReport(reportResponse);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to load administrator analytics:", err);
          setAnalytics(null);
          setPerformanceReport(null);
          setAnalyticsError(err.message || "Unable to load shipment analytics.");
        }
      } finally {
        if (active) setAnalyticsLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      active = false;
    };
  }, [fromDate, toDate]);

  const onTimeRate = performanceReport?.completedDeliveries
    ? `${(
        (performanceReport.onTimeDeliveries /
          performanceReport.completedDeliveries) *
        100
      ).toFixed(1)}%`
    : "—";

  const filteredUsers = users.filter((user) =>
    `${user.fullName} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  );

  const countUsersByRole = (role) =>
    users.filter((user) => user.role === role).length;

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
                {analyticsLoading ? "Checking" : analyticsError ? "Unavailable" : "API connected"}
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
              {analyticsLoading
                ? "Checking API"
                : analyticsError
                  ? "API Unavailable"
                  : "API Connected"}
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
                  LIVE
                </span>

              </div>

              <strong>
                {userLoading ? "..." : users.length}
              </strong>

              <span>
                Total Users
              </span>

              <small>
                {userError || "Registered accounts"}
              </small>

            </div>

            {/* Shipments */}

            <div className="admin-stat-card">

              <div className="admin-stat-top">

                <div className="admin-stat-icon orange">
                  <Package size={20} />
                </div>

                <span className="admin-stat-up">
                  LIVE
                </span>

              </div>

              <strong>
                {analyticsLoading ? "..." : analytics?.totalShipments ?? "—"}
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
                  LIVE
                </span>

              </div>

              <strong>{analyticsLoading ? "..." : onTimeRate}</strong>

              <span>
                On-Time Delivery
              </span>

              <small>
                Based on recorded delivery status history
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

              <strong>—</strong>

              <span>
                System Uptime
              </span>

              <small>
                Uptime history is not available
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
                      Health telemetry unavailable
                    </span>
                  </div>

                  <b>
                    —
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
                      Health telemetry unavailable
                    </span>
                  </div>

                  <b>
                    —
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
                      Health telemetry unavailable
                    </span>
                  </div>

                  <b>
                    —
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

              <div className="admin-analytics-filters">
                <label>
                  From{" "}
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(event) => setFromDate(event.target.value)}
                  />
                </label>{" "}
                <label>
                  To{" "}
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(event) => setToDate(event.target.value)}
                  />
                </label>
              </div>
              {analyticsError && <p role="alert">{analyticsError}</p>}

              <div className="admin-status-content">

                <div className="admin-status-ring">

                  <div>

                    <strong>
                      {analyticsLoading ? "..." : analytics?.totalShipments ?? "—"}
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
                      {analyticsLoading ? "..." : analytics?.deliveredShipments ?? "—"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      <i className="transit-dot" />
                      In Transit
                    </span>

                    <strong>
                      {analyticsLoading ? "..." : analytics?.inTransitShipments ?? "—"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      <i className="delay-dot" />
                      Delayed
                    </span>

                    <strong>
                      {analyticsLoading ? "..." : analytics?.delayedShipments ?? "—"}
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

                {userLoading ? (
                  <div className="admin-no-users">Loading users...</div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (

                    <div
                      className="admin-user-row"
                      key={user.id}
                    >

                      <div className="admin-user-avatar">

                        {(user.fullName || user.email || "U")
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}

                      </div>

                      <div className="admin-user-info">

                        <strong>
                          {user.fullName}
                        </strong>

                        <span>
                          {user.email}
                        </span>

                      </div>

                      <div className="admin-user-role">
                        {user.role?.replaceAll("_", " ")}
                      </div>

                      <div className="admin-user-status">

                        <i />

                        Registered

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

                  <h2>Recent Shipment Notifications</h2>

                </div>

                <div className="admin-alert-count">
                  {notifications.length.toString().padStart(2, "0")}
                </div>

              </div>

              <div className="admin-alert-list">

                {notificationError ? (
                  <div className="admin-no-users" role="alert">
                    {notificationError}
                  </div>
                ) : notifications.length ? (
                  notifications.map((notification) => (
                    <div
                      className={`admin-alert-item ${notification.read ? "info" : "warning"}`}
                      key={notification.id}
                    >
                      <div>
                        {notification.read
                          ? <CheckCircle2 size={16} />
                          : <AlertTriangle size={16} />}
                      </div>
                      <section>
                        <strong>{notification.title}</strong>
                        <span>{notification.message}</span>
                      </section>
                      <ArrowRight size={14} />
                    </div>
                  ))
                ) : (
                  <div className="admin-no-users">No shipment notifications.</div>
                )}

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

              {routeError ? (
                <div className="admin-no-users" role="alert">{routeError}</div>
              ) : routeLoading ? (
                <div className="admin-no-users">Loading saved routes...</div>
              ) : routeData.length === 0 ? (
                <div className="admin-no-users">No saved shipment routes.</div>
              ) : routeData.map((route) => (

                <div
                  className="route-row"
                  key={route.route}
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
                    {userLoading ? "..." : `${countUsersByRole("CUSTOMER")} users`}
                  </span>

                </div>

                {/* Business */}

                <div>

                  <Package size={17} />

                  <strong>
                    Business Client
                  </strong>

                  <span>
                    {userLoading ? "..." : `${countUsersByRole("BUSINESS_CLIENT")} users`}
                  </span>

                </div>

                {/* Operator */}

                <div>

                  <Route size={17} />

                  <strong>
                    Logistics Operator
                  </strong>

                  <span>
                    {userLoading ? "..." : `${countUsersByRole("LOGISTICS_OPERATOR")} users`}
                  </span>

                </div>

                {/* Support */}

                <div>

                  <MessageCircle size={17} />

                  <strong>
                    Support Agent
                  </strong>

                  <span>
                    {userLoading ? "..." : `${countUsersByRole("SUPPORT_AGENT")} users`}
                  </span>

                </div>

                {/* Admin */}

                <div>

                  <ShieldCheck size={17} />

                  <strong>
                    Administrator
                  </strong>

                  <span>
                    {userLoading ? "..." : `${countUsersByRole("ADMINISTRATOR")} users`}
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

                <div>
                  <div className="report-icon">
                    <BarChart3 size={17} />
                  </div>
                  <section>
                    <strong>
                      Delivery Performance
                    </strong>
                    <span>
                      {analyticsLoading
                        ? "Loading report..."
                        : `${performanceReport?.completedDeliveries ?? 0} completed deliveries in the selected dates`}
                    </span>
                  </section>
                </div>

                <div>
                  <div className="report-icon"><Users size={17} /></div>
                  <section>
                    <strong>Registered Users</strong>
                    <span>{userLoading ? "Loading users..." : `${users.length} registered accounts`}</span>
                  </section>
                </div>

                <div>
                  <div className="report-icon"><Package size={17} /></div>
                  <section>
                    <strong>Shipment Summary</strong>
                    <span>{analyticsLoading ? "Loading shipments..." : `${analytics?.totalShipments ?? 0} shipments created in the selected dates`}</span>
                  </section>
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
                {analyticsLoading ? "Checking platform data" : analyticsError ? "Platform data unavailable" : "Live platform data"}
              </strong>

              <small>
                Counts read from the authenticated backend APIs
              </small>

            </div>

            <div className="admin-footer-right">

              <span>
                API
                <b>{analyticsLoading ? "Checking" : analyticsError ? "Unavailable" : "Connected"}</b>
              </span>

              <span>
                Database
                <b>{analyticsLoading ? "Checking" : analyticsError ? "Unavailable" : "Connected"}</b>
              </span>

              <span>
                Tracking
                <b>Not monitored</b>
              </span>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;