
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
    shipment?.customer?.id ||
    shipment?.customerId ||
    shipment?.assignedCustomerId ||
    shipment?.receiverEmail ||
    shipment?.receiverName ||
    shipment?.receiverPhone ||
    shipment?.id
  );
}

function getCustomerName(shipment) {
  return (
    shipment?.customer?.fullName ||
    shipment?.customer?.name ||
    shipment?.customerName ||
    shipment?.receiverName ||
    shipment?.receiver?.name ||
    shipment?.receiver ||
    "Customer data unavailable"
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

function getShipmentStatus(shipment) {
  return String(shipment?.status || "").toUpperCase();
}

function getActivityDate(shipment) {
  return (
    shipment?.updatedAt ||
    shipment?.createdAt ||
    shipment?.updatedDate ||
    shipment?.createdDate ||
    null
  );
}

function formatActivityDate(value) {
  if (!value) return "Data unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(value) {
  if (!value) return "Data unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  const diff = Date.now() - date.getTime();

  if (diff < 0) {
    return "Just now";
  }

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return formatActivityDate(value);
}

function getTrackingNumber(shipment) {
  return (
    shipment?.trackingNumber ||
    shipment?.trackingId ||
    shipment?.referenceId ||
    `Shipment #${shipment?.id ?? "unavailable"}`
  );
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
          email: getCustomerEmail(shipment),
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

      const latestShipment = [...customerShipments].sort(
        (a, b) => {
          const dateA = new Date(
            getActivityDate(a) || 0
          ).getTime();

          const dateB = new Date(
            getActivityDate(b) || 0
          ).getTime();

          return dateB - dateA;
        }
      )[0];

      const latestActivity =
        getActivityDate(latestShipment);

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
  }, [shipments]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        (customer.email || "")
          .toLowerCase()
          .includes(query);

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

  /*
   * There is no customer engagement percentage field in the
   * current backend. Therefore it is intentionally not
   * calculated from arbitrary assumptions.
   */
  const engagementPercentage = null;

  /*
   * Recent activity is derived from actual shipment records.
   * The backend does not provide "tracking viewed" events,
   * so those events are not fabricated.
   */
  const recentActivity = useMemo(() => {
    return [...shipments]
      .sort((a, b) => {
        const dateA = new Date(
          getActivityDate(a) || 0
        ).getTime();

        const dateB = new Date(
          getActivityDate(b) || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5)
      .map((shipment) => {
        const status = getShipmentStatus(shipment);

        let type = "created";
        let icon = "+";
        let title = "Shipment Created";

        if (status === DELIVERED_STATUS) {
          type = "delivered";
          icon = "✓";
          title = "Shipment Delivered";
        } else if (ACTIVE_STATUSES.includes(status)) {
          type = "tracking";
          icon = "⌖";
          title = "Shipment Updated";
        }

        return {
          shipment,
          type,
          icon,
          title,
          customer: getCustomerName(shipment),
          tracking: getTrackingNumber(shipment),
          date: getActivityDate(shipment),
        };
      });
  }, [shipments]);

  /*
   * Engagement metrics are only shown when supported by the
   * backend. No percentages are invented.
   */
  const engagementMetrics = [
    {
      title: "Tracking Activity",
      description:
        "Customers checking shipment status",
      value: null,
      className: "orange-engagement",
      icon: "⌖",
    },
    {
      title: "Shipment Creation",
      description:
        "Customers creating new shipments",
      value: null,
      className: "purple-engagement",
      icon: "▣",
    },
    {
      title: "Delivery Confirmation",
      description:
        "Customers viewing completed deliveries",
      value: null,
      className: "green-engagement",
      icon: "✓",
    },
  ];

  const inactiveCustomers =
    totalCustomers - activeCustomers;

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
              Monitor customer shipment activity and
              engagement across your logistics network.
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
              Data unavailable
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
              <span>Customer Engagement</span>

              <div className="activity-stat-icon">
                ↗
              </div>
            </div>

            <h2>
              {engagementPercentage == null
                ? "Data unavailable"
                : `${engagementPercentage}%`}
            </h2>

            <div className="activity-change">
              Backend engagement metric unavailable
            </div>
          </div>
        </section>

        {/* CUSTOMER OVERVIEW + RECENT ACTIVITY */}
        <section className="activity-grid">
          <div className="activity-card">
            <div className="activity-card-header">
              <div>
                <h3>Customer Overview</h3>

                <p>
                  Shipment activity and engagement by
                  customer
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
                                  {customer.name}
                                </strong>

                                <span>
                                  {customer.email ||
                                    "Email unavailable"}
                                </span>
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
                    key={activity.shipment.id}
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
                        {activity.customer}
                      </span>

                      <p>
                        {activity.type ===
                        "delivered"
                          ? `Shipment ${activity.tracking} marked as delivered.`
                          : activity.type ===
                            "tracking"
                          ? `Shipment ${activity.tracking} currently has active status.`
                          : `Shipment ${activity.tracking} was created.`
                        }
                      </p>

                      <small>
                        {formatRelativeTime(
                          activity.date
                        )}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ENGAGEMENT */}
        <section className="activity-card engagement-card">
          <div className="activity-card-header">
            <div>
              <h3>Customer Engagement</h3>

              <p>
                Understand how customers interact with
                your logistics platform.
              </p>
            </div>
          </div>

          <div className="engagement-grid">
            {engagementMetrics.map((metric) => (
              <div
                className="engagement-item"
                key={metric.title}
              >
                <div
                  className={`engagement-icon ${metric.className}`}
                >
                  {metric.icon}
                </div>

                <div className="engagement-info">
                  <strong>{metric.title}</strong>

                  <p>{metric.description}</p>

                  <div className="engagement-progress">
                    <div
                      style={{
                        width:
                          metric.value == null
                            ? "0%"
                            : `${metric.value}%`,
                      }}
                    />
                  </div>

                  <span>
                    {metric.value == null
                      ? "Data unavailable"
                      : `${metric.value}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INSIGHTS */}
        <section className="activity-card customer-insights">
          <div className="activity-card-header">
            <div>
              <h3>Customer Insights</h3>

              <p>
                Useful observations from current shipment
                data
              </p>
            </div>
          </div>

          <div className="insights-grid">
            <div className="customer-insight">
              <div className="customer-insight-icon green-insight">
                ↑
              </div>

              <div>
                <strong>
                  Customer activity
                </strong>

                <p>
                  {totalCustomers > 0
                    ? `${activeCustomers} of ${totalCustomers} customers currently have active shipment activity.`
                    : "Customer activity data unavailable."}
                </p>
              </div>
            </div>

            <div className="customer-insight">
              <div className="customer-insight-icon purple-insight">
                ●
              </div>

              <div>
                <strong>
                  Active customers
                </strong>

                <p>
                  {activeCustomers > 0
                    ? `${activeCustomers} customer${
                        activeCustomers === 1
                          ? ""
                          : "s"
                      } currently have ongoing shipment activity.`
                    : "No active customer shipment activity is currently available."}
                </p>
              </div>
            </div>

            <div className="customer-insight">
              <div className="customer-insight-icon orange-insight">
                !
              </div>

              <div>
                <strong>
                  Inactive customers
                </strong>

                <p>
                  {totalCustomers > 0
                    ? `${inactiveCustomers} customer${
                        inactiveCustomers === 1
                          ? ""
                          : "s"
                      } currently have no active shipment.`
                    : "Customer activity data unavailable."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="customer-activity-footer">
          <span>
            © 2026 ShipTrack Intelligence Platform
          </span>

          <span>
            Customer Activity Monitoring: Operational
          </span>
        </footer>
      </main>
    </div>
  );
}

