
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import "./LogisticsOverview.css";

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

const IN_TRANSIT_STATUSES = [
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
];

const DELAYED_STATUSES = [
  "FAILED_DELIVERY",
  "DELAYED",
];

const TERMINAL_STATUSES = [
  "DELIVERED",
  "CANCELLED",
];

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
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "BC"
  );
}

function getStatus(shipment) {
  return String(shipment?.status || "").toUpperCase();
}

function getShipmentOrigin(shipment) {
  return (
    shipment?.senderCity ||
    shipment?.senderAddress ||
    shipment?.origin ||
    shipment?.pickupLocation ||
    shipment?.senderLocation ||
    "Origin unavailable"
  );
}

function getShipmentDestination(shipment) {
  return (
    shipment?.receiverCity ||
    shipment?.receiverAddress ||
    shipment?.destination ||
    shipment?.deliveryLocation ||
    shipment?.receiverLocation ||
    "Destination unavailable"
  );
}

function getRouteName(route, shipment) {
  if (route) {
    const origin =
      route.origin ||
      route.originAddress ||
      route.originLocation ||
      getShipmentOrigin(shipment);

    const destination =
      route.destination ||
      route.destinationAddress ||
      route.destinationLocation ||
      getShipmentDestination(shipment);

    return `${origin} → ${destination}`;
  }

  return `${getShipmentOrigin(shipment)} → ${getShipmentDestination(
    shipment
  )}`;
}

function getRouteStatus(shipment) {
  const status = getStatus(shipment);

  if (DELAYED_STATUSES.includes(status)) {
    return "Delayed";
  }

  if (IN_TRANSIT_STATUSES.includes(status)) {
    return "On Track";
  }

  if (status === "DELIVERED") {
    return "Delivered";
  }

  if (status === "CANCELLED") {
    return "Cancelled";
  }

  if (status === "CREATED") {
    return "Created";
  }

  return status || "Data unavailable";
}

function getRouteDuration(route) {
  if (!route?.estimatedDurationMinutes) {
    return null;
  }

  const minutes = Number(route.estimatedDurationMinutes);

  if (Number.isNaN(minutes)) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${mins}m`;
}

function getOperatorName(shipment, route) {
  return (
    route?.assignedOperatorName ||
    shipment?.assignedOperatorName ||
    shipment?.assignedOperator?.name ||
    shipment?.assignedOperator?.fullName ||
    "Data unavailable"
  );
}

function getOperatorId(shipment, route) {
  return (
    route?.assignedOperatorId ||
    shipment?.assignedOperatorId ||
    shipment?.assignedOperator?.id ||
    null
  );
}

function getShipmentDate(shipment) {
  return (
    shipment?.updatedAt ||
    shipment?.createdAt ||
    shipment?.createdDate ||
    null
  );
}

function formatDate(date) {
  if (!date) return "Data unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Data unavailable";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LogisticsOverview() {
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [routes, setRoutes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [currentUser, shipmentResponse] = await Promise.all([
          apiRequest("/api/users/me"),
          apiRequest("/api/shipments"),
        ]);

        const shipmentList = Array.isArray(shipmentResponse)
          ? shipmentResponse
          : shipmentResponse?.content ||
            shipmentResponse?.shipments ||
            shipmentResponse?.data ||
            [];

        const routeResults = await Promise.all(
          shipmentList.map(async (shipment) => {
            try {
              const route = await apiRequest(
                `/api/routes/shipment/${shipment.id}`
              );

              return [shipment.id, route];
            } catch {
              return [shipment.id, null];
            }
          })
        );

        if (!mounted) return;

        setUser(currentUser);
        setShipments(shipmentList);
        setRoutes(Object.fromEntries(routeResults));
      } catch (err) {
        if (!mounted) return;

        setError(
          err.message || "Unable to load logistics overview."
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

  const totalShipments = shipments.length;

  const deliveredShipments = useMemo(
    () =>
      shipments.filter(
        (shipment) => getStatus(shipment) === "DELIVERED"
      ),
    [shipments]
  );

  const inTransitShipments = useMemo(
    () =>
      shipments.filter((shipment) =>
        IN_TRANSIT_STATUSES.includes(getStatus(shipment))
      ),
    [shipments]
  );

  const delayedShipments = useMemo(
    () =>
      shipments.filter((shipment) =>
        DELAYED_STATUSES.includes(getStatus(shipment))
      ),
    [shipments]
  );

  /*
   * These values are derived only from the current shipment data.
   * They are NOT presented as historical on-time metrics.
   */
  const deliveredPercentage =
    totalShipments > 0
      ? Math.round(
          (deliveredShipments.length / totalShipments) * 100
        )
      : 0;

  const inTransitPercentage =
    totalShipments > 0
      ? Math.round(
          (inTransitShipments.length / totalShipments) * 100
        )
      : 0;

  const delayedPercentage =
    totalShipments > 0
      ? Math.round(
          (delayedShipments.length / totalShipments) * 100
        )
      : 0;

  /*
   * Routes are available only where the backend has a saved route.
   */
  const activeRoutes = useMemo(() => {
    return shipments
      .filter((shipment) => {
        const status = getStatus(shipment);

        return (
          !TERMINAL_STATUSES.includes(status) &&
          routes[shipment.id]
        );
      })
      .map((shipment) => ({
        shipment,
        route: routes[shipment.id],
      }));
  }, [shipments, routes]);

  /*
   * Unique assigned operators.
   * This is an operator count, not a vehicle count.
   */
  const activeOperatorIds = useMemo(() => {
    const ids = new Set();

    activeRoutes.forEach(({ shipment, route }) => {
      const operatorId = getOperatorId(shipment, route);

      if (operatorId != null) {
        ids.add(String(operatorId));
      }
    });

    return ids;
  }, [activeRoutes]);

  /*
   * Hub counts are derived from the actual shipment origin fields.
   * No hardcoded city names are inserted.
   */
  const hubData = useMemo(() => {
    const counts = {};

    shipments.forEach((shipment) => {
      const city =
        shipment?.senderCity ||
        shipment?.originCity ||
        shipment?.pickupCity;

      if (!city) return;

      const cleanCity = String(city).trim();

      if (!cleanCity) return;

      counts[cleanCity] = (counts[cleanCity] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([city, count]) => ({
        city,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [shipments]);

  const maxHubCount =
    hubData.length > 0
      ? Math.max(...hubData.map((hub) => hub.count))
      : 0;

  /*
   * Routes shown in the table are actual saved backend routes.
   * We do not fabricate progress or ETA because those are not
   * persisted in the current backend.
   */
  const routeRows = useMemo(() => {
    return activeRoutes.slice(0, 10).map(({ shipment, route }) => ({
      shipment,
      route,
      routeName: getRouteName(route, shipment),
      operator: getOperatorName(shipment, route),
      status: getRouteStatus(shipment),
      duration: getRouteDuration(route),
    }));
  }, [activeRoutes]);

  const statusSegments = [
    {
      label: "Delivered",
      value: deliveredShipments.length,
      percentage: deliveredPercentage,
      className: "delivered",
    },
    {
      label: "In Transit",
      value: inTransitShipments.length,
      percentage: inTransitPercentage,
      className: "transit",
    },
    {
      label: "Delayed",
      value: delayedShipments.length,
      percentage: delayedPercentage,
      className: "delayed",
    },
  ];

  /*
   * Decorative network lines are kept only as the visual design
   * supplied in the original CSS. They are not claimed to be
   * geographic coordinates.
   */
  const networkNodes = hubData.slice(0, 5);

  return (
    <div className="logistics-page">
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
                  path === "/business/logistics-overview"
                    ? "active"
                    : ""
                }`}
              >
                <span className="nav-icon">{icon}</span>
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

          <Link to="/login" className="business-logout">
            <span className="nav-icon">↪</span>
            Logout
          </Link>
        </div>
      </aside>

      <main className="logistics-main">
        <div className="logistics-topbar">
          <div>
            <span className="breadcrumb">
              Business Client / Logistics Overview
            </span>

            <h1>Logistics Overview</h1>

            <p>
              Monitor your logistics network, fleet and shipment
              operations from one place.
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
              background: "rgba(255, 111, 99, 0.08)",
              border:
                "1px solid rgba(255, 111, 99, 0.12)",
              color: "#ff6f63",
              fontSize: "11px",
            }}
          >
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <section className="logistics-stats">
          <div className="logistics-stat-card orange">
            <div className="stat-top">
              <span>Total Shipments</span>
              <div className="stat-icon">▣</div>
            </div>

            <h2>
              {loading ? "..." : totalShipments}
            </h2>

            <div className="stat-change">
              Data unavailable
            </div>
          </div>

          <div className="logistics-stat-card purple">
            <div className="stat-top">
              <span>Active Routes</span>
              <div className="stat-icon">⌁</div>
            </div>

            <h2>
              {loading ? "..." : activeRoutes.length}
            </h2>

            <div className="stat-change">
              Current routes
            </div>
          </div>

          <div className="logistics-stat-card cyan">
            <div className="stat-top">
              <span>Fleet Utilization</span>
              <div className="stat-icon">▰</div>
            </div>

            <h2>Data unavailable</h2>

            <div className="stat-caption">
              Vehicle fleet data is not available
            </div>
          </div>

          <div className="logistics-stat-card green">
            <div className="stat-top">
              <span>On-Time Delivery</span>
              <div className="stat-icon">✓</div>
            </div>

            <h2>Data unavailable</h2>

            <div className="stat-caption">
              Expected vs actual delivery time unavailable
            </div>
          </div>
        </section>

        {/* NETWORK + STATUS */}
        <section className="overview-grid">
          <div className="overview-card">
            <div className="card-header">
              <div>
                <h3>Logistics Network</h3>

                <p>
                  Current activity across available operational
                  hubs
                </p>
              </div>

              <span className="live-indicator">
                <span />
                LIVE
              </span>
            </div>

            <div className="network-map">
              <div className="route-line line-one" />
              <div className="route-line line-two" />
              <div className="route-line line-three" />
              <div className="route-line line-four" />

              {networkNodes.map((hub, index) => {
                const positions = [
                  "node-hyd",
                  "node-blr",
                  "node-mum",
                  "node-che",
                  "node-del",
                ];

                return (
                  <div
                    key={hub.city}
                    className={`network-node ${
                      positions[index] || ""
                    }`}
                  >
                    <span />

                    <strong>{hub.city}</strong>

                    <small>
                      {hub.count} shipments
                    </small>
                  </div>
                );
              })}

              {networkNodes.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#626a7d",
                    fontSize: "10px",
                  }}
                >
                  Hub location data unavailable
                </div>
              )}
            </div>

            <div className="network-footer">
              <div>
                <span className="network-dot active" />
                Active Hub
              </div>

              <div>
                <span className="network-dot route" />
                Active Route
              </div>

              <div>
                <span className="network-dot delayed" />
                Attention Required
              </div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-header">
              <div>
                <h3>Shipment Status</h3>

                <p>Current shipment distribution</p>
              </div>

              <Link to="/business/shipment-management">
                View all
              </Link>
            </div>

            <div className="status-chart">
              <div
                className="donut"
                style={{
                  background:
                    totalShipments > 0
                      ? `conic-gradient(
                          #42d8a1 0deg ${
                            deliveredPercentage * 3.6
                          }deg,
                          #8a5cff ${
                            deliveredPercentage * 3.6
                          }deg ${
                            (deliveredPercentage +
                              inTransitPercentage) *
                            3.6
                          }deg,
                          #ff7954 ${
                            (deliveredPercentage +
                              inTransitPercentage) *
                            3.6
                          }deg 360deg
                        )`
                      : "#252b38",
                }}
              >
                <div className="donut-center">
                  <strong>{totalShipments}</strong>
                  <span>Total</span>
                </div>
              </div>

              <div className="status-legend">
                {statusSegments.map((segment) => (
                  <div
                    className="legend-item"
                    key={segment.label}
                  >
                    <span
                      className={`legend-color ${segment.className}`}
                    />

                    <div>
                      <strong>{segment.value}</strong>
                      <span>{segment.label}</span>
                    </div>

                    <b>{segment.percentage}%</b>
                  </div>
                ))}
              </div>
            </div>

            <div className="status-summary">
              Current shipment distribution based on backend
              status.
            </div>
          </div>
        </section>

        {/* ROUTES */}
        <section className="overview-card routes-card">
          <div className="card-header">
            <div>
              <h3>Active Routes</h3>

              <p>
                Live shipment movement across available
                operational routes
              </p>
            </div>

            <Link to="/business/tracking">
              Track Shipments →
            </Link>
          </div>

          <div className="routes-table-wrapper">
            <table className="routes-table">
              <thead>
                <tr>
                  <th>ROUTE</th>
                  <th>OPERATOR</th>
                  <th>PROGRESS</th>
                  <th>ETA</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {routeRows.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      {loading
                        ? "Loading route data..."
                        : "No active route data available"}
                    </td>
                  </tr>
                ) : (
                  routeRows.map(
                    ({
                      shipment,
                      route,
                      routeName,
                      operator,
                      status,
                      duration,
                    }) => {
                      const isDelayed =
                        DELAYED_STATUSES.includes(
                          getStatus(shipment)
                        );

                      return (
                        <tr
                          key={`${shipment.id}-${route?.id || "route"}`}
                        >
                          <td>
                            <div className="route-name">
                              <span className="route-icon">
                                ⌁
                              </span>

                              <strong>{routeName}</strong>
                            </div>
                          </td>

                          <td>
                            <span className="vehicle-id">
                              {operator}
                            </span>
                          </td>

                          <td>
                            <div className="route-progress">
                              <div className="progress-track">
                                <div
                                  className={`progress-fill ${
                                    isDelayed
                                      ? "delayed-progress"
                                      : ""
                                  }`}
                                  style={{
                                    width: "0%",
                                  }}
                                />
                              </div>

                              <span>
                                Data unavailable
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="eta">
                              {duration
                                ? `Route: ${duration}`
                                : "Data unavailable"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`route-status ${
                                isDelayed
                                  ? "delayed-status"
                                  : "ontrack-status"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* FLEET + INSIGHTS */}
        <section className="bottom-grid">
          <div className="overview-card">
            <div className="card-header">
              <div>
                <h3>Fleet Overview</h3>

                <p>
                  Vehicle availability and utilization
                </p>
              </div>

              <span className="fleet-total">
                Data unavailable
              </span>
            </div>

            <div className="fleet-content">
              <div
                className="fleet-circle"
                style={{
                  background:
                    "conic-gradient(#35cbd1 0deg 0deg, #252b38 0deg 360deg)",
                }}
              >
                <div>
                  <strong>N/A</strong>
                  <span>Utilized</span>
                </div>
              </div>

              <div className="fleet-stats">
                <div className="fleet-stat">
                  <span className="fleet-indicator active" />

                  <div>
                    <strong>
                      {activeOperatorIds.size || "N/A"}
                    </strong>

                    <span>
                      Active operators
                    </span>
                  </div>
                </div>

                <div className="fleet-stat">
                  <span className="fleet-indicator available" />

                  <div>
                    <strong>Data unavailable</strong>

                    <span>
                      Available vehicles
                    </span>
                  </div>
                </div>

                <div className="fleet-stat">
                  <span className="fleet-indicator maintenance" />

                  <div>
                    <strong>Data unavailable</strong>

                    <span>
                      Maintenance vehicles
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overview-card insights-card">
            <div className="card-header">
              <div>
                <h3>Operational Insights</h3>

                <p>
                  Current observations from your shipment
                  network
                </p>
              </div>
            </div>

            <div className="insight-list">
              <div className="insight-item">
                <div className="insight-icon green-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Current Delivery Status
                  </strong>

                  <p>
                    {totalShipments > 0
                      ? `${deliveredShipments.length} of ${totalShipments} shipments are currently marked as delivered.`
                      : "Shipment data unavailable."}
                  </p>
                </div>

                <span className="insight-arrow">
                  →
                </span>
              </div>

              <div className="insight-item">
                <div className="insight-icon purple-icon">
                  ↗
                </div>

                <div>
                  <strong>Active Operations</strong>

                  <p>
                    {activeRoutes.length > 0
                      ? `${activeRoutes.length} active route(s) are currently associated with non-terminal shipments.`
                      : "No active route data is currently available."}
                  </p>
                </div>

                <span className="insight-arrow">
                  →
                </span>
              </div>

              <div className="insight-item">
                <div className="insight-icon orange-icon">
                  !
                </div>

                <div>
                  <strong>Route Attention</strong>

                  <p>
                    {delayedShipments.length > 0
                      ? `${delayedShipments.length} shipment(s) currently have a delayed or failed-delivery status.`
                      : "No currently delayed shipments were found."}
                  </p>
                </div>

                <span className="insight-arrow">
                  →
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* HUBS */}
        <section className="overview-card hub-card">
          <div className="card-header">
            <div>
              <h3>Operational Hubs</h3>

              <p>
                Shipment activity across your logistics
                network
              </p>
            </div>

            <span className="hub-count">
              {hubData.length} Active Hubs
            </span>
          </div>

          <div className="hub-grid">
            {hubData.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "20px",
                  textAlign: "center",
                  color: "#626a7d",
                  fontSize: "9px",
                }}
              >
                Hub data unavailable from shipment records.
              </div>
            ) : (
              hubData.map((hub) => (
                <div className="hub-item" key={hub.city}>
                  <div className="hub-icon">◉</div>

                  <div className="hub-info">
                    <strong>{hub.city}</strong>
                    <span>Hub</span>
                  </div>

                  <div className="hub-shipments">
                    <strong>{hub.count}</strong>
                    <span>shipments</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="logistics-footer">
          <span>
            © 2026 ShipTrack Intelligence Platform
          </span>

          <span>
            Logistics Network Status: Operational
          </span>
        </footer>
      </main>
    </div>
  );
}

