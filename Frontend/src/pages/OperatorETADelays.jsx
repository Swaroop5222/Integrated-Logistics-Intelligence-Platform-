import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import "./OperatorETADelays.css";

const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED"];

const STATUS_PROGRESS = {
  CREATED: 0,
  PICKED_UP: 25,
  IN_TRANSIT: 50,
  OUT_FOR_DELIVERY: 75,
  DELIVERED: 100,
  FAILED_DELIVERY: 0,
  CANCELLED: 0,
};

function formatDateTime(value) {
  if (!value) return "ETA unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "ETA unavailable";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + `, ${date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function formatDelay(hours) {
  const value = Number(hours);

  if (!Number.isFinite(value) || value <= 0) {
    return "0m";
  }

  const totalMinutes = Math.round(value * 60);
  const days = Math.floor(totalMinutes / 1440);
  const hoursPart = Math.floor((totalMinutes % 1440) / 60);
  const minutesPart = totalMinutes % 60;

  const parts = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hoursPart > 0) {
    parts.push(`${hoursPart}h`);
  }

  if (minutesPart > 0 || parts.length === 0) {
    parts.push(`${minutesPart}m`);
  }

  return `+${parts.join(" ")}`;
}

function getRisk(delayHours) {
  const delay = Number(delayHours);

  if (!Number.isFinite(delay) || delay <= 0) {
    return "low";
  }

  if (delay >= 1.5) {
    return "high";
  }

  if (delay >= 0.5) {
    return "medium";
  }

  return "low";
}

function getReason(eta) {
  if (!eta) {
    return "Delay";
  }

  if (Number(eta.weatherDelayHours) > 0) {
    return "Weather";
  }

  if (Number(eta.routeChangeDelayHours) > 0) {
    return "Route Change";
  }

  switch (eta.trafficCondition) {
    case "SEVERE":
      return "Severe Traffic";
    case "HEAVY":
      return "Heavy Traffic";
    case "MODERATE":
      return "Traffic";
    case "LIGHT":
      return "Light Traffic";
    case "CLEAR":
      return "No Traffic Delay";
    default:
      return "Traffic";
  }
}

function getProgress(status) {
  return STATUS_PROGRESS[status] ?? 0;
}

function getRoute(route, shipment) {
  return {
    origin:
      route?.origin ||
      shipment?.senderAddress ||
      shipment?.senderCity ||
      "Origin unavailable",

    destination:
      route?.destination ||
      shipment?.receiverAddress ||
      shipment?.receiverCity ||
      "Destination unavailable",
  };
}

function getDateKey(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getLastSevenDays() {
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    result.push({
      key: getDateKey(date),
      label: date.toLocaleDateString([], {
        weekday: "short",
      }),
      count: 0,
    });
  }

  return result;
}

function OperatorETADelays() {
  const [operator, setOperator] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [etaRecords, setEtaRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [userData, shipmentData] = await Promise.all([
          apiRequest("/api/users/me"),
          apiRequest("/api/shipments"),
        ]);

        if (cancelled) return;

        const shipmentList = Array.isArray(shipmentData)
          ? shipmentData
          : [];

        setOperator(userData || null);
        setShipments(shipmentList);

        /*
         * IMPORTANT:
         *
         * DELIVERED and CANCELLED shipments are not current ETA
         * shipments. They must never be sent to the ETA endpoint.
         */
        const activeShipments = shipmentList.filter(
          (shipment) =>
            !TERMINAL_STATUSES.includes(shipment.status)
        );

        const records = await Promise.all(
          activeShipments.map(async (shipment) => {
            try {
              /*
               * Get the existing saved route.
               *
               * We do NOT call the route calculation endpoint because
               * that endpoint is not intended for Logistics Operators.
               */
              const route = await apiRequest(
                `/api/routes/shipment/${shipment.id}`
              );

              if (
                route?.destinationLatitude == null ||
                route?.destinationLongitude == null
              ) {
                return {
                  shipment,
                  route,
                  eta: null,
                  etaAvailable: false,
                };
              }

              /*
               * Existing backend ETA API.
               *
               * Current backend expects destination and calculates
               * the ETA using the shipment's current live location.
               */
              const eta = await apiRequest(
                `/api/shipments/${shipment.id}/eta`,
                {
                  method: "POST",
                  body: JSON.stringify({
                    destination: {
                      latitude: Number(
                        route.destinationLatitude
                      ),
                      longitude: Number(
                        route.destinationLongitude
                      ),
                    },
                    trafficCondition: "MODERATE",
                    weatherDelayHours: 0,
                    routeChangeDelayHours: 0,
                  }),
                }
              );

              return {
                shipment,
                route,
                eta,
                etaAvailable: true,
              };
            } catch (err) {
              /*
               * No fake ETA is created when route/location/ETA data
               * is unavailable.
               */
              return {
                shipment,
                route: null,
                eta: null,
                etaAvailable: false,
              };
            }
          })
        );

        if (!cancelled) {
          setEtaRecords(records);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load ETA and delay information."
          );
          setShipments([]);
          setEtaRecords([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Only shipments that are currently active.
   */
  const activeShipments = useMemo(
    () =>
      shipments.filter(
        (shipment) =>
          !TERMINAL_STATUSES.includes(shipment.status)
      ),
    [shipments]
  );

  /*
   * ETA calculations with a positive predicted delay.
   */
  const etaDelayRecords = useMemo(
    () =>
      etaRecords.filter((record) => {
        if (!record.etaAvailable || !record.eta) {
          return false;
        }

        const delay = Number(
          record.eta.predictedDelayHours
        );

        return Number.isFinite(delay) && delay > 0;
      }),
    [etaRecords]
  );

  /*
   * Shipments whose backend status is FAILED_DELIVERY are
   * genuine shipment exceptions.
   */
  const failedDeliveryRecords = useMemo(
    () =>
      etaRecords.filter(
        (record) =>
          record.shipment?.status === "FAILED_DELIVERY"
      ),
    [etaRecords]
  );

  /*
   * Combine ETA delays and failed deliveries without duplicates.
   */
  const delayedRecords = useMemo(() => {
    const map = new Map();

    etaDelayRecords.forEach((record) => {
      map.set(record.shipment.id, record);
    });

    failedDeliveryRecords.forEach((record) => {
      if (!map.has(record.shipment.id)) {
        map.set(record.shipment.id, record);
      }
    });

    return Array.from(map.values());
  }, [etaDelayRecords, failedDeliveryRecords]);

  /*
   * Positive delay below 1.5 hours = At Risk.
   */
  const atRiskRecords = useMemo(
    () =>
      etaDelayRecords.filter((record) => {
        const delay = Number(
          record.eta?.predictedDelayHours
        );

        return delay > 0 && delay < 1.5;
      }),
    [etaDelayRecords]
  );

  /*
   * Positive delay >= 1.5 hours = Delayed.
   */
  const highRiskRecords = useMemo(
    () =>
      etaDelayRecords.filter((record) => {
        const delay = Number(
          record.eta?.predictedDelayHours
        );

        return delay >= 1.5;
      }),
    [etaDelayRecords]
  );

  const delayedCount =
    highRiskRecords.length + failedDeliveryRecords.length;

  /*
   * Current ETA records with no delay.
   */
  const onScheduleCount = useMemo(
    () =>
      etaRecords.filter((record) => {
        if (!record.etaAvailable || !record.eta) {
          return false;
        }

        const delay = Number(
          record.eta.predictedDelayHours
        );

        return Number.isFinite(delay) && delay <= 0;
      }).length,
    [etaRecords]
  );

  const forecastTotal =
    onScheduleCount +
    atRiskRecords.length +
    delayedCount;

  const onTimePercentage =
    forecastTotal > 0
      ? Math.round(
          (onScheduleCount / forecastTotal) * 100
        )
      : 0;

  /*
   * Average delay only uses real ETA delay values.
   */
  const averageDelay = useMemo(() => {
    const values = etaDelayRecords
      .map((record) =>
        Number(record.eta?.predictedDelayHours)
      )
      .filter(
        (value) =>
          Number.isFinite(value) && value > 0
      );

    if (values.length === 0) {
      return 0;
    }

    return (
      values.reduce((sum, value) => sum + value, 0) /
      values.length
    );
  }, [etaDelayRecords]);

  /*
   * Delay reason analysis.
   */
  const delayReasons = useMemo(() => {
    const counts = {};

    delayedRecords.forEach((record) => {
      const reason =
        record.shipment?.status === "FAILED_DELIVERY"
          ? "Failed Delivery"
          : getReason(record.eta);

      counts[reason] = (counts[reason] || 0) + 1;
    });

    const total = delayedRecords.length;

    return Object.entries(counts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage:
          total > 0
            ? Math.round((count / total) * 100)
            : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [delayedRecords]);

  /*
   * Seven-day current exception trend.
   *
   * This uses shipment updatedAt/createdAt only because the backend
   * does not currently store historical ETA exception events.
   */
  const trendData = useMemo(() => {
    const days = getLastSevenDays();
    const map = new Map(
      days.map((day) => [day.key, day])
    );

    delayedRecords.forEach((record) => {
      const key = getDateKey(
        record.shipment?.updatedAt ||
          record.shipment?.createdAt
      );

      if (key && map.has(key)) {
        map.get(key).count += 1;
      }
    });

    return days;
  }, [delayedRecords]);

  const maxTrend = Math.max(
    ...trendData.map((item) => item.count),
    0
  );

  const delayRate =
    activeShipments.length > 0
      ? (delayedRecords.length /
          activeShipments.length) *
        100
      : 0;

  /*
   * Highest current delay.
   */
  const highestDelayRecord = useMemo(
    () =>
      [...delayedRecords].sort((a, b) => {
        const delayA = Number(
          a.eta?.predictedDelayHours
        );
        const delayB = Number(
          b.eta?.predictedDelayHours
        );

        return (
          (Number.isFinite(delayB) ? delayB : -1) -
          (Number.isFinite(delayA) ? delayA : -1)
        );
      })[0] || null,
    [delayedRecords]
  );

  const highestRoute = highestDelayRecord
    ? getRoute(
        highestDelayRecord.route,
        highestDelayRecord.shipment
      )
    : null;

  const initials =
    operator?.name?.charAt(0) ||
    operator?.fullName?.charAt(0) ||
    operator?.firstName?.charAt(0) ||
    "O";

  return (
    <div className="eta-page">
      {/* ================= SIDEBAR ================= */}
      <aside className="eta-sidebar">
        <div className="eta-brand">
          <div className="eta-brand-logo">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>Operator Console</span>
          </div>
        </div>

        <nav className="eta-nav">
          <Link
            to="/dashboard/operator"
            className="eta-nav-link"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/operator/shipment-tracking"
            className="eta-nav-link"
          >
            <span>▣</span>
            Shipment Tracking
          </Link>

          <Link
            to="/operator/live-delivery"
            className="eta-nav-link"
          >
            <span>◎</span>
            Live Deliveries
          </Link>

          <Link
            to="/operator/driver-tracking"
            className="eta-nav-link"
          >
            <span>♙</span>
            Driver Tracking
          </Link>

          <Link
            to="/operator/routes"
            className="eta-nav-link"
          >
            <span>⌁</span>
            Route Management
          </Link>

          <Link
            to="/operator/eta-delay"
            className="eta-nav-link active"
          >
            <span>◷</span>
            ETA & Delays
          </Link>

          <Link
            to="/operator/pod"
            className="eta-nav-link"
          >
            <span>✓</span>
            Proof of Delivery
          </Link>
        </nav>

        <div className="eta-sidebar-bottom">
          <div className="eta-user">
            <div className="eta-avatar">
              {initials.toUpperCase()}
            </div>

            <div>
              <strong>
                {operator?.name ||
                  operator?.fullName ||
                  "Logistics Operator"}
              </strong>

              <span>Operations Team</span>
            </div>
          </div>

          <Link
            to="/login"
            className="eta-logout"
          >
            ↪ Logout
          </Link>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="eta-main">
        <header className="eta-header">
          <div>
            <span className="eta-eyebrow">
              LOGISTICS OPERATIONS
            </span>

            <h1>ETA & Delays</h1>

            <p>
              Monitor estimated delivery times, delay risks and
              shipment exceptions.
            </p>
          </div>

          <div className="eta-header-actions">
            <div className="eta-live-status">
              <span></span>
              System Live
            </div>

            <button
              type="button"
              className="eta-notification"
              aria-label="Notifications"
            >
              ↻

              {delayedRecords.length > 0 && (
                <span>
                  {delayedRecords.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {error && (
          <div
            style={{
              color: "#ff6678",
              marginBottom: "20px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {/* ================= STATS ================= */}
        <section className="eta-stats">
          <div className="eta-stat-card orange">
            <div className="eta-stat-icon">◷</div>

            <div>
              <span>Active Shipments</span>

              <strong>
                {loading ? "—" : activeShipments.length}
              </strong>

              <small>Currently monitored</small>
            </div>
          </div>

          <div className="eta-stat-card purple">
            <div className="eta-stat-icon">⚠</div>

            <div>
              <span>ETA At Risk</span>

              <strong>
                {loading ? "—" : atRiskRecords.length}
              </strong>

              <small>May miss scheduled ETA</small>
            </div>
          </div>

          <div className="eta-stat-card red">
            <div className="eta-stat-icon">!</div>

            <div>
              <span>Delayed Shipments</span>

              <strong>
                {loading ? "—" : delayedCount}
              </strong>

              <small>Require attention</small>
            </div>
          </div>

          <div className="eta-stat-card green">
            <div className="eta-stat-icon">✓</div>

            <div>
              <span>Avg Delay</span>

              <strong>
                {loading
                  ? "—"
                  : averageDelay > 0
                  ? formatDelay(averageDelay)
                  : "0m"}
              </strong>

              <small>
                {averageDelay > 0
                  ? "Across delayed shipments"
                  : "No current delay data"}
              </small>
            </div>
          </div>
        </section>

        {/* ================= TOP GRID ================= */}
        <section className="eta-top-grid">
          {/* ETA RISK */}
          <div className="eta-panel">
            <div className="eta-panel-header">
              <div>
                <span className="eta-panel-label">
                  DELIVERY FORECAST
                </span>

                <h2>ETA Risk Overview</h2>
              </div>

              <span className="eta-live-badge">
                ● Live
              </span>
            </div>

            <div className="eta-risk-content">
              <div
                className="eta-risk-ring"
                style={{
                  background:
                    forecastTotal > 0
                      ? `conic-gradient(
                          #36d991 0deg,
                          #36d991 ${
                            onTimePercentage * 3.6
                          }deg,
                          #292e3c ${
                            onTimePercentage * 3.6
                          }deg
                        )`
                      : "#292e3c",
                }}
              >
                <div>
                  <strong>
                    {loading
                      ? "—"
                      : `${onTimePercentage}%`}
                  </strong>

                  <span>On ETA</span>
                </div>
              </div>

              <div className="eta-risk-list">
                <div>
                  <span className="risk-dot on-time"></span>
                  <p>On Schedule</p>
                  <strong>
                    {loading ? "—" : onScheduleCount}
                  </strong>
                </div>

                <div>
                  <span className="risk-dot medium-risk"></span>
                  <p>At Risk</p>
                  <strong>
                    {loading
                      ? "—"
                      : atRiskRecords.length}
                  </strong>
                </div>

                <div>
                  <span className="risk-dot high-risk"></span>
                  <p>Delayed</p>
                  <strong>
                    {loading ? "—" : delayedCount}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* DELAY REASONS */}
          <div className="eta-panel">
            <div className="eta-panel-header">
              <div>
                <span className="eta-panel-label">
                  EXCEPTION ANALYSIS
                </span>

                <h2>Delay Reasons</h2>
              </div>
            </div>

            {delayReasons.length === 0 ? (
              <div
                style={{
                  padding: "25px",
                  color: "#69738b",
                  fontSize: "12px",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: "#a3abc0",
                    marginBottom: "6px",
                  }}
                >
                  No current delay reasons
                </strong>

                There are no active shipment delay exceptions.
              </div>
            ) : (
              <div className="delay-reasons">
                {delayReasons.map((item) => (
                  <div
                    className="delay-reason"
                    key={item.reason}
                  >
                    <div className="delay-reason-top">
                      <span>{item.reason}</span>
                      <strong>{item.count}</strong>
                    </div>

                    <div className="delay-reason-bar">
                      <span
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      ></span>
                    </div>

                    <small>
                      {item.percentage}% of delays
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= TREND ================= */}
        <section className="eta-panel delay-trend-panel">
          <div className="eta-panel-header">
            <div>
              <span className="eta-panel-label">
                PERFORMANCE TREND
              </span>

              <h2>Delay Trend</h2>

              <p>
                Current ETA exceptions grouped by shipment
                update date.
              </p>
            </div>

            <div className="trend-value">
              {delayRate.toFixed(1)}%

              <small>Delay Rate</small>
            </div>
          </div>

          <div className="delay-chart">
            <div className="chart-y-axis">
              <span>
                {maxTrend}
              </span>

              <span>
                {Math.ceil(maxTrend * 0.75)}
              </span>

              <span>
                {Math.ceil(maxTrend * 0.5)}
              </span>

              <span>
                {Math.ceil(maxTrend * 0.25)}
              </span>

              <span>0</span>
            </div>

            <div className="chart-area">
              <div className="chart-grid-line one"></div>
              <div className="chart-grid-line two"></div>
              <div className="chart-grid-line three"></div>
              <div className="chart-grid-line four"></div>

              <div className="chart-bars">
                {trendData.map((day) => {
                  const height =
                    maxTrend > 0
                      ? Math.max(
                          10,
                          (day.count / maxTrend) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      className="chart-bar-item"
                      key={day.key}
                    >
                      <span
                        style={{
                          height: `${height}%`,
                        }}
                        title={`${day.count} exception${
                          day.count === 1
                            ? ""
                            : "s"
                        }`}
                      ></span>

                      <small>{day.label}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================= TABLE ================= */}
        <section className="eta-panel delayed-table-panel">
          <div className="eta-panel-header">
            <div>
              <span className="eta-panel-label">
                ATTENTION REQUIRED
              </span>

              <h2>Delayed Shipments</h2>

              <p>
                Shipments currently experiencing ETA
                exceptions.
              </p>
            </div>

            <Link
              to="/operator/shipment-tracking"
              className="eta-view-link"
            >
              View shipments →
            </Link>
          </div>

          {loading ? (
            <div
              style={{
                padding: "35px 25px",
                color: "#69738b",
                fontSize: "12px",
              }}
            >
              Loading current shipment data...
            </div>
          ) : delayedRecords.length === 0 ? (
            <div
              style={{
                padding: "35px 25px",
                color: "#69738b",
                fontSize: "12px",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#a3abc0",
                  marginBottom: "6px",
                }}
              >
                No current ETA exceptions
              </strong>

              All current shipments are not reporting an
              active ETA delay.
            </div>
          ) : (
            <div className="eta-table-wrapper">
              <table className="eta-table">
                <thead>
                  <tr>
                    <th>Shipment</th>
                    <th>Route</th>
                    <th>Driver</th>
                    <th>ETA</th>
                    <th>Delay</th>
                    <th>Reason</th>
                    <th>Risk</th>
                    <th>Progress</th>
                  </tr>
                </thead>

                <tbody>
                  {delayedRecords.map((record) => {
                    const shipment = record.shipment;

                    const route = getRoute(
                      record.route,
                      shipment
                    );

                    const delay = Number(
                      record.eta
                        ?.predictedDelayHours
                    );

                    const hasDelay =
                      Number.isFinite(delay) &&
                      delay > 0;

                    const failedDelivery =
                      shipment.status ===
                      "FAILED_DELIVERY";

                    const risk = hasDelay
                      ? getRisk(delay)
                      : "high";

                    const reason = failedDelivery
                      ? "Failed Delivery"
                      : getReason(record.eta);

                    const progress = getProgress(
                      shipment.status
                    );

                    return (
                      <tr key={shipment.id}>
                        <td>
                          <div className="eta-shipment">
                            <span className="eta-shipment-icon">
                              ▣
                            </span>

                            <div>
                              <strong>
                                {shipment.trackingNumber ||
                                  `Shipment #${shipment.id}`}
                              </strong>

                              <small>
                                {shipment.referenceId ||
                                  "Reference not provided"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="eta-route">
                          {route.origin} →{" "}
                          {route.destination}
                        </td>

                        <td className="eta-driver">
                          {shipment.assignedOperatorName ||
                            record.route
                              ?.assignedOperatorName ||
                            "Unassigned"}
                        </td>

                        <td className="eta-time">
                          {record.eta
                            ?.expectedCompletionTime
                            ? formatDateTime(
                                record.eta
                                  .expectedCompletionTime
                              )
                            : "ETA unavailable"}
                        </td>

                        <td>
                          <strong className="delay-value">
                            {hasDelay
                              ? formatDelay(delay)
                              : "Data unavailable"}
                          </strong>
                        </td>

                        <td className="delay-reason-text">
                          {reason}
                        </td>

                        <td>
                          <span
                            className={`risk-badge ${risk}`}
                          >
                            {risk === "high"
                              ? "High"
                              : risk === "medium"
                              ? "Medium"
                              : "Low"}
                          </span>
                        </td>

                        <td>
                          <div className="eta-progress">
                            <div className="eta-progress-bar">
                              <span
                                style={{
                                  width: `${progress}%`,
                                }}
                              ></span>
                            </div>

                            <small>
                              {progress}%
                            </small>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ================= BOTTOM INSIGHTS ================= */}
        <section className="eta-bottom-grid">
          <div className="eta-insight-card">
            <div className="eta-insight-icon">
              ⚡
            </div>

            <div>
              <span>Highest Delay Risk</span>

              {highestDelayRecord && highestRoute ? (
                <>
                  <strong>
                    {highestRoute.origin} →{" "}
                    {highestRoute.destination}
                  </strong>

                  <small>
                    {Number.isFinite(
                      Number(
                        highestDelayRecord.eta
                          ?.predictedDelayHours
                      )
                    ) &&
                    Number(
                      highestDelayRecord.eta
                        ?.predictedDelayHours
                    ) > 0
                      ? `${formatDelay(
                          highestDelayRecord.eta
                            .predictedDelayHours
                        )} delay · ${getReason(
                          highestDelayRecord.eta
                        )}`
                      : "Delay duration unavailable"}
                  </small>
                </>
              ) : (
                <>
                  <strong>
                    No current delay risk
                  </strong>

                  <small>
                    No active shipment is currently
                    reporting an ETA exception.
                  </small>
                </>
              )}
            </div>
          </div>

          <div className="eta-insight-card">
            <div className="eta-insight-icon">
              ◷
            </div>

            <div>
              <span>Average Recovery</span>

              <strong>Data unavailable</strong>

              <small>
                Recovery-time history is not provided by
                the current backend.
              </small>
            </div>
          </div>

          <div className="eta-insight-card success">
            <div className="eta-insight-icon">
              ✓
            </div>

            <div>
              <span>ETA Accuracy</span>

              <strong>Data unavailable</strong>

              <small>
                Historical ETA accuracy is not provided by
                the current backend.
              </small>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OperatorETADelays;