
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "./OperatorRouteManagement.css";
import "leaflet/dist/leaflet.css";
import { apiRequest } from "../api";

const ACTIVE_STATUSES = [
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
];
const FAILURE_STATUS = "FAILED_DELIVERY";

function formatDistance(distance) {
  if (
    distance === null ||
    distance === undefined ||
    String(distance).trim() === "" ||
    !Number.isFinite(Number(distance))
  ) {
    return "Data unavailable";
  }

  return `${Number(distance).toFixed(0)} km`;
}

function formatDuration(minutes) {
  if (
    minutes === null ||
    minutes === undefined ||
    String(minutes).trim() === "" ||
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
  return String(status || "").trim().toUpperCase();
}

function getRouteStatus(status) {
  const normalized = normalizeStatus(status);
  if (normalized === FAILURE_STATUS) return "Delayed";
  if (normalized === "DELIVERED") return "Completed";
  if (normalized === "CANCELLED") return "Cancelled";
  if (ACTIVE_STATUSES.includes(normalized)) return "On Route";
  if (normalized === "CREATED") return "Created";
  return "Status unavailable";
}

function hasCoordinates(latitude, longitude) {
  return (
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    String(latitude).trim() !== "" &&
    String(longitude).trim() !== "" &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Math.abs(Number(latitude)) <= 90 &&
    Math.abs(Number(longitude)) <= 180 &&
    !(Number(latitude) === 0 && Number(longitude) === 0)
  );
}

function getRouteCoordinates(route) {
  if (!route?.geometry) return [];

  try {
    const geometry =
      typeof route.geometry === "string"
        ? JSON.parse(route.geometry)
        : route.geometry;
    const lineString =
      geometry?.type === "Feature" ? geometry.geometry : geometry;

    if (
      lineString?.type !== "LineString" ||
      !Array.isArray(lineString.coordinates)
    ) {
      return [];
    }

    const coordinates = lineString.coordinates
      .filter(
        (coordinate) =>
          Array.isArray(coordinate) &&
          coordinate.length >= 2 &&
          hasCoordinates(coordinate[1], coordinate[0])
      )
      .map(([longitude, latitude]) => [
        Number(latitude),
        Number(longitude),
      ]);
    return coordinates.length >= 2 ? coordinates : [];
  } catch (error) {
    console.error("Unable to read persisted route geometry:", error);
    return [];
  }
}

function responseList(response) {
  if (Array.isArray(response)) return response;
  return (
    response?.content ||
    response?.data ||
    response?.shipments ||
    response?.history ||
    []
  );
}

function isValidLocation(location, assignedOperatorId) {
  const recordedAt = new Date(location?.recordedAt).getTime();
  return (
    hasCoordinates(location?.latitude, location?.longitude) &&
    Number.isFinite(recordedAt) &&
    (assignedOperatorId == null ||
      Number(location.recordedByOperatorId) ===
        Number(assignedOperatorId))
  );
}

function latestValidLocation(current, history, assignedOperatorId) {
  const candidates = [
    current,
    ...(Array.isArray(history) ? history : []),
  ].filter((location) => isValidLocation(location, assignedOperatorId));

  return candidates.sort(
    (first, second) =>
      new Date(second.recordedAt).getTime() -
      new Date(first.recordedAt).getTime()
  )[0] || null;
}

function hasFailedDeliveryAttempt(history) {
  return (
    Array.isArray(history) &&
    history.some(
      (item) =>
        normalizeStatus(item?.status || item?.newStatus) ===
        FAILURE_STATUS
    )
  );
}

function RouteMapBounds({ points, fitKey }) {
  const map = useMap();
  const fittedKey = useRef(null);

  useEffect(() => {
    if (fittedKey.current === fitKey || points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(L.latLngBounds(points), {
        padding: [36, 36],
        maxZoom: 13,
      });
    }
    fittedKey.current = fitKey;
  }, [fitKey, map, points]);

  return null;
}

function OperatorRouteManagement() {
  const [routes, setRoutes] = useState([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestInProgress = useRef(false);
  const mounted = useRef(false);
  const routeCalculationCooldowns = useRef(new Map());

  const loadRouteData = useCallback(async () => {
    if (requestInProgress.current) return;
    requestInProgress.current = true;

    if (mounted.current) {
      setError("");
    }

    try {
      const shipmentData = await apiRequest("/api/shipments");
      const shipmentList = responseList(shipmentData);

      if (!Array.isArray(shipmentList)) {
        throw new Error("Unexpected response while loading shipments.");
      }

      const routeResults = await Promise.all(
        shipmentList.map(async (shipment) => {
          if (!shipment?.id) return null;

          const [
            routeResult,
            locationResult,
            locationHistoryResult,
            statusHistoryResult,
          ] =
            await Promise.allSettled([
              apiRequest(`/api/routes/shipment/${shipment.id}`),
              apiRequest(`/api/shipments/${shipment.id}/location`),
              apiRequest(`/api/shipments/${shipment.id}/location-history`),
              apiRequest(`/api/shipments/${shipment.id}/history`),
            ]);

          let route =
            routeResult.status === "fulfilled" &&
            routeResult.value &&
            Number(routeResult.value.shipmentId) === Number(shipment.id)
              ? routeResult.value
              : null;
          let routeGenerationError = null;
          const shipmentId = Number(shipment.id);
          const hasPersistedGeometry =
            getRouteCoordinates(route).length >= 2;
          if (
            !hasPersistedGeometry &&
            ACTIVE_STATUSES.includes(normalizeStatus(shipment.status))
          ) {
            const nextAttemptAt =
              routeCalculationCooldowns.current.get(shipmentId) || 0;
            if (Date.now() >= nextAttemptAt) {
              routeCalculationCooldowns.current.set(
                shipmentId,
                Date.now() + 60000
              );
              try {
                const generatedRoute = await apiRequest(
                  `/api/routes/shipment/${shipmentId}/calculate`,
                  { method: "POST" }
                );
                if (
                  Number(generatedRoute?.shipmentId) === shipmentId &&
                  getRouteCoordinates(generatedRoute).length >= 2
                ) {
                  route = generatedRoute;
                  routeCalculationCooldowns.current.delete(shipmentId);
                } else {
                  routeGenerationError = new Error(
                    "Route generation returned no valid persisted GeoJSON geometry."
                  );
                }
              } catch (generationError) {
                routeGenerationError = generationError;
              }
            }
          } else if (hasPersistedGeometry) {
            routeCalculationCooldowns.current.delete(shipmentId);
          }

          const failures = [
            ["route", routeResult],
            ["location", locationResult],
            ["location history", locationHistoryResult],
            ["status history", statusHistoryResult],
          ].filter(
            ([kind, result]) =>
              result.status === "rejected" &&
              !(kind === "route" && result.reason?.status === 404)
          );
          failures.forEach(([kind, result]) => {
            console.error(
              `Unable to load shipment ${shipment.id} ${kind}:`,
              result.reason
            );
          });
          if (routeGenerationError) {
            console.error(
              `Unable to generate persisted route for shipment ${shipment.id}:`,
              routeGenerationError
            );
          }
          const history =
            locationHistoryResult.status === "fulfilled"
              ? responseList(locationHistoryResult.value)
              : [];
          const statusHistory =
            statusHistoryResult.status === "fulfilled"
              ? responseList(statusHistoryResult.value)
              : [];
          const current =
            locationResult.status === "fulfilled"
              ? locationResult.value
              : null;

          return {
            ...(route || {}),
            shipment,
            geometryCoordinates: getRouteCoordinates(route),
            currentLocation: latestValidLocation(
              current,
              history,
              shipment.assignedOperatorId
            ),
            locationHistory: history,
            statusHistory,
            statusHistoryAvailable: statusHistoryResult.status === "fulfilled",
            requestErrors: failures.map(([kind]) => kind),
          };
        })
      );

      const routeData = routeResults.filter(Boolean);
      if (!mounted.current) return;

      setRoutes(routeData);
      const failedItems = routeData.flatMap((route) =>
        route.requestErrors.map(
          (request) => `${request} unavailable for ${route.shipment.trackingNumber || `shipment ${route.shipment.id}`}`
        )
      );
      setError(
        failedItems.length > 0
          ? `Some live route data could not be refreshed: ${failedItems.join("; ")}`
          : ""
      );
    } catch (err) {
      console.error("Failed to refresh route data:", err);
      if (mounted.current) {
        setError(err.message || "Unable to load route data.");
      }
    } finally {
      requestInProgress.current = false;
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void loadRouteData();
    const refreshTimer = window.setInterval(
      () => void loadRouteData(),
      15000
    );

    return () => {
      mounted.current = false;
      window.clearInterval(refreshTimer);
    };
  }, [loadRouteData]);

  const allRoutes = useMemo(
    () =>
      routes.filter(
        (route) => route.id != null || route.shipmentId != null
      ),
    [routes]
  );

  const activeRoutes = useMemo(
    () =>
      routes.filter((route) =>
        ACTIVE_STATUSES.includes(normalizeStatus(route.shipment?.status))
      ),
    [routes]
  );

  const activeShipments = useMemo(
    () => activeRoutes.map((route) => route.shipment),
    [activeRoutes]
  );

  useEffect(() => {
    if (
      activeRoutes.some(
        (route) => String(route.shipment.id) === selectedShipmentId
      )
    ) {
      return;
    }
    setSelectedShipmentId(
      activeRoutes[0] ? String(activeRoutes[0].shipment.id) : ""
    );
  }, [activeRoutes, selectedShipmentId]);

  const selectedRoute = useMemo(
    () =>
      activeRoutes.find(
        (route) => String(route.shipment.id) === selectedShipmentId
      ) || null,
    [activeRoutes, selectedShipmentId]
  );

  const delayedRoutes = useMemo(
    () =>
      allRoutes.filter((route) => {
        const status = normalizeStatus(route.shipment?.status);
        return (
          status === FAILURE_STATUS ||
          (status === "DELIVERED" &&
            route.statusHistoryAvailable &&
            hasFailedDeliveryAttempt(route.statusHistory))
        );
      }),
    [allRoutes]
  );

  const completedRoutes = useMemo(
    () =>
      allRoutes.filter(
        (route) =>
          normalizeStatus(route.shipment?.status) === "DELIVERED"
      ),
    [allRoutes]
  );

  const onTimeRoutes = useMemo(
    () =>
      completedRoutes.filter(
        (route) =>
          route.statusHistoryAvailable &&
          !delayedRoutes.some(
            (delayedRoute) =>
              Number(delayedRoute.shipment?.id) ===
              Number(route.shipment?.id)
          )
      ),
    [completedRoutes, delayedRoutes]
  );

  const delayedCompletedRoutes = useMemo(
    () =>
      completedRoutes.filter(
        (route) =>
          route.statusHistoryAvailable &&
          hasFailedDeliveryAttempt(route.statusHistory)
      ),
    [completedRoutes]
  );

  const classifiedCompletedCount =
    onTimeRoutes.length + delayedCompletedRoutes.length;

  const efficiency = useMemo(() => {
    if (classifiedCompletedCount === 0) return null;
    return Math.round(
      (onTimeRoutes.length / classifiedCompletedCount) * 100
    );
  }, [classifiedCompletedCount, onTimeRoutes.length]);

  const displayRoutes = useMemo(
    () =>
      allRoutes.map((route) => {
        const shipment = route.shipment || {};
        const status = normalizeStatus(shipment.status);
        const failedAttempt = hasFailedDeliveryAttempt(
          route.statusHistory
        );
        const delayed =
          status === FAILURE_STATUS ||
          (status === "DELIVERED" &&
            route.statusHistoryAvailable &&
            failedAttempt);
        const origin =
          route.origin || shipment.senderAddress || "";
        const destination =
          route.destination || shipment.receiverAddress || "";
        const assignedOperator =
          route.assignedOperatorName ||
          shipment.assignedOperatorName ||
          shipment.assignedOperator?.fullName ||
          shipment.assignedOperator?.name;

        return {
          ...route,
          id: route.id || shipment.id,
          shipment,
          route:
            origin && destination
              ? `${origin} → ${destination}`
              : "Route unavailable",
          distanceKm:
            route.distanceKm != null &&
            String(route.distanceKm).trim() !== "" &&
            Number.isFinite(Number(route.distanceKm))
            ? Number(route.distanceKm)
            : null,
          distance: formatDistance(route.distanceKm),
          shipments: 1,
          driver: assignedOperator || "Not assigned",
          status: delayed
            ? "Delayed"
            : getRouteStatus(status),
          eta: formatDuration(route.estimatedDurationMinutes),
          shipmentStatus: status,
          trackingNumber: shipment.trackingNumber,
          isDelayed: delayed,
        };
      }),
    [allRoutes]
  );

  const mapRoutes = useMemo(
    () =>
      selectedRoute &&
      (selectedRoute.geometryCoordinates.length > 1 ||
        selectedRoute.currentLocation ||
        hasCoordinates(
          selectedRoute.originLatitude,
          selectedRoute.originLongitude
        ) ||
        hasCoordinates(
          selectedRoute.destinationLatitude,
          selectedRoute.destinationLongitude
        ))
        ? [selectedRoute]
        : [],
    [selectedRoute]
  );

  const mapPoints = useMemo(
    () =>
      mapRoutes.flatMap((route) => [
        ...route.geometryCoordinates,
        ...(route.currentLocation
          ? [[
              Number(route.currentLocation.latitude),
              Number(route.currentLocation.longitude),
            ]]
          : []),
        ...(hasCoordinates(
          route.originLatitude,
          route.originLongitude
        )
          ? [[Number(route.originLatitude), Number(route.originLongitude)]]
          : []),
        ...(hasCoordinates(
          route.destinationLatitude,
          route.destinationLongitude
        )
          ? [[Number(route.destinationLatitude), Number(route.destinationLongitude)]]
          : []),
      ]),
    [mapRoutes]
  );

  const mapFitKey = useMemo(
    () =>
      JSON.stringify(
        mapRoutes.map((route) => ({
          id: route.shipment.id,
          geometry: route.geometry,
          origin: [route.originLatitude, route.originLongitude],
          destination: [
            route.destinationLatitude,
            route.destinationLongitude,
          ],
        }))
      ),
    [mapRoutes]
  );

  const fastestRoute = useMemo(() => {
    const candidates = displayRoutes.filter(
      (route) =>
        ACTIVE_STATUSES.includes(route.shipmentStatus) &&
        route.distanceKm != null
    );
    return candidates.length > 0
      ? candidates.reduce((fastest, current) =>
          current.distanceKm < fastest.distanceKm ? current : fastest
        )
      : null;
  }, [displayRoutes]);

  const longestRoute = useMemo(() => {
    const candidates = displayRoutes.filter(
      (route) =>
        ACTIVE_STATUSES.includes(route.shipmentStatus) &&
        route.distanceKm != null
    );
    return candidates.length > 0
      ? candidates.reduce((longest, current) =>
          current.distanceKm > longest.distanceKm ? current : longest
        )
      : null;
  }, [displayRoutes]);

  const attentionRoutes = delayedRoutes;

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
                {classifiedCompletedCount > 0
                  ? `${efficiency}% of classified outcomes`
                  : "No classified completed outcomes"}
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

              <div className="route-map-controls">
                <select
                  className="route-shipment-select"
                  aria-label="Select active shipment route"
                  value={selectedShipmentId}
                  onChange={(event) =>
                    setSelectedShipmentId(event.target.value)
                  }
                  disabled={activeRoutes.length === 0}
                >
                  {activeRoutes.length === 0 ? (
                    <option value="">No active routes available</option>
                  ) : (
                    activeRoutes.map((route) => {
                      const shipment = route.shipment;
                      const trackingNumber =
                        shipment.trackingNumber || `Shipment #${shipment.id}`;
                      const sender =
                        route.origin || shipment.senderAddress || "Sender unavailable";
                      const receiver =
                        route.destination ||
                        shipment.receiverAddress ||
                        "Receiver unavailable";
                      return (
                        <option
                          key={shipment.id}
                          value={String(shipment.id)}
                        >
                          {trackingNumber} · {sender} → {receiver}
                        </option>
                      );
                    })
                  )}
                </select>
                <span className="route-live-badge">● Live</span>
              </div>

            </div>

            <div className="route-map">
              {mapPoints.length === 0 ? (
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
                  {activeRoutes.length === 0
                    ? "No active routes available"
                    : "Route geometry and driver location unavailable."}
                </div>
              ) : (
                <MapContainer
                  center={mapPoints[0]}
                  zoom={13}
                  scrollWheelZoom
                  style={{ width: "100%", height: "100%" }}
                >
                  <RouteMapBounds points={mapPoints} fitKey={mapFitKey} />
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapRoutes.map((route) => (
                    <Fragment key={route.id || route.shipment.id}>
                      {route.geometryCoordinates.length > 1 && (
                        <Polyline
                          positions={route.geometryCoordinates}
                          pathOptions={{
                            color: "#ff7048",
                            weight: 4,
                            opacity: 0.85,
                          }}
                        >
                          <Popup>
                            <strong>
                              {route.shipment.trackingNumber ||
                                `Shipment #${route.shipment.id}`}
                            </strong>
                            <br />
                            {route.origin || route.shipment.senderAddress}
                            {" → "}
                            {route.destination ||
                              route.shipment.receiverAddress}
                          </Popup>
                        </Polyline>
                      )}
                      {hasCoordinates(
                        route.originLatitude,
                        route.originLongitude
                      ) && (
                        <CircleMarker
                          center={[
                            Number(route.originLatitude),
                            Number(route.originLongitude),
                          ]}
                          radius={6}
                          pathOptions={{
                            color: "#ffffff",
                            weight: 2,
                            fillColor: "#36d991",
                            fillOpacity: 1,
                          }}
                        >
                          <Popup>
                            <strong>Shipment Origin</strong>
                            <br />
                            {route.origin || route.shipment.senderAddress}
                          </Popup>
                        </CircleMarker>
                      )}
                      {hasCoordinates(
                        route.destinationLatitude,
                        route.destinationLongitude
                      ) && (
                        <CircleMarker
                          center={[
                            Number(route.destinationLatitude),
                            Number(route.destinationLongitude),
                          ]}
                          radius={6}
                          pathOptions={{
                            color: "#ffffff",
                            weight: 2,
                            fillColor: "#a987ff",
                            fillOpacity: 1,
                          }}
                        >
                          <Popup>
                            <strong>Delivery Destination</strong>
                            <br />
                            {route.destination ||
                              route.shipment.receiverAddress}
                          </Popup>
                        </CircleMarker>
                      )}
                      {route.currentLocation && (
                        <CircleMarker
                          center={[
                            Number(route.currentLocation.latitude),
                            Number(route.currentLocation.longitude),
                          ]}
                          radius={7}
                          pathOptions={{
                            color: "#ffffff",
                            weight: 2,
                            fillColor: "#2583ff",
                            fillOpacity: 1,
                          }}
                        >
                          <Popup>
                            <strong>Current Driver Location</strong>
                            <br />
                            {route.shipment.assignedOperatorName ||
                              route.assignedOperatorName ||
                              "Assigned operator"}
                            <br />
                            {route.shipment.trackingNumber ||
                              `Shipment #${route.shipment.id}`}
                            <br />
                            {new Date(
                              route.currentLocation.recordedAt
                            ).toLocaleString()}
                          </Popup>
                        </CircleMarker>
                      )}
                    </Fragment>
                  ))}
                </MapContainer>
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
                    #36d991 ${(efficiency ?? 0) * 3.6}deg,
                    #292e3c ${(efficiency ?? 0) * 3.6}deg
                  )`,
                }}
              >

                <div>
                  <strong>
                    {efficiency == null ? "—" : `${efficiency}%`}
                  </strong>
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
                <p>Completed</p>
                <strong>{completedRoutes.length}</strong>
              </div>

              <div>
                <span className="efficiency-dot red-dot"></span>
                <p>Delayed</p>
                <strong>{delayedCompletedRoutes.length}</strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= ROUTE TABLE ================= */}

        <section className="route-panel routes-table-panel">

          <div className="route-panel-header">

            <div>
              <span className="route-panel-label">SAVED ROUTES</span>

              <h2>Route Operations</h2>

              <p>
                Persisted routes and current shipment status.
              </p>
            </div>

          </div>


          <div className="route-table-wrapper">

            <table className="route-table">

              <thead>
                <tr>
                  <th>Route</th>
                  <th>Shipments</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>ETA</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td
                      colSpan="5"
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
                      colSpan="5"
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
                      colSpan="5"
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

                        <span
                          className={`route-status ${
                          route.isDelayed || route.status === "Cancelled"
                              ? "attention-status"
                            : route.status === "Completed"
                              ? "completed-status"
                              : "onroute-status"
                        }`}
                        >
                          <span></span>
                          {route.status}
                        </span>

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
                          route.isDelayed
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
