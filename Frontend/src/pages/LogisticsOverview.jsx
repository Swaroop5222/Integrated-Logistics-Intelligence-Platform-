
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

const TERMINAL_STATUSES = [
  "DELIVERED",
  "FAILED_DELIVERY",
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
  return shipment?.senderAddress || "";
}

function getShipmentDestination(shipment) {
  return shipment?.receiverAddress || "";
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
  return getStatus(shipment).replaceAll("_", " ");
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

        const routeResults = await Promise.allSettled(
          shipmentList
            .filter((shipment) => shipment?.id)
            .map(async (shipment) => ({
              shipmentId: shipment.id,
              route: await apiRequest(
                `/api/routes/shipment/${shipment.id}`
              ),
            }))
        );

        const failedRouteResults = routeResults.filter(
          (result) =>
            result.status === "rejected" &&
            result.reason?.status !== 404
        );
        if (failedRouteResults.length > 0) {
          throw failedRouteResults[0].reason;
        }

        if (!mounted) return;

        setUser(currentUser);
        setShipments(shipmentList);
        setRoutes(
          Object.fromEntries(
            routeResults
              .filter((result) => result.status === "fulfilled")
              .map((result) => [
                result.value.shipmentId,
                result.value.route,
              ])
          )
        );
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

  const failedDeliveries = useMemo(
    () =>
      shipments.filter((shipment) =>
        getStatus(shipment) === "FAILED_DELIVERY"
      ),
    [shipments]
  );

  /*
   * These values are derived only from the current shipment data.
   * They are NOT presented as historical on-time metrics.
   */
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
   * Routes shown in the table are actual saved backend routes.
   * We do not fabricate progress or ETA because those are not
   * persisted in the current backend.
   */
  const routeRows = useMemo(() => {
    return activeRoutes.slice(0, 10).map(({ shipment, route }) => ({
      shipment,
      route,
      routeName: getRouteName(route, shipment),
      status: getRouteStatus(shipment),
      duration: getRouteDuration(route),
      distance: route.distanceKm,
    }));
  }, [activeRoutes]);

  const statusCounts = [
    { label: "Created", value: shipments.filter((shipment) => getStatus(shipment) === "CREATED").length },
    { label: "Picked Up", value: shipments.filter((shipment) => getStatus(shipment) === "PICKED_UP").length },
    { label: "In Transit", value: shipments.filter((shipment) => getStatus(shipment) === "IN_TRANSIT" || getStatus(shipment) === "OUT_FOR_DELIVERY").length },
    { label: "Delivered", value: deliveredShipments.length },
    { label: "Failed Delivery", value: failedDeliveries.length },
    { label: "Cancelled", value: shipments.filter((shipment) => getStatus(shipment) === "CANCELLED").length },
  ];

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

            <p>View shipment statuses and saved route information.</p>
          </div>

          <div className="topbar-right">
            <div className="business-user">
              <div className="user-avatar">
                {getInitials(userName)}
              </div>

              <div>
                <strong>{userName}</strong>
                <small>Business Client</small>
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
        {!error && (
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
              Authorized shipment records
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
              <span>Delivered Shipments</span>
              <div className="stat-icon">✓</div>
            </div>

            <h2>{loading ? "..." : deliveredShipments.length}</h2>

            <div className="stat-caption">
              Current delivered status
            </div>
          </div>

          <div className="logistics-stat-card green">
            <div className="stat-top">
              <span>Failed Deliveries</span>
              <div className="stat-icon">!</div>
            </div>

            <h2>{loading ? "..." : failedDeliveries.length}</h2>

            <div className="stat-caption">
              Current failed delivery status
            </div>
          </div>
        </section>
        )}

        {/* SHIPMENT STATUS */}
        {!error && (
        <section className="overview-grid">
          <div className="overview-card">
            <div className="card-header">
              <div>
                <h3>Shipment Status</h3>
                <p>Current status counts from your shipments</p>
              </div>
            </div>
            <div className="status-legend">
              {statusCounts.map((status) => (
                <div className="legend-item" key={status.label}>
                  <div>
                    <strong>{loading ? "..." : status.value}</strong>
                    <span>{status.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ROUTES */}
        {!error && (
        <section className="overview-card routes-card">
          <div className="card-header">
            <div>
              <h3>Saved Shipment Routes</h3>

              <p>
                Routes returned by the backend for active shipments
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
                  <th>TRACKING NUMBER</th>
                  <th>ROUTE</th>
                  <th>DISTANCE</th>
                  <th>ROUTE DURATION</th>
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
                      status,
                      duration,
                      distance,
                    }) => {
                      return (
                        <tr
                          key={`${shipment.id}-${route.id}`}
                        >
                          <td>
                            <strong>{shipment.trackingNumber}</strong>
                          </td>

                          <td>
                            <div className="route-name">
                              <span className="route-icon">⌁</span>
                              <strong>{routeName}</strong>
                            </div>
                          </td>

                          <td>{distance != null ? `${distance} km` : ""}</td>

                          <td>{duration || ""}</td>

                          <td>
                            <span className="route-status">
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
        )}

        <footer className="logistics-footer">
          <span>
            © 2026 ShipTrack Intelligence Platform
          </span>

        </footer>
      </main>
    </div>
  );
}
