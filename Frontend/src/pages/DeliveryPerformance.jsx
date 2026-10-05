
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import "./DeliveryPerformance.css";

function DeliveryPerformance() {
  const [shipments, setShipments] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError("");

      const [currentUser, shipmentResponse] =
        await Promise.all([
          apiRequest("/api/users/me"),
          apiRequest("/api/shipments"),
        ]);

      setUser(currentUser);

      const shipmentList = Array.isArray(shipmentResponse)
        ? shipmentResponse
        : shipmentResponse?.content ||
          shipmentResponse?.shipments ||
          shipmentResponse?.data ||
          [];

      setShipments(shipmentList);

      /*
       * Routes are loaded individually because the backend
       * exposes routes through /api/routes/shipment/{id}.
       */
      const routeResults = await Promise.allSettled(
        shipmentList.map(async (shipment) => {
          if (!shipment?.id) return null;

          return apiRequest(
            `/api/routes/shipment/${shipment.id}`
          );
        })
      );
      const failedRouteResults = routeResults.filter(
        (result) =>
          result.status === "rejected" &&
          result.reason?.status !== 404
      );
      if (failedRouteResults.length > 0) {
        throw failedRouteResults[0].reason;
      }

      const validRoutes = routeResults
        .flatMap((result) =>
          result.status === "fulfilled"
            ? Array.isArray(result.value)
              ? result.value
              : [result.value]
            : []
        )
        .filter(Boolean);

      /*
       * Remove duplicate route records.
       */
      const uniqueRoutes = Array.from(
        new Map(
          validRoutes.map((route) => [
            route.id ||
              `${route.shipmentId}-${route.origin}-${route.destination}`,
            route,
          ])
        ).values()
      );

      setRoutes(uniqueRoutes);
    } catch (err) {
      console.error(
        "Failed to load delivery performance:",
        err
      );

      setError(
        err.message ||
          "Unable to load delivery performance."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (shipment) =>
    String(shipment?.status || "").toUpperCase();

  const getRouteKey = (origin, destination) =>
    `${String(origin || "").trim()} → ${String(
      destination || ""
    ).trim()}`;

  /*
   * SUMMARY
   */

  const totalShipments = shipments.length;

  const deliveredShipments = shipments.filter(
    (shipment) => getStatus(shipment) === "DELIVERED"
  ).length;

  const inTransitShipments = shipments.filter((shipment) =>
    [
      "PICKED_UP",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
    ].includes(getStatus(shipment))
  ).length;

  const failedDeliveries = shipments.filter(
    (shipment) => getStatus(shipment) === "FAILED_DELIVERY"
  ).length;

  /*
   * ROUTE ANALYTICS
   *
   * Routes are grouped using the actual origin/destination
   * returned by the backend.
   */
  const routeAnalytics = useMemo(() => {
    const routeMap = new Map();

    shipments.forEach((shipment) => {
      const route = routes.find(
        (item) =>
          Number(item?.shipmentId) === Number(shipment?.id)
      );

      if (!route) return;

      const origin =
        route.origin ||
        shipment.senderCity ||
        shipment.senderAddress;

      const destination =
        route.destination ||
        shipment.receiverCity ||
        shipment.receiverAddress;

      if (!origin && !destination) return;

      const key = getRouteKey(
        origin,
        destination
      );

      if (!routeMap.has(key)) {
        routeMap.set(key, {
          name: key,
          shipments: 0,
          delivered: 0,
          inTransit: 0,
          failedDeliveries: 0,
          distanceKm: null,
          durationMinutes: null,
        });
      }

      const record = routeMap.get(key);

      record.shipments += 1;

      const status = getStatus(shipment);

      if (status === "DELIVERED") {
        record.delivered += 1;
      }

      if (
        [
          "PICKED_UP",
          "IN_TRANSIT",
          "OUT_FOR_DELIVERY",
        ].includes(status)
      ) {
        record.inTransit += 1;
      }

      if (
        status === "FAILED_DELIVERY"
      ) {
        record.failedDeliveries += 1;
      }

      if (
        record.distanceKm === null &&
        route.distanceKm !== undefined &&
        route.distanceKm !== null
      ) {
        record.distanceKm = route.distanceKm;
      }

      if (
        record.durationMinutes === null &&
        route.estimatedDurationMinutes !== undefined &&
        route.estimatedDurationMinutes !== null
      ) {
        record.durationMinutes =
          route.estimatedDurationMinutes;
      }
    });

    /*
     * Include route records even if their shipment is not
     * currently returned in the grouping above.
     */
    routes.forEach((route) => {
      const origin = route.origin;
      const destination = route.destination;

      if (!origin && !destination) return;

      const key = getRouteKey(
        origin,
        destination
      );

      if (!routeMap.has(key)) {
        routeMap.set(key, {
          name: key,
          shipments: 0,
          delivered: 0,
          inTransit: 0,
          distanceKm:
            route.distanceKm ?? null,
          durationMinutes:
            route.estimatedDurationMinutes ?? null,
        });
      }
    });

    return Array.from(routeMap.values());
  }, [shipments, routes]);

  const formatDuration = (minutes) => {
    if (
      minutes === null ||
      minutes === undefined ||
      !Number.isFinite(Number(minutes))
    ) {
      return "";
    }

    const value = Number(minutes);

    const hours = Math.floor(value / 60);
    const mins = Math.round(value % 60);

    if (hours === 0) {
      return `${mins}m`;
    }

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
  };

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Business Client";

  const avatarLetter =
    displayName?.charAt(0)?.toUpperCase() || "B";

  const handleExport = () => {
    const rows = [
      [
        "Route",
        "Shipments",
        "Delivered",
        "Distance (km)",
        "Estimated Duration",
      ],
      ...routeAnalytics.map((route) => [
        route.name,
        route.shipments,
        route.delivered,
        route.distanceKm ?? "",
        formatDuration(route.durationMinutes),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "delivery-performance.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="delivery-performance-page">

      {/* SIDEBAR */}
      <aside className="business-sidebar">

        <div className="business-brand">
          <div className="brand-logo">S</div>

          <div>
            <h2>ShipTrack Pro</h2>
            <span>LOGISTICS INTELLIGENCE</span>
          </div>
        </div>

        <div className="sidebar-section-title">
          BUSINESS CLIENT
        </div>

        <nav className="business-navigation">

          <Link
            to="/dashboard/business"
            className="business-nav-link"
          >
            <span className="nav-icon">⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="business-nav-link"
          >
            <span className="nav-icon">＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="business-nav-link"
          >
            <span className="nav-icon">▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="business-nav-link"
          >
            <span className="nav-icon">◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="business-nav-link"
          >
            <span className="nav-icon">□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="business-nav-link"
          >
            <span className="nav-icon">⌁</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="business-nav-link active"
          >
            <span className="nav-icon">↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-nav-link"
          >
            <span className="nav-icon">!</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-nav-link"
          >
            <span className="nav-icon">◎</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="business-nav-link"
          >
            <span className="nav-icon">♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="business-nav-link"
          >
            <span className="nav-icon">▥</span>
            Reports & Export
          </Link>

        </nav>

        <Link
          to="/login"
          className="business-logout"
          onClick={() => {
            localStorage.removeItem("shiptrackToken");
            localStorage.removeItem("shiptrackUser");
          }}
        >
          <span className="nav-icon">⇥</span>
          Logout
        </Link>

      </aside>

      {/* MAIN */}
      <main className="delivery-performance-main">

        {/* TOP BAR */}
        <header className="business-topbar">

          <div>
            <div className="breadcrumb">
              Business Client / Delivery Performance
            </div>

            <h1>Delivery Performance</h1>

            <p>
              Review shipment status counts and saved route details.
            </p>
          </div>

          <div className="business-user">

            <div>
              <strong>{displayName}</strong>
              <span>Business Client · Account</span>
            </div>

            <div className="user-avatar">
              {avatarLetter}
            </div>

          </div>

        </header>

        {error && <p role="alert">{error}</p>}

        {/* SUMMARY STATS */}
        {!error && (
        <section className="performance-stats">

          <div className="performance-stat orange">

            <div className="stat-top">
              <span>TOTAL SHIPMENTS</span>
              <div className="stat-icon">▣</div>
            </div>

            <strong>
              {loading ? "..." : totalShipments}
            </strong>

            <div className="stat-change">
              <span>
                Shipment records returned by the backend
              </span>
            </div>

          </div>

          <div className="performance-stat purple">

            <div className="stat-top">
              <span>IN TRANSIT</span>
              <div className="stat-icon">↗</div>
            </div>

            <strong>
              {loading ? "..." : inTransitShipments}
            </strong>

            <div className="stat-change">
              <span>
                Picked up, in transit or out for delivery
              </span>
            </div>

          </div>

          <div className="performance-stat green">

            <div className="stat-top">
              <span>DELIVERED</span>
              <div className="stat-icon">✓</div>
            </div>

            <strong>
              {loading
                ? "..."
                : deliveredShipments}
            </strong>

            <div className="stat-change">
              <span>
                Current shipment status
              </span>
            </div>

          </div>

          <div className="performance-stat pink">

            <div className="stat-top">
              <span>FAILED DELIVERIES</span>
              <div className="stat-icon">!</div>
            </div>

            <strong>
              {loading
                ? "..."
                : failedDeliveries}
            </strong>

            <div className="stat-change">
              <span>
                Failed delivery records
              </span>
            </div>

          </div>

        </section>
        )}

        {/* SHIPMENT STATUS */}
        {!error && (
        <section className="performance-grid">
          <div className="performance-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  SHIPMENT STATUS
                </span>

                <h2>Delivery Breakdown</h2>
              </div>

            </div>

            <div className="breakdown-content">
              <div className="breakdown-list">

                <div className="breakdown-item">

                  <span className="legend delivered" />

                  <div>
                    <strong>Delivered</strong>
                    <small>
                      {deliveredShipments} shipments
                    </small>
                  </div>

                </div>

                <div className="breakdown-item">

                  <span className="legend transit" />

                  <div>
                    <strong>In Transit</strong>
                    <small>
                      {inTransitShipments} shipments
                    </small>
                  </div>

                </div>

                <div className="breakdown-item">

                  <span className="legend delayed" />

                  <div>
                    <strong>Failed Deliveries</strong>
                    <small>
                      {failedDeliveries} shipments
                    </small>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>
        )}

        {/* ROUTE ANALYTICS */}
        {!error && (
        <section className="performance-panel route-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                ROUTE ANALYTICS
              </span>

              <h2>Routes</h2>

              <p>
                Backend routes with shipment counts and route estimates.
              </p>
            </div>

            <button
              type="button"
              className="export-button"
              onClick={handleExport}
            >
              ↓ Export Data
            </button>

          </div>

          <div className="route-table-wrapper">

            <table className="route-table">

              <thead>
                <tr>
                  <th>ROUTE</th>
                  <th>SHIPMENTS</th>
                  <th>DELIVERED</th>
                  <th>DISTANCE</th>
                  <th>EST. DURATION</th>
                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td colSpan="5">
                      Loading route analytics...
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  routeAnalytics.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        No route data available.
                      </td>
                    </tr>
                  )}

                {!loading &&
                  routeAnalytics.map((route) => {

                    return (
                      <tr key={route.name}>

                        <td>
                          <strong>
                            {route.name}
                          </strong>
                        </td>

                        <td>
                          {route.shipments}
                        </td>

                        <td>
                          {route.delivered}
                        </td>

                        <td>
                          {route.distanceKm != null
                            ? `${route.distanceKm} km`
                            : ""}
                        </td>

                        <td>
                          {formatDuration(
                            route.durationMinutes
                          )}
                        </td>

                      </tr>
                    );
                  })}

              </tbody>

            </table>

          </div>

        </section>
        )}

        <footer className="business-footer">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>

      </main>
    </div>
  );
}

export default DeliveryPerformance;
