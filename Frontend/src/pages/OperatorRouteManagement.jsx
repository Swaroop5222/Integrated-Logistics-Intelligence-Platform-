
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./OperatorRouteManagement.css";
import { apiRequest } from "../api";

const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED"];

function formatDistance(distance) {
  if (distance === null || distance === undefined || Number.isNaN(Number(distance))) {
    return "Data unavailable";
  }

  return `${Number(distance).toFixed(0)} km`;
}

function formatDuration(minutes) {
  if (
    minutes === null ||
    minutes === undefined ||
    Number.isNaN(Number(minutes))
  ) {
    return "Data unavailable";
  }

  const totalMinutes = Math.round(Number(minutes));

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

function normalizeStatus(status) {
  return String(status || "").toUpperCase();
}

function getRouteStatus(shipmentStatus) {
  const status = normalizeStatus(shipmentStatus);

  if (status === "FAILED_DELIVERY") {
    return "Attention";
  }

  if (status === "OUT_FOR_DELIVERY" || status === "IN_TRANSIT") {
    return "On Route";
  }

  if (status === "PICKED_UP") {
    return "On Route";
  }

  if (status === "DELIVERED") {
    return "Delivered";
  }

  if (status === "CANCELLED") {
    return "Cancelled";
  }

  return shipmentStatus || "Data unavailable";
}

function getProgress(status) {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "CREATED":
      return 0;
    case "PICKED_UP":
      return 25;
    case "IN_TRANSIT":
      return 50;
    case "OUT_FOR_DELIVERY":
      return 75;
    case "DELIVERED":
      return 100;
    case "FAILED_DELIVERY":
      return 75;
    case "CANCELLED":
      return 0;
    default:
      return null;
  }
}

function OperatorRouteManagement() {
  const [shipments, setShipments] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRouteData() {
      setLoading(true);
      setError("");

      try {
        const shipmentData = await apiRequest("/api/shipments");

        const shipmentList = Array.isArray(shipmentData)
          ? shipmentData
          : shipmentData?.content || shipmentData?.data || [];

        if (cancelled) return;

        setShipments(shipmentList);

        /*
         * Route data is stored against shipments.
         * Fetch the saved route for every shipment.
         */
        const routeResults = await Promise.allSettled(
          shipmentList.map(async (shipment) => {
            try {
              const route = await apiRequest(
                `/api/routes/shipment/${shipment.id}`
              );

              if (!route) return null;

              return {
                ...route,
                shipment,
              };
            } catch {
              return null;
            }
          })
        );

        if (cancelled) return;

        const validRoutes = routeResults
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value)
          .filter(Boolean);

        setRoutes(validRoutes);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load route data.");
          setShipments([]);
          setRoutes([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRouteData();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Only shipments that are actually active are considered
   * active routes.
   *
   * Delivered and cancelled shipments are not counted as
   * active routes.
   */
  const activeRoutes = useMemo(() => {
    return routes.filter((route) => {
      const status = normalizeStatus(route.shipment?.status);

      return !TERMINAL_STATUSES.includes(status);
    });
  }, [routes]);

  const activeShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const status = normalizeStatus(shipment.status);

      return !TERMINAL_STATUSES.includes(status);
    });
  }, [shipments]);

  const attentionRoutes = useMemo(() => {
    return activeRoutes.filter((route) => {
      const status = normalizeStatus(route.shipment?.status);

      return status === "FAILED_DELIVERY";
    });
  }, [activeRoutes]);

  const onTimeRoutes = useMemo(() => {
    return activeRoutes.filter((route) => {
      const status = normalizeStatus(route.shipment?.status);

      return [
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
      ].includes(status);
    });
  }, [activeRoutes]);

  const efficiency = useMemo(() => {
    if (activeRoutes.length === 0) return 0;

    return Math.round(
      (onTimeRoutes.length / activeRoutes.length) * 100
    );
  }, [activeRoutes, onTimeRoutes]);

  const displayRoutes = useMemo(() => {
    return activeRoutes.map((route) => {
      const shipment = route.shipment || {};
      const status = normalizeStatus(shipment.status);

      const operatorName =
        route.assignedOperatorName ||
        shipment.assignedOperator?.fullName ||
        shipment.assignedOperator?.name ||
        "Data unavailable";

      const progress = getProgress(status);

      return {
        id: route.id || shipment.id,
        route:
          route.origin && route.destination
            ? `${route.origin} → ${route.destination}`
            : "Route unavailable",

        shipments: 1,

        distance: formatDistance(route.distanceKm),

        driver: operatorName,

        /*
         * Vehicle information does not exist in the current
         * Route/Shipment backend model.
         */
        vehicle: "Data unavailable",

        status: getRouteStatus(shipment.status),

        /*
         * Current backend does not expose a persisted live ETA
         * for the route.
         */
        eta: formatDuration(route.estimatedDurationMinutes),

        progress,

        shipmentStatus: shipment.status,
        trackingNumber: shipment.trackingNumber,
      };
    });
  }, [activeRoutes]);

  const fastestRoute = useMemo(() => {
    if (displayRoutes.length === 0) return null;

    return displayRoutes.reduce((fastest, current) => {
      const currentDistance = Number(
        current.distance.replace(/[^\d.]/g, "")
      );

      const fastestDistance = Number(
        fastest.distance.replace(/[^\d.]/g, "")
      );

      if (Number.isNaN(currentDistance)) return fastest;
      if (Number.isNaN(fastestDistance)) return current;

      return currentDistance < fastestDistance ? current : fastest;
    });
  }, [displayRoutes]);

  const longestRoute = useMemo(() => {
    if (displayRoutes.length === 0) return null;

    return displayRoutes.reduce((longest, current) => {
      const currentDistance = Number(
        current.distance.replace(/[^\d.]/g, "")
      );

      const longestDistance = Number(
        longest.distance.replace(/[^\d.]/g, "")
      );

      if (Number.isNaN(currentDistance)) return longest;
      if (Number.isNaN(longestDistance)) return current;

      return currentDistance > longestDistance ? current : longest;
    });
  }, [displayRoutes]);

  return (
    <div className="route-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="route-sidebar">

        <div className="route-brand">
          <div className="route-brand-logo">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>Operator Console</span>
          </div>
        </div>

        <nav className="route-nav">

          <Link
            to="/dashboard/operator"
            className="route-nav-link"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/operator/shipment-tracking"
            className="route-nav-link"
          >
            <span>▣</span>
            Shipment Tracking
          </Link>

          <Link
            to="/operator/live-delivery"
            className="route-nav-link"
          >
            <span>◎</span>
            Live Deliveries
          </Link>

          <Link
            to="/operator/driver-tracking"
            className="route-nav-link"
          >
            <span>♙</span>
            Driver Tracking
          </Link>

          <Link
            to="/operator/routes"
            className="route-nav-link active"
          >
            <span>⌁</span>
            Route Management
          </Link>

          <Link
            to="/operator/eta-delay"
            className="route-nav-link"
          >
            <span>◷</span>
            ETA & Delays
          </Link>

          <Link
            to="/operator/pod"
            className="route-nav-link"
          >
            <span>✓</span>
            Proof of Delivery
          </Link>

        </nav>

        <div className="route-sidebar-bottom">

          <div className="route-user">

            <div className="route-avatar">
              OP
            </div>

            <div>
              <strong>Logistics Operator</strong>
              <span>Operations Team</span>
            </div>

          </div>

          <Link
            to="/login"
            className="route-logout"
          >
            <span>↪</span>
            Logout
          </Link>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="route-main">

        {/* Header */}

        <header className="route-header">

          <div>
            <span className="route-eyebrow">
              LOGISTICS OPERATIONS
            </span>

            <h1>Route Management</h1>

            <p>
              Monitor active routes, assigned shipments and route performance.
            </p>
          </div>

          <div className="route-header-actions">

            <div className="route-live-status">
              <span></span>
              System Live
            </div>

            <button className="route-notification">
              ♢
              <span>{attentionRoutes.length}</span>
            </button>

          </div>

        </header>


        {/* ================= STATS ================= */}

        <section className="route-stats">

          <div className="route-stat-card orange">

            <div className="route-stat-icon">
              ⌁
            </div>

            <div>
              <span>Active Routes</span>
              <strong>{activeRoutes.length}</strong>
              <small>Currently operating</small>
            </div>

          </div>


          <div className="route-stat-card purple">

            <div className="route-stat-icon">
              ▣
            </div>

            <div>
              <span>Shipments On Route</span>
              <strong>{activeShipments.length}</strong>
              <small>Across active routes</small>
            </div>

          </div>


          <div className="route-stat-card green">

            <div className="route-stat-icon">
              ✓
            </div>

            <div>
              <span>On-Time Routes</span>
              <strong>{onTimeRoutes.length}</strong>

              <small>
                {activeRoutes.length > 0
                  ? `${efficiency}% of active routes`
                  : "No active routes"}
              </small>

            </div>

          </div>


          <div className="route-stat-card red">

            <div className="route-stat-icon">
              ⚠
            </div>

            <div>
              <span>Attention Needed</span>
              <strong>
                {String(attentionRoutes.length).padStart(2, "0")}
              </strong>
              <small>Requires action</small>
            </div>

          </div>

        </section>


        {/* ================= ROUTE OVERVIEW ================= */}

        <section className="route-top-grid">

          <div className="route-panel route-map-panel">

            <div className="route-panel-header">

              <div>
                <span className="route-panel-label">
                  NETWORK VIEW
                </span>

                <h2>Active Route Network</h2>
              </div>

              <span className="route-live-badge">
                ● Live
              </span>

            </div>

            <div className="route-map">

              <div className="map-grid"></div>

              {displayRoutes.length === 0 ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#69738b",
                    fontSize: "12px",
                  }}
                >
                  No active routes available.
                </div>
              ) : (
                <>
                  <div className="map-node node-hyd">
                    <span></span>
                    <strong>Hyderabad</strong>
                  </div>

                  <div className="map-node node-blr">
                    <span></span>
                    <strong>Bengaluru</strong>
                  </div>

                  <div className="map-node node-mum">
                    <span></span>
                    <strong>Mumbai</strong>
                  </div>

                  <div className="map-node node-pune">
                    <span></span>
                    <strong>Pune</strong>
                  </div>

                  <div className="map-node node-chn">
                    <span></span>
                    <strong>Chennai</strong>
                  </div>

                  <div className="map-node node-del">
                    <span></span>
                    <strong>Delhi</strong>
                  </div>

                  <div className="route-line line-one"></div>
                  <div className="route-line line-two"></div>
                  <div className="route-line line-three"></div>
                  <div className="route-line line-four"></div>
                </>
              )}

            </div>

          </div>


          <div className="route-panel performance-panel">

            <div className="route-panel-header">

              <div>
                <span className="route-panel-label">
                  PERFORMANCE
                </span>

                <h2>Route Efficiency</h2>
              </div>

            </div>

            <div className="efficiency-main">

              <div
                className="efficiency-ring"
                style={{
                  background: `conic-gradient(
                    #36d991 0deg,
                    #36d991 ${efficiency * 3.6}deg,
                    #292e3c ${efficiency * 3.6}deg
                  )`,
                }}
              >

                <div>
                  <strong>{efficiency}%</strong>
                  <span>Efficiency</span>
                </div>

              </div>

            </div>

            <div className="efficiency-list">

              <div>
                <span className="efficiency-dot green-dot"></span>
                <p>On-Time Routes</p>
                <strong>{onTimeRoutes.length}</strong>
              </div>

              <div>
                <span className="efficiency-dot orange-dot"></span>
                <p>At Risk</p>
                <strong>0</strong>
              </div>

              <div>
                <span className="efficiency-dot red-dot"></span>
                <p>Delayed</p>
                <strong>{attentionRoutes.length}</strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= ROUTE TABLE ================= */}

        <section className="route-panel routes-table-panel">

          <div className="route-panel-header">

            <div>
              <span className="route-panel-label">
                ACTIVE ROUTES
              </span>

              <h2>Route Operations</h2>

              <p>
                Monitor routes, drivers, vehicles and shipment progress.
              </p>
            </div>

            <button className="route-action-button">
              + Create Route
            </button>

          </div>


          <div className="route-table-wrapper">

            <table className="route-table">

              <thead>
                <tr>
                  <th>Route</th>
                  <th>Shipments</th>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>ETA</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "35px",
                      }}
                    >
                      Loading route data...
                    </td>
                  </tr>

                ) : error ? (

                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "35px",
                        color: "#ff6678",
                      }}
                    >
                      {error}
                    </td>
                  </tr>

                ) : displayRoutes.length === 0 ? (

                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "35px",
                      }}
                    >
                      No active routes available.
                    </td>
                  </tr>

                ) : (

                  displayRoutes.map((route) => (

                    <tr key={route.id}>

                      <td>
                        <div className="route-name">

                          <span className="route-table-icon">
                            ⌁
                          </span>

                          <div>
                            <strong>{route.route}</strong>

                            <small>
                              {route.id} · {route.distance}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="shipment-count">
                          {route.shipments}
                        </span>
                      </td>

                      <td>
                        <span className="driver-text">
                          {route.driver}
                        </span>
                      </td>

                      <td>
                        <span className="vehicle-text">
                          {route.vehicle}
                        </span>
                      </td>

                      <td>

                        <span
                          className={`route-status ${
                            route.status === "Attention"
                              ? "attention-status"
                              : "onroute-status"
                          }`}
                        >
                          <span></span>
                          {route.status}
                        </span>

                      </td>

                      <td>

                        <div className="route-progress">

                          <div className="route-progress-bar">

                            <span
                              style={{
                                width:
                                  route.progress === null
                                    ? "0%"
                                    : `${route.progress}%`,
                              }}
                            ></span>

                          </div>

                          <small>
                            {route.progress === null
                              ? "Data unavailable"
                              : `${route.progress}%`}
                          </small>

                        </div>

                      </td>

                      <td>
                        <span className="route-eta">
                          {route.eta}
                        </span>
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* ================= BOTTOM CARDS ================= */}

        <section className="route-bottom-grid">

          <div className="route-info-card">

            <div className="info-card-icon">
              ⚡
            </div>

            <div>

              <span>Fastest Route</span>

              <strong>
                {fastestRoute
                  ? fastestRoute.route
                  : "Data unavailable"}
              </strong>

              <small>
                {fastestRoute
                  ? `${fastestRoute.distance} · ${fastestRoute.eta}`
                  : "No active route data"}
              </small>

            </div>

          </div>


          <div className="route-info-card">

            <div className="info-card-icon">
              ◷
            </div>

            <div>

              <span>Longest Route</span>

              <strong>
                {longestRoute
                  ? longestRoute.route
                  : "Data unavailable"}
              </strong>

              <small>
                {longestRoute
                  ? `${longestRoute.distance} · ${longestRoute.eta}`
                  : "No active route data"}
              </small>

            </div>

          </div>


          <div className="route-info-card warning">

            <div className="info-card-icon">
              ⚠
            </div>

            <div>

              <span>Route Attention</span>

              <strong>
                {attentionRoutes.length > 0
                  ? displayRoutes.find(
                      (route) =>
                        route.status === "Attention"
                    )?.route || "Attention required"
                  : "No attention required"}
              </strong>

              <small>
                {attentionRoutes.length > 0
                  ? "Shipment requires attention"
                  : "No active route exceptions"}
              </small>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default OperatorRouteManagement;

