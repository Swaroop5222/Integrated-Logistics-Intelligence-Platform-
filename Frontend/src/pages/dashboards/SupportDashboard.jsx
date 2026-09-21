import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  Headphones,
  Menu,
  MapPin,
  PackageCheck,
  Search,
  ShieldAlert,
  Truck,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";

import { apiRequest } from "../../api";
import "./SupportDashboard.css";

const ACTIVE_STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
];

const DELAY_STATUSES = ["FAILED_DELIVERY", "DELAYED"];

function normalizeArray(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.shipments)) return data.shipments;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function getStatus(shipment) {
  return String(
    shipment?.status ||
      shipment?.shipmentStatus ||
      shipment?.currentStatus ||
      ""
  ).toUpperCase();
}

function formatStatus(status) {
  const map = {
    CREATED: "Created",
    PICKED_UP: "Picked Up",
    IN_TRANSIT: "In Transit",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    FAILED_DELIVERY: "Failed Delivery",
    DELAYED: "Delayed",
    CANCELLED: "Cancelled",
  };

  return map[status] || status || "Data unavailable";
}

function getTrackingNumber(shipment) {
  return (
    shipment?.trackingNumber ||
    shipment?.trackingId ||
    shipment?.tracking ||
    "Data unavailable"
  );
}

function getShipmentId(shipment) {
  return shipment?.id || shipment?.shipmentId;
}

function getSender(shipment) {
  return (
    shipment?.senderAddress ||
    shipment?.senderCity ||
    shipment?.origin ||
    shipment?.from ||
    "Data unavailable"
  );
}

function getReceiver(shipment) {
  return (
    shipment?.receiverAddress ||
    shipment?.receiverCity ||
    shipment?.destination ||
    shipment?.to ||
    "Data unavailable"
  );
}

function getRoute(shipment) {
  const from = getSender(shipment);
  const to = getReceiver(shipment);

  if (from === "Data unavailable" && to === "Data unavailable") {
    return "Data unavailable";
  }

  return `${from} → ${to}`;
}

function getCustomerName(shipment) {
  return (
    shipment?.customer?.name ||
    shipment?.customer?.fullName ||
    shipment?.customerName ||
    shipment?.customer?.username ||
    shipment?.receiverName ||
    shipment?.receiverContactName ||
    null
  );
}

function getCustomerEmail(shipment) {
  return (
    shipment?.customer?.email ||
    shipment?.customerEmail ||
    shipment?.receiverEmail ||
    null
  );
}

function getDate(shipment) {
  return (
    shipment?.updatedAt ||
    shipment?.createdAt ||
    shipment?.statusUpdatedAt ||
    null
  );
}

function formatDate(value) {
  if (!value) return "Data unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeDate(value) {
  if (!value) return "Data unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);

  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return formatDate(value);
}

function getUserName(user) {
  return (
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email ||
    "Support User"
  );
}

function getInitials(user) {
  const name = getUserName(user);

  if (!name || name === "Support User") {
    return "SU";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getCustomerInitials(name) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getShipmentStatusClass(status) {
  if (status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") {
    return "in-transit";
  }

  if (status === "FAILED_DELIVERY" || status === "DELAYED") {
    return "delayed";
  }

  if (status === "DELIVERED") {
    return "near-destination";
  }

  return "in-transit";
}

function getShipmentIcon(status) {
  if (status === "DELIVERED") {
    return <CheckCircle2 size={16} />;
  }

  if (status === "FAILED_DELIVERY" || status === "DELAYED") {
    return <ShieldAlert size={16} />;
  }

  if (status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") {
    return <Truck size={16} />;
  }

  return <PackageCheck size={16} />;
}

function SupportDashboard() {
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [userResult, shipmentResult] = await Promise.all([
          apiRequest("/api/users/me"),
          apiRequest("/api/shipments"),
        ]);

        setUser(userResult);
        setShipments(normalizeArray(shipmentResult));
      } catch (err) {
        console.error("Support dashboard loading failed:", err);
        setError(err.message || "Unable to load support dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const activeShipments = useMemo(
    () =>
      shipments.filter((shipment) =>
        ACTIVE_STATUSES.includes(getStatus(shipment))
      ),
    [shipments]
  );

  const delayedShipments = useMemo(
    () =>
      shipments.filter((shipment) =>
        DELAY_STATUSES.includes(getStatus(shipment))
      ),
    [shipments]
  );

  const deliveredShipments = useMemo(
    () => shipments.filter((shipment) => getStatus(shipment) === "DELIVERED"),
    [shipments]
  );

  const inTransitShipments = useMemo(
    () =>
      shipments.filter((shipment) =>
        ["IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(getStatus(shipment))
      ),
    [shipments]
  );

  const filteredShipments = useMemo(() => {
    const query = search.trim().toLowerCase();

    const sorted = [...activeShipments, ...delayedShipments]
      .filter(
        (shipment, index, array) =>
          array.findIndex(
            (item) => getShipmentId(item) === getShipmentId(shipment)
          ) === index
      )
      .sort((a, b) => {
        const dateA = new Date(getDate(a) || 0).getTime();
        const dateB = new Date(getDate(b) || 0).getTime();

        return dateB - dateA;
      });

    if (!query) {
      return sorted.slice(0, 8);
    }

    return sorted.filter((shipment) => {
      const tracking = getTrackingNumber(shipment).toLowerCase();
      const route = getRoute(shipment).toLowerCase();
      const customer = (getCustomerName(shipment) || "").toLowerCase();
      const status = formatStatus(getStatus(shipment)).toLowerCase();

      return (
        tracking.includes(query) ||
        route.includes(query) ||
        customer.includes(query) ||
        status.includes(query)
      );
    });
  }, [activeShipments, delayedShipments, search]);

  const customers = useMemo(() => {
    const map = new Map();

    shipments.forEach((shipment) => {
      const name = getCustomerName(shipment);
      const email = getCustomerEmail(shipment);

      if (!name && !email) {
        return;
      }

      const key = String(
        email || name
      ).toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          name: name || "Data unavailable",
          email: email || "Data unavailable",
          shipments: 0,
          active: 0,
          delivered: 0,
          lastActivity: getDate(shipment),
        });
      }

      const customer = map.get(key);

      customer.shipments += 1;

      if (ACTIVE_STATUSES.includes(getStatus(shipment))) {
        customer.active += 1;
      }

      if (getStatus(shipment) === "DELIVERED") {
        customer.delivered += 1;
      }

      const currentDate = new Date(getDate(shipment) || 0).getTime();
      const previousDate = new Date(customer.lastActivity || 0).getTime();

      if (currentDate > previousDate) {
        customer.lastActivity = getDate(shipment);
      }
    });

    return Array.from(map.values())
      .sort((a, b) => {
        const aDate = new Date(a.lastActivity || 0).getTime();
        const bDate = new Date(b.lastActivity || 0).getTime();

        return bDate - aDate;
      })
      .slice(0, 6);
  }, [shipments]);

  const uniqueCustomerCount = customers.length;

  const activeCustomerCount = customers.filter(
    (customer) => customer.active > 0
  ).length;

  const exceptionCount = delayedShipments.length;

  const exceptionSummary = {
    delayed: delayedShipments.length,
    failed: shipments.filter(
      (shipment) => getStatus(shipment) === "FAILED_DELIVERY"
    ).length,
    cancelled: shipments.filter(
      (shipment) => getStatus(shipment) === "CANCELLED"
    ).length,
  };

  const recentAlerts = useMemo(() => {
    return [...delayedShipments]
      .sort((a, b) => {
        const dateA = new Date(getDate(a) || 0).getTime();
        const dateB = new Date(getDate(b) || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 4);
  }, [delayedShipments]);

  const activeRouteCount = useMemo(() => {
    return activeShipments.length;
  }, [activeShipments]);

  const notificationCount = null;

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="support-page">
      {sidebarOpen && (
        <div
          className="support-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`support-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="support-logo">
          <div className="support-logo-mark">
            <Truck size={19} />
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>SUPPORT PORTAL</span>
          </div>

          <button
            className="support-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="support-profile">
          <div className="support-avatar">{getInitials(user)}</div>

          <div>
            <strong>{getUserName(user)}</strong>
            <span>{user?.role || "SUPPORT AGENT"}</span>
          </div>
        </div>

        <nav className="support-navigation">
          <div className="support-nav-title">SUPPORT</div>

          <Link
            className="support-nav-link active"
            to="/dashboard/support"
            onClick={closeSidebar}
          >
            <Headphones size={15} />
            Dashboard
          </Link>

          <Link
            className="support-nav-link"
            to="/shipments"
            onClick={closeSidebar}
          >
            <PackageCheck size={15} />
            Shipments
          </Link>

          <Link
            className="support-nav-link"
            to="/tracking"
            onClick={closeSidebar}
          >
            <MapPin size={15} />
            Tracking
          </Link>

          <Link
            className="support-nav-link"
            to="/notifications"
            onClick={closeSidebar}
          >
            <Bell size={15} />
            Notifications
            {notificationCount !== null && (
              <b>{notificationCount}</b>
            )}
          </Link>

          <div className="support-nav-title support-nav-second">
            MANAGEMENT
          </div>

          <Link
            className="support-nav-link"
            to="/reports"
            onClick={closeSidebar}
          >
            <Box size={15} />
            Reports
          </Link>

          <Link
            className="support-nav-link"
            to="/settings"
            onClick={closeSidebar}
          >
            <User size={15} />
            Account
          </Link>
        </nav>

        <div className="support-sidebar-bottom">
          <div className="support-info-box">
            <div className="support-info-icon">
              <Headphones size={15} />
            </div>

            <div>
              <strong>Support Center</strong>
              <p>
                Shipment and delivery support tools are available from this
                portal.
              </p>
            </div>
          </div>

          <Link className="support-logout" to="/login">
            <X size={14} />
            Logout
          </Link>
        </div>
      </aside>

      <main className="support-main">
        <header className="support-header">
          <div className="support-header-left">
            <button
              className="support-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={17} />
            </button>

            <div>
              <div className="support-eyebrow">SUPPORT OPERATIONS</div>

              <h1>Support Dashboard</h1>

              <p>
                Monitor shipments, customers and delivery exceptions.
              </p>
            </div>
          </div>

          <div className="support-header-right">
            <div className="support-online">
              <span />
              System Online
            </div>

            <Link
              className="support-notification"
              to="/notifications"
              title="Notifications"
            >
              <Bell size={16} />

              {notificationCount !== null && (
                <i />
              )}
            </Link>

            <div className="support-header-profile">
              <div>{getInitials(user)}</div>

              <div>
                <strong>{getUserName(user)}</strong>
                <span>{user?.role || "SUPPORT AGENT"}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="support-content">
          {error && (
            <div
              style={{
                marginBottom: "17px",
                padding: "12px 14px",
                border: "1px solid rgba(244,63,94,.18)",
                borderRadius: "10px",
                color: "#fda4af",
                background: "rgba(244,63,94,.06)",
                fontSize: "9px",
              }}
            >
              {error}
            </div>
          )}

          <div className="support-stats">
            <div className="support-stat">
              <div className="support-stat-icon orange">
                <PackageCheck size={19} />
              </div>

              <div className="support-stat-content">
                <span>ACTIVE SHIPMENTS</span>
                <strong>
                  {loading ? "..." : activeShipments.length}
                </strong>
                <small>Current active shipments</small>
              </div>
            </div>

            <div className="support-stat">
              <div className="support-stat-icon purple">
                <Truck size={19} />
              </div>

              <div className="support-stat-content">
                <span>IN TRANSIT</span>
                <strong>
                  {loading ? "..." : inTransitShipments.length}
                </strong>
                <small>Currently moving</small>
              </div>
            </div>

            <div className="support-stat">
              <div className="support-stat-icon cyan">
                <CheckCircle2 size={19} />
              </div>

              <div className="support-stat-content">
                <span>DELIVERED</span>
                <strong>
                  {loading ? "..." : deliveredShipments.length}
                </strong>
                <small>Successfully delivered</small>
              </div>
            </div>

            <div className="support-stat">
              <div className="support-stat-icon red">
                <ShieldAlert size={19} />
              </div>

              <div className="support-stat-content">
                <span>EXCEPTIONS</span>
                <strong>
                  {loading ? "..." : exceptionCount}
                </strong>
                <small>Delayed or failed shipments</small>
              </div>
            </div>
          </div>

          <div className="support-search-card">
            <div className="support-search-title">
              <div className="support-search-icon">
                <Search size={19} />
              </div>

              <div>
                <span>SHIPMENT LOOKUP</span>
                <h2>Find a shipment</h2>
                <p>
                  Search using tracking number, route or customer.
                </p>
              </div>
            </div>

            <div className="support-search-box">
              <Search size={14} />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tracking number..."
              />

              {search && (
                <button onClick={() => setSearch("")}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="support-top-grid">
            <section className="support-card">
              <div className="support-card-header">
                <div>
                  <span>SHIPMENT OPERATIONS</span>
                  <h2>Active Shipments</h2>
                </div>

                <Link to="/shipments/active">
                  View all
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div className="support-shipment-list">
                {loading ? (
                  <div className="support-no-results">
                    <Clock3 size={20} />
                    <strong>Loading shipments...</strong>
                    <span>Please wait</span>
                  </div>
                ) : filteredShipments.length === 0 ? (
                  <div className="support-no-results">
                    <PackageCheck size={20} />
                    <strong>No active shipments</strong>
                    <span>
                      {search
                        ? "No shipment matched your search."
                        : "No active shipment records are available."}
                    </span>
                  </div>
                ) : (
                  filteredShipments.map((shipment) => {
                    const shipmentId = getShipmentId(shipment);
                    const status = getStatus(shipment);
                    const tracking = getTrackingNumber(shipment);

                    return (
                      <div
                        className="support-shipment"
                        key={shipmentId || tracking}
                      >
                        <div className="shipment-symbol">
                          {getShipmentIcon(status)}
                        </div>

                        <div className="shipment-details">
                          <strong>{tracking}</strong>

                          <span>{getRoute(shipment)}</span>

                          <small>
                            <Clock3 size={9} />
                            {formatRelativeDate(getDate(shipment))}
                          </small>
                        </div>

                        <div className="shipment-state">
                          <span
                            className={`support-status ${getShipmentStatusClass(
                              status
                            )}`}
                          >
                            {formatStatus(status)}
                          </span>

                          <small>
                            {shipment?.referenceId ||
                              shipment?.referenceNumber ||
                              "Data unavailable"}
                          </small>
                        </div>

                        <Link
                          className="shipment-eye"
                          to={`/tracking?trackingNumber=${encodeURIComponent(
                            tracking
                          )}`}
                          title="View shipment"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="support-card">
              <div className="support-card-header">
                <div>
                  <span>CUSTOMER SUPPORT</span>
                  <h2>Customers</h2>
                </div>

                <Users size={15} />
              </div>

              <div className="customer-list">
                {loading ? (
                  <div className="support-no-results">
                    <Clock3 size={19} />
                    <strong>Loading customers...</strong>
                  </div>
                ) : customers.length === 0 ? (
                  <div className="support-no-results">
                    <Users size={19} />
                    <strong>Customer data unavailable</strong>
                    <span>
                      Customer information is not present in shipment data.
                    </span>
                  </div>
                ) : (
                  customers.map((customer) => (
                    <div
                      className="customer-item"
                      key={`${customer.email}-${customer.name}`}
                    >
                      <div className="customer-avatar">
                        {getCustomerInitials(customer.name)}
                      </div>

                      <div className="customer-data">
                        <strong>{customer.name}</strong>

                        <span>{customer.email}</span>

                        <small>
                          {customer.shipments} shipment
                          {customer.shipments === 1 ? "" : "s"} ·{" "}
                          {customer.active} active
                        </small>
                      </div>

                      <ChevronRight size={13} />
                    </div>
                  ))
                )}
              </div>

              <div className="customer-footer">
                <Users size={11} />
                {uniqueCustomerCount} known customer
                {uniqueCustomerCount === 1 ? "" : "s"} from shipment data
              </div>
            </section>
          </div>

          <div className="support-bottom-grid">
            <section className="support-card">
              <div className="support-card-header">
                <div>
                  <span>EXCEPTIONS</span>
                  <h2>Delivery Exceptions</h2>
                </div>

                <div className="exception-count">
                  {exceptionCount}
                </div>
              </div>

              <div className="exception-summary">
                <div className="exception-box danger">
                  <strong>{exceptionSummary.failed}</strong>
                  <span>Failed Delivery</span>
                </div>

                <div className="exception-box warning">
                  <strong>{exceptionSummary.delayed}</strong>
                  <span>Delayed</span>
                </div>

                <div className="exception-box success">
                  <strong>{exceptionSummary.cancelled}</strong>
                  <span>Cancelled</span>
                </div>
              </div>

              <div className="exception-message">
                <AlertCircle size={14} />

                <span>
                  Exception details are derived from current shipment status.
                  Historical delay reasons are not provided by the backend.
                </span>
              </div>
            </section>

            <section className="support-card">
              <div className="support-card-header">
                <div>
                  <span>ALERTS</span>
                  <h2>Current Alerts</h2>
                </div>

                <Bell size={15} />
              </div>

              <div className="support-alert-list">
                {loading ? (
                  <div className="support-no-results">
                    <Clock3 size={18} />
                    <strong>Loading alerts...</strong>
                  </div>
                ) : recentAlerts.length === 0 ? (
                  <div className="support-no-results">
                    <CheckCircle2 size={18} />
                    <strong>No current delivery exceptions</strong>
                    <span>
                      No delayed or failed shipments are currently available.
                    </span>
                  </div>
                ) : (
                  recentAlerts.map((shipment) => {
                    const status = getStatus(shipment);
                    const tracking = getTrackingNumber(shipment);

                    return (
                      <div
                        className="support-alert"
                        key={getShipmentId(shipment) || tracking}
                      >
                        <div
                          className={`support-alert-icon ${
                            status === "FAILED_DELIVERY"
                              ? "danger"
                              : "warning"
                          }`}
                        >
                          {status === "FAILED_DELIVERY" ? (
                            <ShieldAlert size={15} />
                          ) : (
                            <AlertCircle size={15} />
                          )}
                        </div>

                        <div>
                          <strong>{formatStatus(status)}</strong>

                          <p>
                            {tracking} · {getRoute(shipment)}
                          </p>

                          <small>
                            {formatRelativeDate(getDate(shipment))}
                          </small>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          <section className="support-card quick-card">
            <div className="support-card-header">
              <div>
                <span>SUPPORT TOOLS</span>
                <h2>Quick Actions</h2>
              </div>

              <Zap size={15} />
            </div>

            <div className="support-quick-actions">
              <Link to="/shipments">
                <div className="quick-icon orange">
                  <PackageCheck size={16} />
                </div>

                <div>
                  <strong>Shipments</strong>
                  <span>View shipment records</span>
                </div>

                <ArrowRight size={13} />
              </Link>

              <Link to="/tracking">
                <div className="quick-icon cyan">
                  <MapPin size={16} />
                </div>

                <div>
                  <strong>Live Tracking</strong>
                  <span>Track shipment locations</span>
                </div>

                <ArrowRight size={13} />
              </Link>

              <Link to="/reports">
                <div className="quick-icon purple">
                  <Box size={16} />
                </div>

                <div>
                  <strong>Reports</strong>
                  <span>Review shipment reports</span>
                </div>

                <ArrowRight size={13} />
              </Link>

              <Link to="/notifications">
                <div className="quick-icon red">
                  <Bell size={16} />
                </div>

                <div>
                  <strong>Notifications</strong>
                  <span>View available updates</span>
                </div>

                <ArrowRight size={13} />
              </Link>
            </div>
          </section>

          <div className="support-footer-status">
            <div>
              <span className="support-green-dot" />
              <strong>Support services operational</strong>
              <small>
                Shipment data connected to backend
              </small>
            </div>

            <div className="support-footer-right">
              <span>
                Active routes: {loading ? "..." : activeRouteCount}
              </span>

              <b>
                Customers: {loading ? "..." : uniqueCustomerCount}
              </b>

              <span>
                © 2026 ShipTrack
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SupportDashboard;