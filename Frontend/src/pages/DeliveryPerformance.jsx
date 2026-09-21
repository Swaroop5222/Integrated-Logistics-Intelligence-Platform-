
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
      const routeResults = await Promise.all(
        shipmentList.map(async (shipment) => {
          if (!shipment?.id) return null;

          try {
            return await apiRequest(
              `/api/routes/shipment/${shipment.id}`
            );
          } catch {
            return null;
          }
        })
      );

      const validRoutes = routeResults
        .flatMap((route) =>
          Array.isArray(route) ? route : [route]
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

  const getDisplayStatus = (status) => {
    if (!status) return "Data unavailable";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getRouteKey = (origin, destination) =>
    `${String(origin || "").trim()} → ${String(
      destination || ""
    ).trim()}`;

  const getRouteForShipment = (shipment) => {
    return routes.find(
      (route) =>
        Number(route?.shipmentId) === Number(shipment?.id)
    );
  };

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

  const delayedShipments = shipments.filter((shipment) =>
    ["FAILED_DELIVERY", "DELAYED"].includes(
      getStatus(shipment)
    )
  ).length;

  /*
   * There is no persisted on-time flag / expected-vs-actual
   * delivery timestamp in the current shipment response.
   * Therefore an actual on-time rate cannot be calculated
   * without inventing data.
   */
  const onTimeRate = "Data unavailable";

  const averageDeliveryTime = "Data unavailable";

  /*
   * DELIVERY BREAKDOWN
   */

  const deliveredPercentage =
    totalShipments > 0
      ? Math.round(
          (deliveredShipments / totalShipments) * 100
        )
      : 0;

  const inTransitPercentage =
    totalShipments > 0
      ? Math.round(
          (inTransitShipments / totalShipments) * 100
        )
      : 0;

  const delayedPercentage =
    totalShipments > 0
      ? Math.round(
          (delayedShipments / totalShipments) * 100
        )
      : 0;

  /*
   * ROUTE ANALYTICS
   *
   * Routes are grouped using the actual origin/destination
   * returned by the backend.
   */
  const routeAnalytics = useMemo(() => {
    const routeMap = new Map();

    shipments.forEach((shipment) => {
      const route = getRouteForShipment(shipment);

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
          delayed: 0,
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
        ["FAILED_DELIVERY", "DELAYED"].includes(status)
      ) {
        record.delayed += 1;
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
          delayed: 0,
          distanceKm:
            route.distanceKm ?? null,
          durationMinutes:
            route.estimatedDurationMinutes ?? null,
        });
      }
    });

    return Array.from(routeMap.values());
  }, [shipments, routes]);

  /*
   * Route "performance" can only be calculated from
   * actual shipment status counts. An actual on-time rate
   * requires expected/actual delivery timestamps, which the
   * current backend response does not provide.
   */
  const getRoutePerformance = (route) => {
    if (!route.shipments) {
      return null;
    }

    return Math.round(
      (route.delivered / route.shipments) * 100
    );
  };

  const formatDuration = (minutes) => {
    if (
      minutes === null ||
      minutes === undefined ||
      !Number.isFinite(Number(minutes))
    ) {
      return "Data unavailable";
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

  /*
   * Current backend has no monthly historical performance
   * endpoint. Show current data only rather than fake history.
   */
  const monthlyPerformance = [
    { month: "Apr", value: null },
    { month: "May", value: null },
    { month: "Jun", value: null },
    { month: "Jul", value: null },
    { month: "Aug", value: null },
    { month: "Sep", value: null },
  ];

  /*
   * Route insights
   *
   * These are based on the current shipment-delivery
   * percentage, not a fabricated on-time percentage.
   */
  const routeWithBestCurrentDelivery = useMemo(() => {
    if (!routeAnalytics.length) return null;

    return [...routeAnalytics]
      .filter((route) => route.shipments > 0)
      .sort(
        (a, b) =>
          getRoutePerformance(b) -
          getRoutePerformance(a)
      )[0];
  }, [routeAnalytics]);

  const routeNeedingAttention = useMemo(() => {
    if (!routeAnalytics.length) return null;

    return [...routeAnalytics]
      .filter((route) => route.shipments > 0)
      .sort(
        (a, b) =>
          getRoutePerformance(a) -
          getRoutePerformance(b)
      )[0];
  }, [routeAnalytics]);

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
        "Current Delivery Rate",
        "Estimated Duration",
      ],
      ...routeAnalytics.map((route) => [
        route.name,
        route.shipments,
        route.delivered,
        `${getRoutePerformance(route) ?? "Data unavailable"}%`,
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
              Monitor delivery efficiency, on-time
              performance and route-level results.
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

        {/* SUMMARY STATS */}
        <section className="performance-stats">

          <div className="performance-stat orange">

            <div className="stat-top">
              <span>ON-TIME RATE</span>
              <div className="stat-icon">↗</div>
            </div>

            <strong>
              {loading ? "..." : onTimeRate}
            </strong>

            <div className="stat-change">
              <span>
                Historical comparison unavailable
              </span>
            </div>

          </div>

          <div className="performance-stat purple">

            <div className="stat-top">
              <span>AVG DELIVERY TIME</span>
              <div className="stat-icon">◷</div>
            </div>

            <strong>
              {loading
                ? "..."
                : averageDeliveryTime}
            </strong>

            <div className="stat-change">
              <span>
                Backend delivery-time history unavailable
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
              <span>DELAYED</span>
              <div className="stat-icon">!</div>
            </div>

            <strong>
              {loading
                ? "..."
                : delayedShipments}
            </strong>

            <div className="stat-change">
              <span>
                Failed delivery / delayed status
              </span>
            </div>

          </div>

        </section>

        {/* CHART + BREAKDOWN */}
        <section className="performance-grid">

          {/* MONTHLY PERFORMANCE */}
          <div className="performance-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  DELIVERY ANALYTICS
                </span>

                <h2>
                  Monthly On-Time Performance
                </h2>

                <p>
                  Historical monthly on-time data is
                  not currently provided by the backend.
                </p>
              </div>

              <div className="period-selector">
                Last 6 Months ▾
              </div>

            </div>

            <div className="chart-area">

              <div className="chart-y-axis">
                <span>100%</span>
                <span>90%</span>
                <span>80%</span>
                <span>70%</span>
                <span>60%</span>
              </div>

              <div className="chart-body">

                <div className="chart-grid-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="bars">

                  {monthlyPerformance.map(
                    (item) => (
                      <div
                        className="bar-column"
                        key={item.month}
                      >

                        {item.value !== null ? (
                          <>
                            <div className="bar-value">
                              {item.value}%
                            </div>

                            <div
                              className="performance-bar"
                              style={{
                                height: `${Math.max(
                                  35,
                                  item.value - 50
                                )}%`,
                              }}
                            />
                          </>
                        ) : (
                          <div className="bar-value">
                            N/A
                          </div>
                        )}

                        <div className="bar-label">
                          {item.month}
                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>
            </div>

          </div>

          {/* SHIPMENT STATUS */}
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

              <div className="donut-wrapper">

                <div
                  className="donut-chart"
                  style={{
                    background:
                      totalShipments > 0
                        ? `conic-gradient(
                            #42d8a1 0deg ${
                              deliveredPercentage *
                              3.6
                            }deg,
                            #9b7cff ${
                              deliveredPercentage *
                              3.6
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
                        : "#282e3d",
                  }}
                >

                  <div className="donut-center">

                    <strong>
                      {loading
                        ? "..."
                        : totalShipments}
                    </strong>

                    <span>Total</span>

                  </div>

                </div>

              </div>

              <div className="breakdown-list">

                <div className="breakdown-item">

                  <span className="legend delivered" />

                  <div>
                    <strong>Delivered</strong>
                    <small>
                      {deliveredShipments} shipments
                    </small>
                  </div>

                  <b>
                    {deliveredPercentage}%
                  </b>

                </div>

                <div className="breakdown-item">

                  <span className="legend transit" />

                  <div>
                    <strong>In Transit</strong>
                    <small>
                      {inTransitShipments} shipments
                    </small>
                  </div>

                  <b>
                    {inTransitPercentage}%
                  </b>

                </div>

                <div className="breakdown-item">

                  <span className="legend delayed" />

                  <div>
                    <strong>Delayed</strong>
                    <small>
                      {delayedShipments} shipments
                    </small>
                  </div>

                  <b>
                    {delayedPercentage}%
                  </b>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ROUTE ANALYTICS */}
        <section className="performance-panel route-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                ROUTE ANALYTICS
              </span>

              <h2>Performance by Route</h2>

              <p>
                Compare delivery performance across
                available logistics routes.
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
                  <th>CURRENT DELIVERY RATE</th>
                  <th>EST. DURATION</th>
                  <th>PERFORMANCE</th>
                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td colSpan="6">
                      Loading route analytics...
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  routeAnalytics.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        No route data available.
                      </td>
                    </tr>
                  )}

                {!loading &&
                  routeAnalytics.map((route) => {

                    const performance =
                      getRoutePerformance(route);

                    let performanceLabel =
                      "Data unavailable";

                    if (performance !== null) {
                      if (performance >= 90) {
                        performanceLabel =
                          "Good";
                      } else if (
                        performance >= 75
                      ) {
                        performanceLabel =
                          "Needs Attention";
                      } else {
                        performanceLabel =
                          "Needs Attention";
                      }
                    }

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
                          <span className="on-time-value">
                            {performance !== null
                              ? `${performance}%`
                              : "Data unavailable"}
                          </span>
                        </td>

                        <td>
                          {formatDuration(
                            route.durationMinutes
                          )}
                        </td>

                        <td>
                          <div className="mini-performance">

                            <div className="mini-track">
                              <span
                                style={{
                                  width:
                                    performance !== null
                                      ? `${performance}%`
                                      : "0%",
                                }}
                              />
                            </div>

                            <small>
                              {performanceLabel}
                            </small>

                          </div>
                        </td>

                      </tr>
                    );
                  })}

              </tbody>

            </table>

          </div>

        </section>

        {/* INSIGHTS */}
        <section className="insights-grid">

          <div className="insight-card positive-insight">

            <div className="insight-icon">
              ↗
            </div>

            <div>

              <span>
                BEST CURRENT ROUTE
              </span>

              <strong>
                {routeWithBestCurrentDelivery
                  ? routeWithBestCurrentDelivery.name
                  : "Data unavailable"}
              </strong>

              <p>
                {routeWithBestCurrentDelivery
                  ? `${getRoutePerformance(
                      routeWithBestCurrentDelivery
                    )}% of shipments are currently delivered.`
                  : "Route delivery data is unavailable."}
              </p>

            </div>

          </div>

          <div className="insight-card warning-insight">

            <div className="insight-icon">
              !
            </div>

            <div>

              <span>
                ROUTE NEEDING ATTENTION
              </span>

              <strong>
                {routeNeedingAttention
                  ? routeNeedingAttention.name
                  : "Data unavailable"}
              </strong>

              <p>
                {routeNeedingAttention
                  ? `Current delivered shipment rate is ${getRoutePerformance(
                      routeNeedingAttention
                    )}%.`
                  : "Route delivery data is unavailable."}
              </p>

            </div>

          </div>

          <div className="insight-card neutral-insight">

            <div className="insight-icon">
              ◷
            </div>

            <div>

              <span>
                AVERAGE IMPROVEMENT
              </span>

              <strong>
                Data unavailable
              </strong>

              <p>
                Historical delivery-time comparison
                is not provided by the current backend.
              </p>

            </div>

          </div>

        </section>

        <footer className="business-footer">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>

      </main>
    </div>
  );
}

export default DeliveryPerformance;

