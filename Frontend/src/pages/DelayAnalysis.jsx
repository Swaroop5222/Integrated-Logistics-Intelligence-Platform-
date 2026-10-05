
import { useEffect, useState } from "react";
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

export default function DelayAnalysis() {
  const [user, setUser] = useState(null);
  const [etaRecords, setEtaRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [etaError, setEtaError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");
        setEtaError("");

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

        const eligibleShipments = shipmentList.filter(
          (shipment) =>
            shipment?.id &&
            !["DELIVERED", "CANCELLED"].includes(
              String(shipment.status || "").toUpperCase()
            )
        );
        const routeResults = await Promise.allSettled(
          eligibleShipments.map(async (shipment) => ({
            shipment,
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
        const routedShipments = routeResults
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value)
          .filter(({ route }) =>
            route?.destinationLatitude != null &&
            route?.destinationLongitude != null
          );

        const etaResults = await Promise.allSettled(
          routedShipments.map(async ({ shipment, route }) => ({
            shipment,
            route,
            eta: await apiRequest(
              `/api/shipments/${shipment.id}/eta`,
              {
                method: "POST",
                body: JSON.stringify({
                  destination: {
                    latitude: route.destinationLatitude,
                    longitude: route.destinationLongitude,
                  },
                }),
              }
            ),
          }))
        );

        if (!mounted) return;

        const failedEtaResults = etaResults.filter(
          (result) => result.status === "rejected"
        );
        setUser(currentUser);
        setEtaRecords(
          etaResults
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value)
        );
        if (failedRouteResults.length > 0 || failedEtaResults.length > 0) {
          console.error("Failed to load route or ETA data:", [
            ...failedRouteResults.map((result) => result.reason),
            ...failedEtaResults.map((result) => result.reason),
          ]);
          setEtaError(
            [
              failedRouteResults.length > 0 &&
                "Some saved route data could not be loaded.",
              failedEtaResults.length > 0 &&
                "One or more shipment ETA requests failed.",
            ]
              .filter(Boolean)
              .join(" ")
          );
        }
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

  const handleExport = () => {
    const rows = [
      [
        "Tracking Number",
        "Route",
        "Traffic Condition",
        "Traffic Delay (hours)",
        "Weather Delay (hours)",
        "Route Change Delay (hours)",
        "Predicted Delay (hours)",
        "Expected Completion",
        "Delay Alert",
      ],
      ...etaRecords.map(({ shipment, route, eta }) => [
        shipment.trackingNumber || "",
        [route.origin, route.destination].filter(Boolean).join(" → "),
        eta.trafficCondition || "",
        eta.trafficDelayHours ?? "",
        eta.weatherDelayHours ?? "",
        eta.routeChangeDelayHours ?? "",
        eta.predictedDelayHours ?? "",
        eta.expectedCompletionTime || "",
        eta.delayAlert === true ? "Yes" : eta.delayAlert === false ? "No" : "",
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

        {!error && (
        <section className="delay-stats">
          <div className="delay-stat orange">
            <div className="delay-stat-top">
              <span>ETA RESULTS</span>
              <div className="delay-stat-icon">◷</div>
            </div>
            <strong>{loading ? "..." : etaRecords.length}</strong>
            <p>Returned by the ETA API</p>
          </div>
          <div className="delay-stat pink">
            <div className="delay-stat-top">
              <span>DELAY ALERTS</span>
              <div className="delay-stat-icon">!</div>
            </div>
            <strong>
              {loading
                ? "..."
                : etaRecords.filter(({ eta }) => eta.delayAlert === true).length}
            </strong>
            <p>Alerts returned by the ETA API</p>
          </div>
        </section>
        )}

        {etaError && (
          <div role="alert" className="delay-api-error">
            {etaError}
          </div>
        )}

        <section className="delay-panel route-delay-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">
                ETA AND DELAY API
              </span>

              <h2>Shipment ETA and Delay Details</h2>

              <p>
                Traffic, weather, route changes and predicted delay returned for shipments.
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
                  <th>TRACKING NUMBER</th>
                  <th>ROUTE</th>
                  <th>TRAFFIC</th>
                  <th>TRAFFIC DELAY</th>
                  <th>WEATHER DELAY</th>
                  <th>ROUTE CHANGE</th>
                  <th>PREDICTED DELAY</th>
                  <th>EXPECTED COMPLETION</th>
                  <th>ALERT</th>
                </tr>
              </thead>

              <tbody>
                {error || etaError ? (
                  <tr>
                    <td colSpan="9" role="alert">
                      {error || etaError}
                    </td>
                  </tr>
                ) : etaRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      {loading
                        ? "Loading ETA data..."
                        : "No ETA results were returned for shipments with a saved route."}
                    </td>
                  </tr>
                ) : (
                  etaRecords.map(({ shipment, route, eta }) => (
                    <tr key={shipment.id}>
                      <td>{shipment.trackingNumber || ""}</td>
                      <td>
                        {[route.origin, route.destination]
                          .filter(Boolean)
                          .join(" → ")}
                      </td>
                      <td>{eta.trafficCondition || ""}</td>
                      <td>
                        {eta.trafficDelayHours != null
                          ? `${eta.trafficDelayHours} hours`
                          : ""}
                      </td>
                      <td>
                        {eta.weatherDelayHours != null
                          ? `${eta.weatherDelayHours} hours`
                          : ""}
                      </td>
                      <td>
                        {eta.routeChangeDelayHours != null
                          ? `${eta.routeChangeDelayHours} hours`
                          : ""}
                      </td>
                      <td>
                        {eta.predictedDelayHours != null
                          ? `${eta.predictedDelayHours} hours`
                          : ""}
                      </td>
                      <td>
                        {eta.expectedCompletionTime
                          ? new Date(eta.expectedCompletionTime).toLocaleString()
                          : ""}
                      </td>
                      <td>{eta.delayAlert === true ? "Alert" : eta.delayAlert === false ? "No alert" : ""}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
