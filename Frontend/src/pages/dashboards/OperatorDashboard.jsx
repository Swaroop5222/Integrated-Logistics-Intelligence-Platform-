import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api";
import "./OperatorDashboard.css";

function OperatorDashboard() {
  const [shipments, setShipments] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [operator, setOperator] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ---------------------------------------------------------
   * FETCH DASHBOARD DATA
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const shipmentResponse = await apiRequest("/api/shipments");

        const shipmentData = Array.isArray(shipmentResponse)
          ? shipmentResponse
          : shipmentResponse?.content ||
            shipmentResponse?.data ||
            shipmentResponse?.shipments ||
            [];

        if (!mounted) return;

        setShipments(Array.isArray(shipmentData) ? shipmentData : []);

        /*
         * Get current logged-in operator.
         * If this endpoint is not available in the current backend,
         * the dashboard will still work using shipment data.
         */
        try {
          const operatorResponse = await apiRequest("/api/users/me");

          if (mounted) {
            setOperator(operatorResponse);
          }
        } catch (userError) {
          console.warn(
            "Could not load current operator information:",
            userError
          );
        }

        /*
         * Load route information for the operator's shipments.
         *
         * Routes are loaded individually because the existing backend
         * provides route information per shipment.
         */
        const uniqueShipmentIds = [
          ...new Set(
            shipmentData
              .map((shipment) => shipment?.id)
              .filter((id) => id !== undefined && id !== null)
          ),
        ];

        const routeResults = await Promise.allSettled(
          uniqueShipmentIds.map((shipmentId) =>
            apiRequest(`/api/routes/shipment/${shipmentId}`)
          )
        );

        if (!mounted) return;

        const routeData = [];

        routeResults.forEach((result, index) => {
          if (result.status !== "fulfilled") return;

          const response = result.value;

          const routeList = Array.isArray(response)
            ? response
            : response?.data
              ? Array.isArray(response.data)
                ? response.data
                : [response.data]
              : response
                ? [response]
                : [];

          routeList.forEach((route) => {
            if (route) {
              routeData.push({
                ...route,
                shipmentId: uniqueShipmentIds[index],
              });
            }
          });
        });

        setRoutes(routeData);
      } catch (err) {
        console.error("Operator dashboard loading error:", err);

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load operator dashboard data."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const normalizeStatus = (status) =>
    String(status || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

  const getShipmentTrackingNumber = (shipment) =>
    shipment?.trackingNumber ||
    shipment?.trackingId ||
    shipment?.tracking_number ||
    shipment?.referenceNumber ||
    shipment?.reference ||
    `Shipment #${shipment?.id ?? "N/A"}`;

  const getShipmentStatus = (shipment) => {
    const status = normalizeStatus(shipment?.status);

    switch (status) {
      case "IN_TRANSIT":
        return "In Transit";

      case "PICKED_UP":
        return "Picked Up";

      case "DELIVERED":
        return "Delivered";

      case "CANCELLED":
        return "Cancelled";

      case "CREATED":
        return "Created";

      default:
        return shipment?.status || "Unknown";
    }
  };

  const getStatusClass = (shipment) => {
    const status = normalizeStatus(shipment?.status);

    if (status === "DELIVERED") {
      return "delivery-status";
    }

    if (status === "CANCELLED") {
      return "delayed-status";
    }

    if (status === "IN_TRANSIT" || status === "PICKED_UP") {
      return "transit-status";
    }

    return "transit-status";
  };

  const getAddress = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return (
        value.address ||
        value.city ||
        value.locationName ||
        value.name ||
        ""
      );
    }

    return "";
  };

 const getSenderAddress = (shipment) => {
  return (
    getAddress(shipment?.senderAddress) ||
    getAddress(shipment?.sender?.address) ||
    shipment?.senderLocation ||
    shipment?.senderCity ||
    ""
  );
};

  const getReceiverAddress = (shipment) => {
  return (
    getAddress(shipment?.receiverAddress) ||
    getAddress(shipment?.receiver?.address) ||
    shipment?.receiverLocation ||
    shipment?.receiverCity ||
    ""
  );
};

  const getRouteText = (shipment) => {
    const route =
      shipment?.route ||
      shipment?.routeName ||
      shipment?.route?.name;

    if (typeof route === "string" && route.trim()) {
      return route;
    }

    const sender = getSenderAddress(shipment);
    const receiver = getReceiverAddress(shipment);

    if (sender && receiver) {
      return `${sender} → ${receiver}`;
    }

    if (sender) {
      return `${sender} → Destination`;
    }

    if (receiver) {
      return `Origin → ${receiver}`;
    }

    return "Route information unavailable";
  };

  const getOperatorName = (shipment) => {
    const assignedOperator =
      shipment?.assignedOperator ||
      shipment?.operator;

    return (
      assignedOperator?.name ||
      assignedOperator?.fullName ||
      shipment?.assignedOperatorName ||
      shipment?.operatorName ||
      operator?.name ||
      operator?.fullName ||
      operator?.username ||
      "Logistics Operator"
    );
  };

  const getVehicle = (shipment) => {
    return (
      shipment?.vehicle?.registrationNumber ||
      shipment?.vehicle?.vehicleNumber ||
      shipment?.vehicleNumber ||
      shipment?.vehicleRegistrationNumber ||
      shipment?.vehicle ||
      "Vehicle not assigned"
    );
  };

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /*
   * ---------------------------------------------------------
   * SHIPMENT STATISTICS
   * ---------------------------------------------------------
   */

  const activeShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const status = normalizeStatus(shipment?.status);

      return (
        status !== "DELIVERED" &&
        status !== "CANCELLED"
      );
    });
  }, [shipments]);

  const deliveredCount = useMemo(() => {
    return shipments.filter(
      (shipment) =>
        normalizeStatus(shipment?.status) === "DELIVERED"
    ).length;
  }, [shipments]);

  const inTransitCount = useMemo(() => {
    return shipments.filter((shipment) => {
      const status = normalizeStatus(shipment?.status);

      return (
        status === "IN_TRANSIT" ||
        status === "PICKED_UP"
      );
    }).length;
  }, [shipments]);

  /*
   * The existing backend does not have a DELAYED shipment status.
   * Therefore we do not invent a delayed count.
   */
  const delayedCount = useMemo(() => {
    return shipments.filter((shipment) => {
      const status = normalizeStatus(shipment?.status);

      return (
        status === "DELAYED" ||
        status === "FAILED_DELIVERY"
      );
    }).length;
  }, [shipments]);

  /*
   * Calculate a simple overview percentage from actual
   * shipment statuses instead of using the old dummy 67%.
   */
  const onRoutePercentage = useMemo(() => {
    if (shipments.length === 0) return 0;

    return Math.round(
      (inTransitCount / shipments.length) * 100
    );
  }, [shipments.length, inTransitCount]);

  /*
   * ---------------------------------------------------------
   * ACTIVE ROUTES
   * ---------------------------------------------------------
   */

  const routeSummary = useMemo(() => {
    const grouped = new Map();

    routes.forEach((route) => {
      const shipmentId = route?.shipmentId;

      const shipment = shipments.find(
        (item) => String(item?.id) === String(shipmentId)
      );

      const origin =
        route?.origin ||
        route?.startLocation ||
        route?.source ||
        route?.from ||
        shipment?.senderCity ||
        getSenderAddress(shipment);

      const destination =
        route?.destination ||
        route?.endLocation ||
        route?.target ||
        route?.to ||
        shipment?.receiverCity ||
        getReceiverAddress(shipment);

      const routeName =
        route?.name ||
        route?.routeName ||
        (origin && destination
          ? `${origin} → ${destination}`
          : null);

      if (!routeName) return;

      const key = routeName.toLowerCase();

      if (!grouped.has(key)) {
        grouped.set(key, {
          route: routeName,
          shipments: 0,
          distance:
            route?.distance ||
            route?.distanceKm ||
            route?.totalDistance ||
            null,
          status: "On Route",
        });
      }

      const item = grouped.get(key);

      item.shipments += 1;

      if (!item.distance) {
        item.distance =
          route?.distance ||
          route?.distanceKm ||
          route?.totalDistance ||
          null;
      }

      const shipmentStatus = normalizeStatus(
        shipment?.status
      );

      if (
        shipmentStatus === "DELAYED" ||
        shipmentStatus === "FAILED_DELIVERY"
      ) {
        item.status = "Attention";
      }
    });

    return Array.from(grouped.values()).slice(0, 5);
  }, [routes, shipments]);

  /*
   * ---------------------------------------------------------
   * DISPLAY SHIPMENTS
   * ---------------------------------------------------------
   */

  const displayedShipments = useMemo(() => {
    return activeShipments.slice(0, 5);
  }, [activeShipments]);

  /*
   * ---------------------------------------------------------
   * DYNAMIC OPERATOR NAME
   * ---------------------------------------------------------
   */

  const displayedOperatorName =
    operator?.name ||
    operator?.fullName ||
    operator?.username ||
    "Logistics Operator";

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="operator-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="operator-sidebar">

        <div className="operator-brand">
          <div className="operator-brand-logo">
            S
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>Operator Console</span>
          </div>
        </div>

        <nav className="operator-nav">

          <Link
            to="/dashboard/operator"
            className="operator-nav-link active"
          >
            <span className="operator-nav-icon">⌂</span>
            Dashboard
          </Link>

          <Link
            to="/operator/shipment-tracking"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">▣</span>
            Shipment Tracking
          </Link>

          <Link
            to="/operator/live-delivery"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">◎</span>
            Live Deliveries
          </Link>

          <Link
            to="/operator/driver-tracking"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">♙</span>
            Driver Tracking
          </Link>

          <Link
            to="/operator/routes"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">⌁</span>
            Route Management
          </Link>

          <Link
            to="/operator/eta-delay"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">◷</span>
            ETA & Delays
          </Link>

          <Link
            to="/operator/pod"
            className="operator-nav-link"
          >
            <span className="operator-nav-icon">✓</span>
            Proof of Delivery
          </Link>

        </nav>

        <div className="operator-sidebar-bottom">

          <div className="operator-user">
            <div className="operator-avatar">
              OP
            </div>

            <div>
              <strong>{displayedOperatorName}</strong>
              <span>Operations Team</span>
            </div>
          </div>

          <Link
            to="/login"
            className="operator-logout"
          >
            <span>↪</span>
            Logout
          </Link>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="operator-main">

        {/* Header */}

        <header className="operator-header">

          <div>
            <span className="operator-eyebrow">
              LOGISTICS OPERATIONS
            </span>

            <h1>Operator Dashboard</h1>

            <p>
              Monitor deliveries, drivers, routes and shipment operations
              from one place.
            </p>
          </div>

          <div className="operator-header-actions">

            <div className="operator-live-status">
              <span></span>
              System Live
            </div>

            <button
              className="operator-notification"
              type="button"
              title="Notifications"
            >
              ♢
              <span>0</span>
            </button>

          </div>

        </header>


        {/* Error */}

        {error && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              borderRadius: "8px",
              background: "#fff4f4",
              color: "#b42318",
              border: "1px solid #f3c2c2",
            }}
          >
            {error}
          </div>
        )}


        {/* ================= STAT CARDS ================= */}

        <section className="operator-stats">

          <div className="operator-stat-card orange">

            <div className="operator-stat-icon">
              ▣
            </div>

            <div>
              <span>Active Shipments</span>

              <strong>
                {loading ? "..." : activeShipments.length}
              </strong>

              <small>
                Currently assigned
              </small>
            </div>

          </div>


          <div className="operator-stat-card purple">

            <div className="operator-stat-icon">
              ◎
            </div>

            <div>
              <span>Live Deliveries</span>

              <strong>
                {loading ? "..." : inTransitCount}
              </strong>

              <small>
                In transit / picked up
              </small>
            </div>

          </div>


          <div className="operator-stat-card green">

            <div className="operator-stat-icon">
              ♙
            </div>

            <div>
              <span>Active Shipments</span>

              <strong>
                {loading ? "..." : inTransitCount}
              </strong>

              <small>
                Currently moving
              </small>
            </div>

          </div>


          <div className="operator-stat-card red">

            <div className="operator-stat-icon">
              ⚠
            </div>

            <div>
              <span>Delayed Shipments</span>

              <strong>
                {loading ? "..." : String(delayedCount).padStart(2, "0")}
              </strong>

              <small>
                Based on available status data
              </small>
            </div>

          </div>

        </section>


        {/* ================= TOP GRID ================= */}

        <section className="operator-top-grid">

          {/* Live Delivery Overview */}

          <div className="operator-panel live-panel">

            <div className="operator-panel-header">

              <div>
                <span className="panel-label">
                  LIVE OPERATIONS
                </span>

                <h2>Delivery Overview</h2>
              </div>

              <Link
                to="/operator/live-delivery"
                className="panel-link"
              >
                View all →
              </Link>

            </div>


            <div className="delivery-overview">

              <div className="delivery-ring">

                <div className="delivery-ring-inner">

                  <strong>
                    {loading ? "..." : `${onRoutePercentage}%`}
                  </strong>

                  <span>On Route</span>

                </div>

              </div>


              <div className="delivery-legend">

                <div>
                  <span className="legend-dot delivered"></span>
                  <p>Delivered</p>

                  <strong>
                    {loading ? "..." : deliveredCount}
                  </strong>
                </div>


                <div>
                  <span className="legend-dot transit"></span>
                  <p>In Transit</p>

                  <strong>
                    {loading ? "..." : inTransitCount}
                  </strong>
                </div>


                <div>
                  <span className="legend-dot delayed"></span>
                  <p>Delayed</p>

                  <strong>
                    {loading ? "..." : delayedCount}
                  </strong>
                </div>

              </div>

            </div>

          </div>


          {/* Operational Alerts */}

          <div className="operator-panel alert-panel">

            <div className="operator-panel-header">

              <div>
                <span className="panel-label">
                  ATTENTION REQUIRED
                </span>

                <h2>Operational Alerts</h2>
              </div>

              <span className="alert-count">
                {delayedCount}
              </span>

            </div>


            <div className="alerts-list">

              {delayedCount > 0 ? (

                shipments
                  .filter((shipment) => {
                    const status = normalizeStatus(
                      shipment?.status
                    );

                    return (
                      status === "DELAYED" ||
                      status === "FAILED_DELIVERY"
                    );
                  })
                  .slice(0, 3)
                  .map((shipment) => (

                    <div
                      className="operator-alert red-alert"
                      key={shipment.id}
                    >

                      <div className="alert-icon">
                        !
                      </div>

                      <div>
                        <strong>
                          Shipment Delayed
                        </strong>

                        <p>
                          {getShipmentTrackingNumber(shipment)}
                        </p>
                      </div>

                      <span>
                        Attention
                      </span>

                    </div>

                  ))

              ) : (

                <div className="operator-alert purple-alert">

                  <div className="alert-icon">
                    i
                  </div>

                  <div>
                    <strong>
                      No operational alerts
                    </strong>

                    <p>
                      No delayed or failed shipments are currently
                      reported by the backend.
                    </p>
                  </div>

                  <span>
                    Live
                  </span>

                </div>

              )}

            </div>

          </div>

        </section>


        {/* ================= SHIPMENTS ================= */}

        <section className="operator-panel shipments-panel">

          <div className="operator-panel-header">

            <div>

              <span className="panel-label">
                ACTIVE SHIPMENTS
              </span>

              <h2>Shipment Operations</h2>

              <p>
                Monitor active shipments and delivery progress.
              </p>

            </div>

            <Link
              to="/operator/shipment-tracking"
              className="panel-link"
            >
              View all shipments →
            </Link>

          </div>


          <div className="operator-table-wrapper">

            <table className="operator-table">

              <thead>

                <tr>
                  <th>Shipment</th>
                  <th>Route</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>ETA</th>
                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td colSpan="6">
                      Loading shipments...
                    </td>
                  </tr>

                ) : displayedShipments.length === 0 ? (

                  <tr>
                    <td colSpan="6">
                      No active shipments assigned to this operator.
                    </td>
                  </tr>

                ) : (

                  displayedShipments.map((shipment) => {

                    const status = getShipmentStatus(shipment);

                    return (
                      <tr key={shipment.id}>

                        <td>

                          <div className="shipment-id">

                            <span className="shipment-box">
                              □
                            </span>

                            <div>

                              <strong>
                                {getShipmentTrackingNumber(shipment)}
                              </strong>

                              <small>
                                {getVehicle(shipment)}
                              </small>

                            </div>

                          </div>

                        </td>


                        <td>

                          <span className="route-text">
                            {getRouteText(shipment)}
                          </span>

                        </td>


                        <td>

                          <span className="driver-name">
                            {getOperatorName(shipment)}
                          </span>

                        </td>


                        <td>

                          <span
                            className={`operator-status ${getStatusClass(
                              shipment
                            )}`}
                          >
                            <span></span>
                            {status}
                          </span>

                        </td>


                        <td>

                          <div className="progress-cell">

                            <div className="progress-bar">

                              <span
                                style={{
                                  width:
                                    normalizeStatus(
                                      shipment?.status
                                    ) === "DELIVERED"
                                      ? "100%"
                                      : normalizeStatus(
                                            shipment?.status
                                          ) === "IN_TRANSIT" ||
                                        normalizeStatus(
                                          shipment?.status
                                        ) === "PICKED_UP"
                                      ? "50%"
                                      : "0%",
                                }}
                              ></span>

                            </div>

                            <small>
                              {normalizeStatus(
                                shipment?.status
                              ) === "DELIVERED"
                                ? "100%"
                                : normalizeStatus(
                                      shipment?.status
                                    ) === "IN_TRANSIT" ||
                                  normalizeStatus(
                                    shipment?.status
                                  ) === "PICKED_UP"
                                ? "50%"
                                : "—"}
                            </small>

                          </div>

                        </td>


                        <td>

                          <span className="eta-text">
                            {shipment?.eta
                              ? formatDate(shipment.eta)
                              : "Not available"}
                          </span>

                        </td>

                      </tr>
                    );
                  })

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* ================= BOTTOM GRID ================= */}

        <section className="operator-bottom-grid">

          {/* Routes */}

          <div className="operator-panel routes-panel">

            <div className="operator-panel-header">

              <div>

                <span className="panel-label">
                  ROUTE MANAGEMENT
                </span>

                <h2>Active Routes</h2>

              </div>

              <Link
                to="/operator/routes"
                className="panel-link"
              >
                Manage →
              </Link>

            </div>


            <div className="routes-list">

              {loading ? (

                <div className="route-item">
                  Loading routes...
                </div>

              ) : routeSummary.length === 0 ? (

                <div className="route-item">
                  <div className="route-info">
                    <strong>
                      No route information available
                    </strong>

                    <span>
                      Routes will appear when route data exists
                      for assigned shipments.
                    </span>
                  </div>
                </div>

              ) : (

                routeSummary.map((route, index) => (

                  <div
                    className="route-item"
                    key={`${route.route}-${index}`}
                  >

                    <div className="route-icon">
                      ⌁
                    </div>

                    <div className="route-info">

                      <strong>
                        {route.route}
                      </strong>

                      <span>
                        {route.shipments} shipment
                        {route.shipments !== 1 ? "s" : ""}

                        {route.distance
                          ? ` · ${route.distance} km`
                          : ""}
                      </span>

                    </div>

                    <span
                      className={
                        route.status === "Attention"
                          ? "route-status attention"
                          : "route-status"
                      }
                    >
                      {route.status}
                    </span>

                  </div>

                ))

              )}

            </div>

          </div>


          {/* Fleet */}

          <div className="operator-panel fleet-panel">

            <div className="operator-panel-header">

              <div>

                <span className="panel-label">
                  OPERATOR STATUS
                </span>

                <h2>Operator Overview</h2>

              </div>

              <Link
                to="/operator/driver-tracking"
                className="panel-link"
              >
                Drivers →
              </Link>

            </div>


            <div className="fleet-main">

              <div className="fleet-number">

                <strong>
                  {loading ? "..." : shipments.length}
                </strong>

                <span>
                  Assigned Shipments
                </span>

              </div>


              <div className="fleet-utilization">

                <div className="fleet-progress">

                  <span
                    style={{
                      width: `${onRoutePercentage}%`,
                    }}
                  ></span>

                </div>

                <div className="fleet-progress-info">

                  <span>
                    Shipment Activity
                  </span>

                  <strong>
                    {onRoutePercentage}%
                  </strong>

                </div>

              </div>

            </div>


            <div className="fleet-stats">

              <div>

                <span className="fleet-dot active"></span>

                <p>
                  In Transit
                </p>

                <strong>
                  {inTransitCount}
                </strong>

              </div>


              <div>

                <span className="fleet-dot available"></span>

                <p>
                  Delivered
                </p>

                <strong>
                  {deliveredCount}
                </strong>

              </div>


              <div>

                <span className="fleet-dot maintenance"></span>

                <p>
                  Delayed
                </p>

                <strong>
                  {delayedCount}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* ================= QUICK ACTIONS ================= */}

        <section className="operator-quick-actions">

          <Link
            to="/operator/shipment-tracking"
            className="quick-action"
          >

            <span>▣</span>

            <div>
              <strong>Track Shipment</strong>
              <small>View shipment status</small>
            </div>

            <b>→</b>

          </Link>


          <Link
            to="/operator/driver-tracking"
            className="quick-action"
          >

            <span>♙</span>

            <div>
              <strong>Track Driver</strong>
              <small>Monitor driver activity</small>
            </div>

            <b>→</b>

          </Link>


          <Link
            to="/operator/eta-delay"
            className="quick-action"
          >

            <span>◷</span>

            <div>
              <strong>Check Delays</strong>
              <small>Review ETA risks</small>
            </div>

            <b>→</b>

          </Link>


          <Link
            to="/operator/pod"
            className="quick-action"
          >

            <span>✓</span>

            <div>
              <strong>Proof of Delivery</strong>
              <small>Review completed deliveries</small>
            </div>

            <b>→</b>

          </Link>

        </section>

      </main>

    </div>
  );
}

export default OperatorDashboard;