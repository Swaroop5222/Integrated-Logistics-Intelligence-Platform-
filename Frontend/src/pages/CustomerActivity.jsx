
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import "./CustomerActivity.css";

const NAV_ITEMS = [
  ["⌂", "Overview", "/dashboard/business"],
  ["＋", "Create Shipment", "/business/create-shipment"],
  ["▣", "Shipment Management", "/business/shipment-management"],
  ["◷", "Shipment History", "/business/shipment-history"],
  ["□", "Package Information", "/business/package-information"],
  ["⌖", "Tracking", "/business/tracking"],
  ["↗", "Delivery Performance", "/business/delivery-performance"],
  ["△", "Delay Analysis", "/business/delay-analysis"],
  ["◈", "Logistics Overview", "/business/logistics-overview"],
  ["♙", "Customer Activity", "/business/customer-activity"],
  ["▤", "Reports & Export", "/business/reports"],
  ["♢", "Notifications", "/business/notifications"],
];

const ACTIVE_STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
];

const DELIVERED_STATUS = "DELIVERED";

function getUserName(user) {
  return (
    user?.fullName ||
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.email ||
    "Business Client"
  );
}

function getInitials(name) {
  if (!name) return "CU";

  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CU"
  );
}

function getCustomerId(shipment) {
  return (
    shipment?.customer?.id ??
    shipment?.customerId ??
    null
  );
}

function getCustomerName(shipment) {
  return (
    shipment?.customer?.fullName ||
    shipment?.customer?.name ||
    shipment?.customerName ||
    "Not assigned"
  );
}

function getShipmentStatus(shipment) {
  return String(shipment?.status || "").toUpperCase();
}

function formatActivityDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isActiveShipment(shipment) {
  return ACTIVE_STATUSES.includes(getShipmentStatus(shipment));
}

function isDeliveredShipment(shipment) {
  return getShipmentStatus(shipment) === DELIVERED_STATUS;
}

export default function CustomerActivity() {
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [currentUser, shipmentResponse] =
          await Promise.all([
            apiRequest("/api/users/me"),
            apiRequest("/api/shipments"),
          ]);

        if (!mounted) return;

        const shipmentList = Array.isArray(shipmentResponse)
          ? shipmentResponse
          : shipmentResponse?.content ||
            shipmentResponse?.shipments ||
            shipmentResponse?.data ||
            [];

        setUser(currentUser);
        setShipments(shipmentList);

        const historyResults = await Promise.allSettled(
          shipmentList
            .filter((shipment) => shipment?.id)
            .map(async (shipment) => {
              const history = await apiRequest(
                `/api/shipments/${shipment.id}/history`
              );
              return (Array.isArray(history) ? history : []).map((event) => ({
                ...event,
                trackingNumber: shipment.trackingNumber,
                receiverName: getCustomerName(shipment),
              }));
            })
        );
        if (!mounted) return;
        const failedHistoryRequests = historyResults.filter(
          (result) =>
            result.status === "rejected" &&
            result.reason?.status !== 404
        );
        if (failedHistoryRequests.length > 0) {
          console.error(
            "Failed to load customer shipment history:",
            failedHistoryRequests.map((result) => result.reason)
          );
          setError(
            "Some shipment activity could not be loaded."
          );
        }
        setStatusHistory(
          historyResults
            .filter((result) => result.status === "fulfilled")
            .flatMap((result) => result.value)
            .sort((a, b) =>
              new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            )
        );
      } catch (err) {
        if (!mounted) return;

        setError(
          err.message ||
            "Unable to load customer activity data."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const userName = getUserName(user);

  /*
   * Build customer groups from the customer information actually
   * available on shipment records.
   */
  const customers = useMemo(() => {
    const grouped = new Map();

    shipments.forEach((shipment) => {
      const customerId = getCustomerId(shipment);

      if (customerId == null) return;

      const key = String(customerId);

      if (!grouped.has(key)) {
        grouped.set(key, {
          id: customerId,
          name: getCustomerName(shipment),
          shipments: [],
        });
      }

      grouped.get(key).shipments.push(shipment);
    });

    return Array.from(grouped.values()).map((customer) => {
      const customerShipments = customer.shipments;

      const active = customerShipments.filter(
        isActiveShipment
      ).length;

      const delivered = customerShipments.filter(
        isDeliveredShipment
      ).length;

      const customerTrackingNumbers = new Set(
        customerShipments.map((shipment) => shipment.trackingNumber)
      );
      const latestActivity = statusHistory.find((event) =>
        customerTrackingNumbers.has(event.trackingNumber)
      )?.createdAt || null;

      /*
       * A customer is considered currently active only when
       * their shipment data contains an active shipment.
       */
      const status = active > 0 ? "Active" : "Inactive";

      return {
        ...customer,
        shipmentCount: customerShipments.length,
        activeCount: active,
        deliveredCount: delivered,
        lastActivity: latestActivity,
        status,
      };
    });
  }, [shipments, statusHistory]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        String(customer.id).toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        customer.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const activeShipments = shipments.filter(
    isActiveShipment
  ).length;

  const recentActivity = useMemo(() => {
    return statusHistory
      .slice(0, 5)
      .map((event) => {
        const status = String(event.status || "").toUpperCase();
        return {
          ...event,
          type: status === DELIVERED_STATUS ? "delivered" : "tracking",
          icon: status === DELIVERED_STATUS ? "✓" : "⌖",
          title: status.replaceAll("_", " "),
        };
      });
  }, [statusHistory]);


  const customerCountLabel = loading
    ? "Loading..."
    : `${totalCustomers} Customer${
        totalCustomers === 1 ? "" : "s"
      }`;

  return (
    <div className="customer-activity-page">
      {/* SIDEBAR */}
      <aside className="business-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>Business Portal</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">BUSINESS</div>

          <nav>
            {NAV_ITEMS.map(([icon, label, path]) => (
              <Link
                key={path}
                to={path}
                className={`business-nav-link ${
                  path === "/business/customer-activity"
                    ? "active"
                    : ""
                }`}
              >
                <span className="nav-icon">
                  {icon}
                </span>

                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="business-status">
            <span className="status-dot" />

            <div>
              <strong>System Operational</strong>
              <small>All services running</small>
            </div>
          </div>

          <Link
            to="/login"
            className="business-logout"
          >
            <span className="nav-icon">↪</span>
            Logout
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="customer-activity-main">
        <div className="activity-topbar">
          <div>
            <span className="breadcrumb">
              Business Client / Customer Activity
            </span>

            <h1>Customer Activity</h1>

            <p>
              Monitor customer shipment activity across your logistics network.
            </p>
          </div>

          <div className="topbar-right">
            <button
              className="topbar-notification"
              type="button"
              title="Notifications"
            >
              ♢
            </button>

            <div className="business-user">
              <div className="user-avatar">
                {getInitials(userName)}
              </div>

              <div>
                <strong>{userName}</strong>
                <small>Operations Manager</small>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 15px",
              borderRadius: "9px",
              background:
                "rgba(255, 111, 99, 0.08)",
              border:
                "1px solid rgba(255, 111, 99, 0.12)",
              color: "#ff6f63",
              fontSize: "10px",
            }}
          >
            {error}
          </div>
        )}

        {/* STAT CARDS */}
        {!error && (
        <section className="activity-stats">
          <div className="activity-stat-card orange">
            <div className="activity-stat-top">
              <span>Total Customers</span>

              <div className="activity-stat-icon">
                ♙
              </div>
            </div>

            <h2>
              {loading ? "..." : totalCustomers}
            </h2>

            <div className="activity-change">
              Customers represented in your shipment records
            </div>
          </div>

          <div className="activity-stat-card purple">
            <div className="activity-stat-top">
              <span>Active Customers</span>

              <div className="activity-stat-icon">
                ●
              </div>
            </div>

            <h2>
              {loading ? "..." : activeCustomers}
            </h2>

            <div className="activity-change">
              Current active shipment activity
            </div>
          </div>

          <div className="activity-stat-card cyan">
            <div className="activity-stat-top">
              <span>Active Shipments</span>

              <div className="activity-stat-icon">
                ▣
              </div>
            </div>

            <h2>
              {loading ? "..." : activeShipments}
            </h2>

            <div className="activity-change">
              Across available customers
            </div>
          </div>

          <div className="activity-stat-card green">
            <div className="activity-stat-top">
              <span>Status Events</span>

              <div className="activity-stat-icon">
                ↗
              </div>
            </div>

            <h2>
              {loading ? "..." : statusHistory.length}
            </h2>

            <div className="activity-change">
              Recorded shipment status history
            </div>
          </div>
        </section>
        )}

        {/* CUSTOMER OVERVIEW + RECENT ACTIVITY */}
        {!error && (
        <section className="activity-grid">
          <div className="activity-card">
            <div className="activity-card-header">
              <div>
                <h3>Customer Overview</h3>

                <p>
                  Shipment counts and latest recorded status activity by customer
                </p>
              </div>

              <span className="customer-count">
                {customerCountLabel}
              </span>
            </div>

            <div className="customer-filters">
              <div className="activity-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search customers..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </div>

            <div className="customer-table-wrapper">
              {filteredCustomers.length === 0 ? (
                <div className="customer-empty">
                  <div>♙</div>

                  <strong>
                    {loading
                      ? "Loading customers..."
                      : "No customer data available"}
                  </strong>

                  <span>
                    {loading
                      ? "Please wait while shipment data is loaded."
                      : "Customer records are derived from available shipment data."}
                  </span>
                </div>
              ) : (
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th>CUSTOMER</th>
                      <th>SHIPMENTS</th>
                      <th>ACTIVE</th>
                      <th>DELIVERED</th>
                      <th>LAST ACTIVITY</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map(
                      (customer) => (
                        <tr key={customer.id}>
                          <td>
                            <div className="customer-name">
                              <div className="customer-avatar">
                                {getInitials(
                                  customer.name
                                )}
                              </div>

                              <div>
                                  <strong>
                                    {customer.name || `Customer #${customer.id}`}
                                  </strong>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="shipment-number">
                              {customer.shipmentCount}
                            </span>
                          </td>

                          <td>
                            <span className="active-number">
                              {customer.activeCount}
                            </span>
                          </td>

                          <td>
                            <span className="delivered-number">
                              {customer.deliveredCount}
                            </span>
                          </td>

                          <td>
                            <span className="last-activity">
                              {formatActivityDate(
                                customer.lastActivity
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`customer-status ${
                                customer.status ===
                                "Active"
                                  ? "active-status"
                                  : "inactive-status"
                              }`}
                            >
                              {customer.status}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="activity-card">
            <div className="activity-card-header">
              <div>
                <h3>Recent Activity</h3>

                <p>Latest shipment activity</p>
              </div>

              <span className="live-badge">
                <span />
                LIVE
              </span>
            </div>

            <div className="recent-activity-list">
              {recentActivity.length === 0 ? (
                <div className="customer-empty">
                  <div>+</div>

                  <strong>
                    {loading
                      ? "Loading activity..."
                      : "No recent activity"}
                  </strong>

                  <span>
                    Activity will appear from available
                    shipment records.
                  </span>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    className="recent-activity-item"
                    key={`${activity.shipmentId}-${activity.id}`}
                  >
                    <div
                      className={`recent-icon ${
                        activity.type === "delivered"
                          ? "delivered-icon"
                          : activity.type ===
                            "tracking"
                          ? "tracking-icon"
                          : "created-icon"
                      }`}
                    >
                      {activity.icon}
                    </div>

                    <div className="recent-content">
                      <strong>
                        {activity.title}
                      </strong>

                      <span>
                        {activity.receiverName || activity.trackingNumber}
                      </span>

                      <p>
                        {activity.remarks || activity.title}
                        {activity.remarks && activity.trackingNumber
                          ? ` · ${activity.trackingNumber}`
                          : ""}
                      </p>

                      <small>
                        {formatActivityDate(activity.createdAt)}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
        )}

        <footer className="customer-activity-footer">
          <span>
            © 2026 ShipTrack Intelligence Platform
          </span>

        </footer>
      </main>
    </div>
  );
}
