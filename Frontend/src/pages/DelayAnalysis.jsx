
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import "./DelayAnalysis.css";

const NAV_ITEMS = [
  ["⌂", "Overview", "/dashboard/business"],
  ["＋", "Create Shipment", "/business/create-shipment"],
  ["▣", "Shipment Management", "/business/shipment-management"],
  ["◷", "Shipment History", "/business/shipment-history"],
  ["□", "Package Information", "/business/package-information"],
  ["⌁", "Tracking", "/business/tracking"],
  ["↗", "Delivery Performance", "/business/delivery-performance"],
  ["!", "Delay Analysis", "/business/delay-analysis"],
  ["◎", "Logistics Overview", "/business/logistics-overview"],
  ["♙", "Customer Activity", "/business/customer-activity"],
  ["▥", "Reports & Export", "/business/reports"],
];

const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED"];
const DELAYED_STATUSES = ["FAILED_DELIVERY", "DELAYED"];

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
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getStatus(shipment) {
  return String(shipment?.status || "").toUpperCase();
}

function getRouteName(route) {
  if (!route) return "Route unavailable";

  const origin =
    route.origin ||
    route.originAddress ||
    route.originLocation ||
    "Origin unavailable";

  const destination =
    route.destination ||
    route.destinationAddress ||
    route.destinationLocation ||
    "Destination unavailable";

  return `${origin} → ${destination}`;
}

function getRouteDuration(route) {
  if (!route) return null;

  if (route.estimatedDurationMinutes != null) {
    const minutes = Number(route.estimatedDurationMinutes);

    if (!Number.isNaN(minutes)) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);

      if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
      if (hours > 0) return `${hours}h`;
      return `${mins}m`;
    }
  }

  return null;
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getMonthName(date) {
  if (!date) return null;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
  });
}

function getRiskLevel(delayRate) {
  if (delayRate == null) return "Data unavailable";
  if (delayRate >= 20) return "High Risk";
  if (delayRate >= 10) return "Medium";
  return "Low Risk";
}

export default function DelayAnalysis() {
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

        const [currentUser, shipmentData] = await Promise.all([
          apiRequest("/api/users/me"),
          apiRequest("/api/shipments"),
        ]);

        const shipmentList = Array.isArray(shipmentData)
          ? shipmentData
          : shipmentData?.content ||
            shipmentData?.shipments ||
            shipmentData?.data ||
            [];

        const routeEntries = await Promise.all(
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
        setRoutes(Object.fromEntries(routeEntries));
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load delay analysis.");
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

  const delayedShipments = useMemo(
    () =>
      shipments.filter((shipment) =>
        DELAYED_STATUSES.includes(getStatus(shipment))
      ),
    [shipments]
  );

  const totalShipments = shipments.length;

  const delayRate =
    totalShipments > 0
      ? ((delayedShipments.length / totalShipments) * 100).toFixed(1)
      : null;

  /*
   * The current backend does not expose:
   * - actual delay duration
   * - expected delivery time
   * - recovered delay history
   *
   * Therefore these values must not be fabricated.
   */
  const averageDelay = null;
  const recoveredDelays = null;

  /*
   * Current backend does not contain historical monthly
   * delay records. Therefore the six-month chart cannot
   * honestly be populated with fake values.
   */
  const monthlyTrend = useMemo(() => {
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      months.push({
        label: date.toLocaleDateString("en-US", {
          month: "short",
        }),
        value: null,
      });
    }

    return months;
  }, []);

  /*
   * Delay reasons are not currently stored on Shipment or
   * exposed by the backend.
   */
  const delayReasons = [
    {
      name: "Traffic Congestion",
      count: null,
      percentage: null,
      className: "",
    },
    {
      name: "Weather Conditions",
      count: null,
      percentage: null,
      className: "reason-1",
    },
    {
      name: "Warehouse Processing",
      count: null,
      percentage: null,
      className: "reason-2",
    },
    {
      name: "Vehicle Breakdown",
      count: null,
      percentage: null,
      className: "reason-3",
    },
    {
      name: "Address Issues",
      count: null,
      percentage: null,
      className: "reason-4",
    },
    {
      name: "Other",
      count: null,
      percentage: null,
      className: "reason-5",
    },
  ];

  const routePerformance = useMemo(() => {
    const groups = {};

    shipments.forEach((shipment) => {
      const route = routes[shipment.id];

      if (!route) return;

      const routeName = getRouteName(route);

      if (!groups[routeName]) {
        groups[routeName] = {
          routeName,
          total: 0,
          delayed: 0,
          duration: getRouteDuration(route),
        };
      }

      groups[routeName].total += 1;

      if (DELAYED_STATUSES.includes(getStatus(shipment))) {
        groups[routeName].delayed += 1;
      }
    });

    return Object.values(groups)
      .map((item) => {
        const delayRate =
          item.total > 0
            ? (item.delayed / item.total) * 100
            : null;

        return {
          ...item,
          delayRate,
          risk: getRiskLevel(delayRate),
        };
      })
      .sort((a, b) => {
        if (a.delayRate == null) return 1;
        if (b.delayRate == null) return -1;
        return b.delayRate - a.delayRate;
      });
  }, [shipments, routes]);

  const highestRiskRoute = useMemo(() => {
    return routePerformance.find(
      (route) => route.delayRate != null
    );
  }, [routePerformance]);

  const handleExport = () => {
    const rows = [
      [
        "Route",
        "Delayed",
        "Total",
        "Delay Rate",
        "Average Delay",
        "Risk Level",
      ],
      ...routePerformance.map((route) => [
        route.routeName,
        route.delayed,
        route.total,
        route.delayRate == null
          ? "Data unavailable"
          : `${route.delayRate.toFixed(1)}%`,
        "Data unavailable",
        route.risk,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "shiptrack-delay-analysis.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="delay-analysis-page">
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
          {NAV_ITEMS.map(([icon, label, path]) => (
            <Link
              key={path}
              to={path}
              className={`business-nav-link ${
                path === "/business/delay-analysis" ? "active" : ""
              }`}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <Link to="/login" className="business-logout">
          <span className="nav-icon">⇥</span>
          Logout
        </Link>
      </aside>

      <main className="delay-analysis-main">
        <div className="business-topbar">
          <div>
            <div className="breadcrumb">
              Business Client / Delay Analysis
            </div>

            <h1>Delay Analysis</h1>

            <p>
              Identify shipment delays, their causes and routes
              requiring attention.
            </p>
          </div>

          <div className="business-user">
            <div className="user-avatar">
              {getInitials(userName)}
            </div>

            <div>
              <strong>{userName}</strong>
              <span>Account</span>
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
              color: "#ff6f63",
              fontSize: "11px",
            }}
          >
            {error}
          </div>
        )}

        <section className="delay-stats">
          <div className="delay-stat orange">
            <div className="delay-stat-top">
              <span>TOTAL DELAYS</span>
              <div className="delay-stat-icon">!</div>
            </div>

            <strong>
              {loading ? "..." : delayedShipments.length}
            </strong>

            <p>Current delayed shipments</p>
          </div>

          <div className="delay-stat pink">
            <div className="delay-stat-top">
              <span>DELAY RATE</span>
              <div className="delay-stat-icon">%</div>
            </div>

            <strong>
              {delayRate == null ? "Data unavailable" : `${delayRate}%`}
            </strong>

            <p>Of total shipments</p>
          </div>

          <div className="delay-stat purple">
            <div className="delay-stat-top">
              <span>AVG DELAY</span>
              <div className="delay-stat-icon">◷</div>
            </div>

            <strong>
              {averageDelay == null
                ? "Data unavailable"
                : `${averageDelay} hrs`}
            </strong>

            <p>Average additional time</p>
          </div>

          <div className="delay-stat green">
            <div className="delay-stat-top">
              <span>RECOVERED</span>
              <div className="delay-stat-icon">✓</div>
            </div>

            <strong>
              {recoveredDelays == null
                ? "Data unavailable"
                : recoveredDelays}
            </strong>

            <p>Delays resolved this month</p>
          </div>
        </section>

        <section className="delay-analytics-grid">
          <div className="delay-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">
                  DELAY MONITORING
                </span>

                <h2>Delay Trend</h2>

                <p>
                  Number of delayed shipments over the last six
                  months.
                </p>
              </div>

              <span className="panel-badge">
                Last 6 Months
              </span>
            </div>

            <div className="delay-chart">
              <div className="delay-y-axis">
                <span>30</span>
                <span>20</span>
                <span>10</span>
                <span>0</span>
              </div>

              <div className="delay-chart-area">
                <div className="delay-grid">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="delay-columns">
                  {monthlyTrend.map((month) => (
                    <div
                      className="delay-column"
                      key={month.label}
                    >
                      <span className="delay-value">
                        {month.value == null
                          ? "N/A"
                          : month.value}
                      </span>

                      <div
                        className="delay-bar"
                        style={{
                          height:
                            month.value == null
                              ? "18px"
                              : `${Math.max(
                                  18,
                                  (month.value / 30) * 180
                                )}px`,
                          opacity:
                            month.value == null ? 0.25 : 1,
                        }}
                      />

                      <small>{month.label}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="delay-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">
                  ROOT CAUSE
                </span>

                <h2>Delay Reasons</h2>

                <p>
                  Recorded causes of shipment delays.
                </p>
              </div>
            </div>

            <div className="reason-list">
              {delayReasons.map((reason) => (
                <div
                  className="reason-item"
                  key={reason.name}
                >
                  <div className="reason-info">
                    <div className="reason-title">
                      <span
                        className={`reason-dot ${reason.className}`}
                      />

                      <strong>{reason.name}</strong>
                    </div>

                    <span>
                      {reason.count == null
                        ? "Data unavailable"
                        : `${reason.count} shipments`}
                    </span>
                  </div>

                  <div className="reason-progress">
                    <div className="reason-track">
                      <span
                        style={{
                          width:
                            reason.percentage == null
                              ? "0%"
                              : `${reason.percentage}%`,
                        }}
                      />
                    </div>

                    <b>
                      {reason.percentage == null
                        ? "N/A"
                        : `${reason.percentage}%`}
                    </b>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="delay-panel route-delay-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">
                ROUTE PERFORMANCE
              </span>

              <h2>Delayed Shipments by Route</h2>

              <p>
                Routes with current delayed shipments and
                available route information.
              </p>
            </div>

            <button
              className="filter-button"
              onClick={handleExport}
              type="button"
            >
              Export CSV
            </button>
          </div>

          <div className="delay-table-wrapper">
            <table className="delay-table">
              <thead>
                <tr>
                  <th>ROUTE</th>
                  <th>DELAYED</th>
                  <th>TOTAL</th>
                  <th>DELAY RATE</th>
                  <th>AVG DELAY</th>
                  <th>RISK LEVEL</th>
                </tr>
              </thead>

              <tbody>
                {routePerformance.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      {loading
                        ? "Loading route data..."
                        : "No route data available"}
                    </td>
                  </tr>
                ) : (
                  routePerformance.map((route) => (
                    <tr key={route.routeName}>
                      <td>
                        <strong>{route.routeName}</strong>
                      </td>

                      <td>
                        <span className="delayed-count">
                          {route.delayed}
                        </span>
                      </td>

                      <td>{route.total}</td>

                      <td>
                        <span
                          className={
                            route.delayRate != null &&
                            route.delayRate >= 10
                              ? "rate-high"
                              : "rate-normal"
                          }
                        >
                          {route.delayRate == null
                            ? "Data unavailable"
                            : `${route.delayRate.toFixed(1)}%`}
                        </span>
                      </td>

                      <td>
                        Data unavailable
                      </td>

                      <td>
                        <span
                          className={`risk-badge ${
                            route.risk === "High Risk"
                              ? "high"
                              : route.risk === "Medium"
                                ? "medium"
                                : route.risk === "Low Risk"
                                  ? "low"
                                  : ""
                          }`}
                        >
                          {route.risk}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="delay-insights">
          <div className="delay-insight critical">
            <div className="insight-symbol">!</div>

            <div>
              <span>HIGH PRIORITY</span>

              <strong>
                {highestRiskRoute
                  ? highestRiskRoute.routeName
                  : "Data unavailable"}
              </strong>

              <p>
                {highestRiskRoute
                  ? `Current delay rate: ${highestRiskRoute.delayRate.toFixed(
                      1
                    )}%.`
                  : "Route delay information is unavailable."}
              </p>
            </div>
          </div>

          <div className="delay-insight warning">
            <div className="insight-symbol">◷</div>

            <div>
              <span>AVERAGE IMPACT</span>

              <strong>
                {averageDelay == null
                  ? "Data unavailable"
                  : `${averageDelay} hours`}
              </strong>

              <p>
                Average delay duration is not currently
                provided by the backend.
              </p>
            </div>
          </div>

          <div className="delay-insight positive">
            <div className="insight-symbol">✓</div>

            <div>
              <span>IMPROVEMENT</span>

              <strong>
                {recoveredDelays == null
                  ? "Data unavailable"
                  : `${recoveredDelays} delays recovered`}
              </strong>

              <p>
                Recovery history is not currently available
                from the backend.
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

