
import { Link } from "react-router-dom";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Radio,
  Search,
  Truck,
  UserRound,
  AlertTriangle,
  MoreHorizontal,
  Gauge,
} from "lucide-react";

import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import { apiRequest } from "../api";
import "leaflet/dist/leaflet.css";
import "./DriverTracking.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const LOCATION_REFRESH_INTERVAL = 15000;
const ACTIVE_DELIVERY_STATUSES = [
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
];
const DELIVERY_STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED_DELIVERY",
  "CANCELLED",
];
const STATUS_COLORS = [
  "#579cff",
  "#8e7bff",
  "#36dcb0",
  "#37d9e8",
  "#49c58e",
  "#ff6476",
  "#8490a7",
];

function hasCoordinates(location) {
  return (
    location?.latitude != null &&
    location?.longitude != null &&
    String(location.latitude).trim() !== "" &&
    String(location.longitude).trim() !== "" &&
    Number.isFinite(Number(location.latitude)) &&
    Number.isFinite(Number(location.longitude)) &&
    Math.abs(Number(location.latitude)) <= 90 &&
    Math.abs(Number(location.longitude)) <= 180
  );
}

function isValidLocationRecord(location, assignedOperatorId) {
  const recordedAt = new Date(location?.recordedAt).getTime();
  return (
    hasCoordinates(location) &&
    !(Number(location.latitude) === 0 && Number(location.longitude) === 0) &&
    Number.isFinite(recordedAt) &&
    Number(location.recordedByOperatorId) === Number(assignedOperatorId)
  );
}

function getLatestValidLocation(history, assignedOperatorId) {
  if (!Array.isArray(history) || history.length === 0) return null;

  const [latestRecord] = history;
  return isValidLocationRecord(latestRecord, assignedOperatorId)
    ? latestRecord
    : null;
}

function mergeLocationHistory(serverHistory, currentHistory, currentLocation) {
  const records = new Map();
  [
    ...(Array.isArray(serverHistory) ? serverHistory : []),
    ...(Array.isArray(currentHistory) ? currentHistory : []),
    ...(currentLocation ? [currentLocation] : []),
  ].forEach((location) => {
    if (!location) return;
    const recordKey =
      location.id != null
        ? `id:${location.id}`
        : `${location.recordedAt}:${location.latitude}:${location.longitude}`;
    const existing = records.get(recordKey);
    if (
      !existing ||
      new Date(location.recordedAt || 0) >=
        new Date(existing.recordedAt || 0)
    ) {
      records.set(recordKey, location);
    }
  });

  return [...records.values()].sort(
    (first, second) =>
      new Date(second.recordedAt || 0) -
      new Date(first.recordedAt || 0)
  );
}

function summarizeSpeed(locationHistory, assignedOperatorId) {
  const points = (Array.isArray(locationHistory) ? locationHistory : [])
    .filter((location) =>
      isValidLocationRecord(location, assignedOperatorId)
    )
    .map((location) => ({
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      recordedAt: new Date(location.recordedAt).getTime(),
    }))
    .sort((first, second) => first.recordedAt - second.recordedAt);

  const segmentSpeeds = [];
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const intervalHours =
      (current.recordedAt - previous.recordedAt) / 3600000;
    if (intervalHours <= 0) continue;

    const radians = (degrees) => (degrees * Math.PI) / 180;
    const latitudeDelta = radians(current.latitude - previous.latitude);
    const longitudeDelta = radians(current.longitude - previous.longitude);
    const haversine =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(radians(previous.latitude)) *
        Math.cos(radians(current.latitude)) *
        Math.sin(longitudeDelta / 2) ** 2;
    const boundedHaversine = Math.min(1, Math.max(0, haversine));
    const distanceKm =
      6371 *
      2 *
      Math.atan2(
        Math.sqrt(boundedHaversine),
        Math.sqrt(1 - boundedHaversine)
      );
    const speedKmh = distanceKm / intervalHours;

    if (Number.isFinite(speedKmh) && speedKmh <= 200) {
      segmentSpeeds.push(speedKmh);
    }
  }

  return segmentSpeeds.length > 0
    ? segmentSpeeds.reduce((total, speed) => total + speed, 0) /
        segmentSpeeds.length
    : null;
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

    if (
      lineString.coordinates.length < 2 ||
      lineString.coordinates.some(
        (coordinate) =>
          !Array.isArray(coordinate) ||
          coordinate.length < 2 ||
          !hasCoordinates({
            latitude: coordinate[1],
            longitude: coordinate[0],
          }) ||
          (Number(coordinate[1]) === 0 && Number(coordinate[0]) === 0)
      )
    ) {
      return [];
    }

    return lineString.coordinates.map(([longitude, latitude]) => [
      Number(latitude),
      Number(longitude),
    ]);
  } catch (error) {
    console.error("Failed to parse saved route geometry:", error);
    return [];
  }
}

function FitMapToPoints({ points, fitKey, mapRef }) {
  const map = useMap();
  const pointsKey = points.map((point) => point.join(",")).join("|");
  const fittedKeyRef = useRef(null);

  useEffect(() => {
    mapRef.current = map;
    if (fittedKeyRef.current === fitKey) return;

    const currentPoints = pointsKey
      .split("|")
      .filter(Boolean)
      .map((point) => point.split(",").map(Number));

    if (currentPoints.length === 1) {
      map.setView(currentPoints[0], 15);
    } else if (currentPoints.length > 1) {
      map.fitBounds(L.latLngBounds(currentPoints), {
        padding: [48, 48],
        maxZoom: 15,
      });
    }

    fittedKeyRef.current = fitKey;
  }, [map, mapRef, pointsKey, fitKey]);

  useEffect(
    () => () => {
      mapRef.current = null;
    },
    [mapRef]
  );

  return null;
}

function PanMapToCurrentLocation({ shipmentId, location }) {
  const map = useMap();
  const previousFixRef = useRef(null);

  useEffect(() => {
    const currentFix = `${location.latitude},${location.longitude}`;
    if (previousFixRef.current?.shipmentId !== String(shipmentId)) {
      previousFixRef.current = {
        shipmentId: String(shipmentId),
        coordinates: currentFix,
      };
      return;
    }

    if (previousFixRef.current.coordinates !== currentFix) {
      previousFixRef.current.coordinates = currentFix;
      map.panTo([Number(location.latitude), Number(location.longitude)], {
        animate: true,
      });
    }
  }, [map, shipmentId, location.latitude, location.longitude]);

  return null;
}

function DriverTracking() {
  const [shipments, setShipments] = useState([]);
  const [locations, setLocations] = useState({});
  const [locationHistories, setLocationHistories] = useState({});
  const [routes, setRoutes] = useState({});
  const [etas, setEtas] = useState({});
  const [selectedShipmentId, setSelectedShipmentId] = useState("");
  const [gpsTrackingShipmentId, setGpsTrackingShipmentId] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("idle");
  const [gpsError, setGpsError] = useState("");
  const [gpsLastUpdated, setGpsLastUpdated] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const requestInProgress = useRef(false);
  const etaRefreshSequence = useRef(0);
  const mountedRef = useRef(false);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const gpsWatchIdRef = useRef(null);
  const gpsSessionRef = useRef(0);
  const gpsQueueRef = useRef(null);
  const gpsRequestInProgressRef = useRef(false);
  const latestGpsLocationsRef = useRef({});

  const refreshEtas = useCallback(async (shipmentList, routeData, locationData) => {
    const refreshId = ++etaRefreshSequence.current;

    try {
      const results = await Promise.all(
        shipmentList.map(async (shipment) => {
          const route = routeData[shipment.id];
          const location = locationData[shipment.id];
          const hasDestination = hasCoordinates({
            latitude: route?.destinationLatitude,
            longitude: route?.destinationLongitude,
          });
          if (
            !route ||
            !hasDestination ||
            !isValidLocationRecord(location, shipment.assignedOperatorId) ||
            !ACTIVE_DELIVERY_STATUSES.includes(shipment.status)
          ) {
            return [shipment.id, null];
          }

          try {
            const eta = await apiRequest(`/api/shipments/${shipment.id}/eta`, {
              method: "POST",
              body: JSON.stringify({
                destination: {
                  latitude: Number(route.destinationLatitude),
                  longitude: Number(route.destinationLongitude),
                },
              }),
            });
            const expectedCompletionTime = eta?.expectedCompletionTime;
            const expectedTime = expectedCompletionTime
              ? new Date(expectedCompletionTime).getTime()
              : Number.NaN;

            return Number(eta?.shipmentId) === Number(shipment.id) &&
              Number.isFinite(expectedTime)
              ? [shipment.id, eta]
              : [shipment.id, { requestFailed: true }];
          } catch (error) {
            console.error(
              `Failed to load ETA for shipment ${shipment.id}:`,
              error
            );
            return [shipment.id, { requestFailed: true }];
          }
        })
      );

      if (
        mountedRef.current &&
        refreshId === etaRefreshSequence.current
      ) {
        setEtas(Object.fromEntries(results));
      }
    } catch (error) {
      console.error("Failed to refresh shipment ETAs:", error);
    }
  }, []);

  const stopGpsTracking = useCallback(() => {
    gpsSessionRef.current += 1;
    if (
      gpsWatchIdRef.current != null &&
      navigator.geolocation?.clearWatch
    ) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
    }
    gpsWatchIdRef.current = null;
    gpsQueueRef.current = null;
    setGpsTrackingShipmentId(null);
    setGpsStatus("idle");
  }, []);

  const flushGpsQueue = useCallback(async () => {
    if (gpsRequestInProgressRef.current) return;
    gpsRequestInProgressRef.current = true;

    try {
      while (gpsQueueRef.current) {
        const update = gpsQueueRef.current;
        gpsQueueRef.current = null;

        if (
          update.sessionId !== gpsSessionRef.current ||
          !mountedRef.current
        ) {
          continue;
        }

        try {
          const savedLocation = await apiRequest(
            `/api/shipments/${update.shipmentId}/location`,
            {
              method: "PATCH",
              body: JSON.stringify({
                latitude: update.latitude,
                longitude: update.longitude,
              }),
            }
          );

          if (
            update.sessionId !== gpsSessionRef.current ||
            !mountedRef.current
          ) {
            continue;
          }

          if (
            !isValidLocationRecord(
              savedLocation,
              update.assignedOperatorId
            )
          ) {
            throw new Error(
              "The location API returned an invalid saved GPS record."
            );
          }

          latestGpsLocationsRef.current[update.shipmentId] =
            savedLocation;
          setLocations((previous) => {
            const current = previous[update.shipmentId];
            const currentTime = new Date(current?.recordedAt || 0).getTime();
            const savedTime = new Date(savedLocation.recordedAt).getTime();
            return savedTime >= currentTime
              ? { ...previous, [update.shipmentId]: savedLocation }
              : previous;
          });
          setLocationHistories((previous) => ({
            ...previous,
            [update.shipmentId]: mergeLocationHistory(
              previous[update.shipmentId],
              [],
              savedLocation
            ),
          }));
          setGpsLastUpdated(savedLocation.recordedAt);
          setGpsStatus("active");
          setGpsError("");
        } catch (error) {
          console.error("Failed to save live GPS location:", error);
          if (
            update.sessionId === gpsSessionRef.current &&
            mountedRef.current
          ) {
            if (error?.status === 403) {
              stopGpsTracking();
              setGpsStatus("error");
              setGpsError(
                "GPS update denied. This shipment is no longer assigned to this operator."
              );
              continue;
            }
            setGpsStatus("error");
            setGpsError(`GPS location could not be saved: ${error.message}`);
          }
        }
      }
    } finally {
      gpsRequestInProgressRef.current = false;
    }
  }, [stopGpsTracking]);

  const startGpsTracking = useCallback(
    (shipment, operatorId) => {
      if (!shipment || !ACTIVE_DELIVERY_STATUSES.includes(shipment.status)) {
        setGpsError("GPS tracking is available only for active assigned shipments.");
        return;
      }

      if (
        Number(shipment.assignedOperatorId) !== Number(operatorId)
      ) {
        setGpsError("GPS tracking is available only for shipments assigned to this operator.");
        return;
      }

      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        setGpsStatus("error");
        setGpsError(
          "Browser GPS requires a secure HTTPS connection (localhost is also supported)."
        );
        return;
      }

      if (!navigator.geolocation) {
        setGpsStatus("error");
        setGpsError("This browser does not provide GPS location services.");
        return;
      }

      if (gpsWatchIdRef.current != null) stopGpsTracking();
      const sessionId = ++gpsSessionRef.current;
      setGpsTrackingShipmentId(shipment.id);
      setGpsStatus("requesting");
      setGpsError("");
      setGpsLastUpdated(null);

      try {
        gpsWatchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            if (
              sessionId !== gpsSessionRef.current ||
              !mountedRef.current
            ) {
              return;
            }

            const { latitude, longitude } = position.coords;
            if (
              !hasCoordinates({ latitude, longitude }) ||
              (Number(latitude) === 0 && Number(longitude) === 0)
            ) {
              setGpsStatus("error");
              setGpsError("The browser returned invalid GPS coordinates.");
              return;
            }

            gpsQueueRef.current = {
              sessionId,
              shipmentId: shipment.id,
              assignedOperatorId: operatorId,
              latitude: Number(latitude),
              longitude: Number(longitude),
            };
            setGpsStatus((current) =>
              current === "requesting" ? "connecting" : current
            );
            void flushGpsQueue();
          },
          (error) => {
            if (
              sessionId !== gpsSessionRef.current ||
              !mountedRef.current
            ) {
              return;
            }

            const message =
              error.code === 1
                ? "GPS permission was denied. Allow location access in browser settings, then start tracking again."
                : error.code === 2
                  ? "The device could not determine a GPS location. Move to an area with GPS reception and retry."
                  : error.code === 3
                    ? "GPS location request timed out. Tracking will continue trying."
                    : "The browser could not read GPS location.";
            setGpsStatus("error");
            setGpsError(message);

            if (error.code === 1) {
              stopGpsTracking();
              setGpsStatus("error");
              setGpsError(message);
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 20000,
          }
        );
      } catch (error) {
        console.error("Unable to start browser GPS tracking:", error);
        stopGpsTracking();
        setGpsStatus("error");
        setGpsError(`GPS tracking could not start: ${error.message}`);
      }
    },
    [flushGpsQueue, stopGpsTracking]
  );

  const loadData = useCallback(async (showLoading = false) => {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    if (mountedRef.current && showLoading) setLoading(true);

    try {
      const [user, shipmentData] = await Promise.all([
        apiRequest("/api/users/me"),
        apiRequest("/api/shipments"),
      ]);

      if (!Array.isArray(shipmentData)) {
        throw new Error("Unexpected response while loading assigned shipments.");
      }

      const shipmentList = shipmentData.filter(
        (shipment) =>
          Number(shipment?.assignedOperatorId) === Number(user?.id)
      );
      const trackingErrors = [];
      const trackingResults = await Promise.all(
        shipmentList.map(async (shipment) => {
          const [locationResult, historyResult, routeResult] = await Promise.allSettled([
            apiRequest(`/api/shipments/${shipment.id}/location`),
            apiRequest(`/api/shipments/${shipment.id}/location-history`),
            apiRequest(`/api/routes/shipment/${shipment.id}`),
          ]);

          if (locationResult.status === "rejected") {
            trackingErrors.push("A current location could not be loaded.");
            console.error(
              `Failed to load current location for shipment ${shipment.id}:`,
              locationResult.reason
            );
          }

          if (historyResult.status === "rejected") {
            trackingErrors.push("A location history could not be loaded.");
            console.error(
              `Failed to load location history for shipment ${shipment.id}:`,
              historyResult.reason
            );
          }

          const history =
            historyResult.status === "fulfilled" &&
            Array.isArray(historyResult.value)
              ? historyResult.value
              : [];
          const latestHistoryLocation = getLatestValidLocation(
            history,
            shipment.assignedOperatorId
          );
          const locationResponse =
            locationResult.status === "fulfilled"
              ? locationResult.value
              : null;
          const location = isValidLocationRecord(
            locationResponse,
            shipment.assignedOperatorId
          )
            ? locationResponse
            : locationResponse == null
              ? latestHistoryLocation
              : null;
          const route =
            routeResult.status === "fulfilled" &&
            Number(routeResult.value?.shipmentId) === Number(shipment.id)
              ? routeResult.value
              : null;

          if (
            routeResult.status === "rejected" &&
            routeResult.reason?.status !== 404
          ) {
            trackingErrors.push("A saved route could not be loaded.");
            console.error(
              `Failed to load route for shipment ${shipment.id}:`,
              routeResult.reason
            );
          } else if (
            routeResult.status === "fulfilled" &&
            routeResult.value != null &&
            route == null
          ) {
            trackingErrors.push("A route did not match its assigned shipment.");
          }

          return {
            shipmentId: shipment.id,
            location,
            history,
            route,
          };
        })
      );

      if (!mountedRef.current) return;

      setCurrentUser(user);
      setShipments(shipmentList);
      setLocations((previous) =>
        Object.fromEntries(
          trackingResults.map(({ shipmentId, location }) => {
            const freshestLocation = [
              previous[shipmentId],
              location,
              latestGpsLocationsRef.current[shipmentId],
            ]
              .filter(Boolean)
              .reduce((freshest, candidate) => {
                if (!freshest) return candidate;
                const freshestTime = new Date(
                  freshest.recordedAt || 0
                ).getTime();
                const candidateTime = new Date(
                  candidate.recordedAt || 0
                ).getTime();
                return candidateTime >= freshestTime
                  ? candidate
                  : freshest;
              }, null);
            return [shipmentId, freshestLocation];
          })
        )
      );
      setLocationHistories((previous) =>
        Object.fromEntries(
          trackingResults.map(({ shipmentId, history, location }) => [
            shipmentId,
            mergeLocationHistory(
              history,
              previous[shipmentId],
              location
            ),
          ])
        )
      );
      setRoutes(
        Object.fromEntries(
          trackingResults.map(({ shipmentId, route }) => [shipmentId, route])
        )
      );
      void refreshEtas(
        shipmentList,
        Object.fromEntries(
          trackingResults.map(({ shipmentId, route }) => [shipmentId, route])
        ),
        Object.fromEntries(
          trackingResults.map(({ shipmentId, location }) => [
            shipmentId,
            location,
          ])
        )
      );
      setLoadError([...new Set(trackingErrors)].join(" "));
    } catch (error) {
      console.error("Failed to load driver tracking data:", error);
      if (mountedRef.current) {
        setLoadError("Driver tracking data could not be refreshed.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
      requestInProgress.current = false;
    }
  }, [refreshEtas]);

  useEffect(() => {
    mountedRef.current = true;
    loadData(true);
    const refreshTimer = window.setInterval(
      () => loadData(),
      LOCATION_REFRESH_INTERVAL
    );

    return () => {
      mountedRef.current = false;
      window.clearInterval(refreshTimer);
      gpsSessionRef.current += 1;
      if (
        gpsWatchIdRef.current != null &&
        navigator.geolocation?.clearWatch
      ) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      }
      gpsWatchIdRef.current = null;
      gpsQueueRef.current = null;
      latestGpsLocationsRef.current = {};
    };
  }, [loadData]);

  const operatorName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.email ||
    "Operator";

  const operatorInitials = operatorName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const drivers = shipments
    .filter((shipment) => shipment.assignedOperatorId != null)
    .map((shipment) => ({
      id: shipment.id,
      operatorId: shipment.assignedOperatorId,
      name:
        shipment.assignedOperatorName ||
        (Number(shipment.assignedOperatorId) === Number(currentUser?.id)
          ? operatorName
          : `Operator #${shipment.assignedOperatorId}`),
      shipment,
      location: locations[shipment.id] || null,
      route: routes[shipment.id] || null,
      eta: etas[shipment.id] || null,
      speedKmh: summarizeSpeed(
        locationHistories[shipment.id],
        shipment.assignedOperatorId
      ),
    }));

  const isActiveShipment = (shipment) =>
    ACTIVE_DELIVERY_STATUSES.includes(shipment?.status);
  const activeDriverIds = new Set(
    drivers
      .filter((driver) => isActiveShipment(driver.shipment))
      .map((driver) => driver.operatorId)
  );
  const onRoadDriverIds = new Set(
    drivers
      .filter((driver) => isActiveShipment(driver.shipment))
      .map((driver) => driver.operatorId)
  );
  const attentionDriverIds = new Set(
    drivers
      .filter((driver) =>
        ["FAILED_DELIVERY", "CANCELLED"].includes(driver.shipment?.status)
      )
      .map((driver) => driver.operatorId)
  );
  const activeTrackingDrivers = drivers.filter((driver) =>
    isActiveShipment(driver.shipment)
  );
  const selectedDriver =
    activeTrackingDrivers.find(
      (driver) => String(driver.shipment.id) === String(selectedShipmentId)
    ) || activeTrackingDrivers[0] || null;
  const selectedShipment = selectedDriver?.shipment || null;
  const selectedShipmentKey = selectedShipment?.id;
  const selectedLocation = selectedDriver?.location || null;
  const selectedRoute = selectedDriver?.route || null;
  const selectedRouteCoordinates = getRouteCoordinates(selectedRoute);
  const selectedShipmentOperatorId = selectedShipment?.assignedOperatorId;
  const selectedShipmentStatus = selectedShipment?.status;
  const destination = hasCoordinates({
    latitude: selectedRoute?.destinationLatitude,
    longitude: selectedRoute?.destinationLongitude,
  })
    ? {
        latitude: Number(selectedRoute.destinationLatitude),
        longitude: Number(selectedRoute.destinationLongitude),
      }
    : null;
  const hasSelectedLocation = selectedDriver
    ? isValidLocationRecord(
        selectedLocation,
        selectedDriver.shipment.assignedOperatorId
      )
    : false;

  useEffect(() => {
    if (
      gpsTrackingShipmentId != null &&
      (selectedShipmentKey == null ||
        String(gpsTrackingShipmentId) !== String(selectedShipmentKey) ||
        Number(selectedShipmentOperatorId) !==
          Number(currentUser?.id) ||
        !ACTIVE_DELIVERY_STATUSES.includes(selectedShipmentStatus))
    ) {
      stopGpsTracking();
    }
  }, [
    gpsTrackingShipmentId,
    selectedShipmentKey,
    selectedShipmentOperatorId,
    selectedShipmentStatus,
    currentUser?.id,
    stopGpsTracking,
  ]);
  const activeMapDrivers = activeTrackingDrivers.filter(
    (driver) =>
      isValidLocationRecord(
        driver.location,
        driver.shipment.assignedOperatorId
      )
  );
  const trackedLocations = activeMapDrivers.length;
  const totalDrivers = new Set(drivers.map((driver) => driver.operatorId)).size;
  const onRoadDrivers = onRoadDriverIds.size;
  const attentionDrivers = attentionDriverIds.size;
  const averageSpeed = (() => {
    const driversWithSpeed = activeTrackingDrivers.filter(
      (driver) => driver.speedKmh != null
    );
    return driversWithSpeed.length > 0
      ? driversWithSpeed.reduce((total, driver) => total + driver.speedKmh, 0) /
          driversWithSpeed.length
      : null;
  })();

  const statusCounts = DELIVERY_STATUSES.map((status) =>
    shipments.filter((shipment) => shipment.status === status).length
  );
  const statusRingBackground = (() => {
    const total = statusCounts.reduce((sum, count) => sum + count, 0);
    if (total === 0) return "conic-gradient(#2b3140 0deg 360deg)";

    let previousStop = 0;
    const segments = statusCounts.map((count, index) => {
      const nextStop = previousStop + (count / total) * 360;
      const segment = `${STATUS_COLORS[index]} ${previousStop}deg ${nextStop}deg`;
      previousStop = nextStop;
      return segment;
    });
    return `conic-gradient(${segments.join(", ")})`;
  })();

  const mapPoints = [
    ...(hasSelectedLocation
      ? [[Number(selectedLocation.latitude), Number(selectedLocation.longitude)]]
      : []),
    ...selectedRouteCoordinates,
    ...(destination ? [[destination.latitude, destination.longitude]] : []),
  ];
  const mapFitKey = JSON.stringify({
    shipmentId: selectedShipment?.id,
    route: selectedRouteCoordinates,
    destination,
  });
  const selectedEta = selectedDriver?.eta;

  const centerMap = () => {
    mapContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    if (mapPoints.length === 1) {
      leafletMapRef.current?.setView(mapPoints[0], 15);
    } else if (mapPoints.length > 1) {
      leafletMapRef.current?.fitBounds(L.latLngBounds(mapPoints), {
        padding: [48, 48],
        maxZoom: 15,
      });
    }
  };

  const utilization =
    totalDrivers > 0
      ? ((onRoadDrivers / totalDrivers) * 100).toFixed(1)
      : "0.0";

  const filteredDrivers = drivers.filter((driver) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    const driverName =
      driver.name?.toLowerCase() || "";

    const trackingNumber =
      driver.shipment?.trackingNumber?.toLowerCase() || "";

    const referenceNumber =
      driver.shipment?.referenceNumber?.toLowerCase() || "";

    const locationName =
      driver.location?.locationName?.toLowerCase() || "";

    return (
      driverName.includes(query) ||
      trackingNumber.includes(query) ||
      referenceNumber.includes(query) ||
      locationName.includes(query) ||
      String(driver.operatorId).includes(query)
    );
  });
  const activeFilteredDrivers = filteredDrivers.filter((driver) =>
    isActiveShipment(driver.shipment)
  );
  const otherFilteredDrivers = filteredDrivers.filter(
    (driver) => !isActiveShipment(driver.shipment)
  );
  const orderedFilteredDrivers = [
    ...activeFilteredDrivers,
    ...otherFilteredDrivers,
  ];

  const getInitials = (name) =>
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "OP";

  const getStatusLabel = (status) => {
    if (!status) {
      return "Not available";
    }

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClass = (status) => {
    if (
      status === "FAILED_DELIVERY" ||
      status === "CANCELLED"
    ) {
      return "status-delayed";
    }

    if (status === "DELIVERED") {
      return "status-near";
    }

    return "status-route";
  };

  return (
    <div className="driver-page">

      {/* Sidebar */}

      <aside className="driver-sidebar">

        <div className="driver-brand">

          <div className="driver-brand-icon">
            <Truck size={22} />
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>

        </div>

        <div className="driver-role">
          <span></span>
          Logistics Operator
        </div>

        <nav className="driver-nav">

          <Link to="/dashboard/operator">
            <Navigation size={18} />
            Dashboard
          </Link>

          <Link to="/operator/live-delivery">
            <Radio size={18} />
            Live Deliveries
            <b>{activeDriverIds.size}</b>
          </Link>

          <Link to="/dashboard/operator">
            <Truck size={18} />
            Shipment Tracking
          </Link>

          <Link
            to="/operator/driver-tracking"
            className="active"
          >
            <UserRound size={18} />
            Driver Tracking
          </Link>

          <Link to="/dashboard/operator">
            <MapPin size={18} />
            Route Management
          </Link>

          <Link to="/dashboard/operator">
            <Clock3 size={18} />
            ETA & Delays
          </Link>

          <Link to="/dashboard/operator">
            <CheckCircle2 size={18} />
            Proof of Delivery
          </Link>

        </nav>

        <div className="driver-sidebar-bottom">

          <Link
            to="/dashboard/operator"
            className="back-link"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="driver-profile">

            <div className="profile-avatar">
              {operatorInitials || "OP"}
            </div>

            <div>
              <strong>{operatorName}</strong>
              <span>Logistics Operator</span>
            </div>

            <MoreHorizontal size={18} />

          </div>

        </div>

      </aside>


      {/* Main */}

      <main className="driver-main">

        {/* Header */}

        <header className="driver-header">

          <div>

            <div className="driver-breadcrumb">
              Operations <span>/</span> Driver Tracking
            </div>

            <div className="driver-title-row">

              <div>

                <h1>Driver Tracking</h1>

                <p>
                  Monitor assigned operator locations, shipment routes
                  and delivery progress in real time.
                </p>

              </div>

              <div className="driver-live-badge">
                <span></span>
                {loadError
                  ? "TRACKING ERROR"
                  : loading
                    ? "LOADING TRACKING"
                    : "LIVE TRACKING"}
              </div>

            </div>

          </div>

          <div className="driver-header-actions">

            <button className="driver-icon-btn">
              <Bell size={20} />
              <i></i>
            </button>

            <button
              className="driver-refresh"
              onClick={loadData}
              disabled={loading}
            >
              <Radio size={16} />
              {loadError
                ? "Tracking Error"
                : loading
                  ? "Refreshing..."
                  : "Tracking Active"}
            </button>

          </div>

        </header>


        {/* Stats */}

        <section className="driver-stats">

          <div className="driver-stat">

            <div className="driver-stat-icon orange">
              <UserRound size={21} />
            </div>

            <div>

              <span>Total Drivers</span>

              <strong>{totalDrivers}</strong>

              <small>
                Drivers assigned in shipment data
              </small>

            </div>

          </div>


          <div className="driver-stat">

            <div className="driver-stat-icon green">
              <Navigation size={21} />
            </div>

            <div>

              <span>On Road</span>

              <strong>{onRoadDrivers}</strong>

              <small className="green-text">
                {utilization}% active
              </small>

            </div>

          </div>


          <div className="driver-stat">

            <div className="driver-stat-icon purple">
              <Gauge size={21} />
            </div>

            <div>

              <span>Avg Speed</span>

              <strong>
                {averageSpeed == null
                  ? "Not available"
                  : `${averageSpeed.toFixed(1)} km/h`}
              </strong>

              <small>
                {averageSpeed == null
                  ? "Speed data unavailable"
                  : "Calculated from recorded GPS locations"}
              </small>

            </div>

          </div>


          <div className="driver-stat">

            <div className="driver-stat-icon red">
              <AlertTriangle size={21} />
            </div>

            <div>

              <span>Attention Needed</span>

              <strong>
                {String(attentionDrivers).padStart(2, "0")}
              </strong>

              <small className="red-text">
                Failed or cancelled shipments
              </small>

            </div>

          </div>

        </section>


        {/* Map + Driver Status */}

        <section className="driver-monitor-grid">

          {/* Map */}

          <div className="driver-map-card">

            <div className="driver-card-header">

              <div>

                <h2>Driver Location Map</h2>

                <p>
                  Latest available driver locations
                </p>

              </div>

              <button className="center-driver-map" onClick={centerMap}>
                <Navigation size={15} />
                Center Map
              </button>

            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                marginTop: "12px",
                flexWrap: "wrap",
              }}
            >
              <label htmlFor="driver-tracking-shipment">
                Active shipment
              </label>
              <select
                id="driver-tracking-shipment"
                className="driver-filter"
                value={selectedShipment?.id || ""}
                onChange={(event) => {
                  stopGpsTracking();
                  setGpsError("");
                  setGpsLastUpdated(null);
                  setSelectedShipmentId(event.target.value);
                }}
                disabled={activeTrackingDrivers.length === 0}
              >
                {activeTrackingDrivers.length === 0 ? (
                  <option value="">No active shipments</option>
                ) : (
                  activeTrackingDrivers.map((driver) => (
                    <option
                      key={driver.shipment.id}
                      value={driver.shipment.id}
                    >
                      {driver.shipment.trackingNumber ||
                        `Shipment #${driver.shipment.id}`}
                    </option>
                  ))
                )}
              </select>
              {selectedShipment && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <button
                    type="button"
                    className="driver-filter"
                    onClick={() =>
                      startGpsTracking(
                        selectedShipment,
                        currentUser?.id
                      )
                    }
                    disabled={
                      !currentUser?.id ||
                      !ACTIVE_DELIVERY_STATUSES.includes(
                        selectedShipment.status
                      ) ||
                      Number(selectedShipment.assignedOperatorId) !==
                        Number(currentUser?.id) ||
                      gpsTrackingShipmentId != null
                    }
                    aria-label="Start GPS tracking for selected shipment"
                  >
                    <Navigation size={14} />
                    Start GPS Tracking
                  </button>
                  <button
                    type="button"
                    className="driver-filter"
                    onClick={stopGpsTracking}
                    disabled={
                      String(gpsTrackingShipmentId) !==
                      String(selectedShipment.id)
                    }
                    aria-label="Stop GPS tracking for selected shipment"
                  >
                    <Radio size={14} />
                    Stop GPS Tracking
                  </button>
                </div>
              )}
            </div>

            {selectedShipment && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginTop: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span>
                  Delivery destination:{" "}
                  {selectedShipment.receiverAddress || "Not available"}
                </span>
                <span>
                  ETA:{" "}
                  {selectedEta?.expectedCompletionTime &&
                  Number(selectedEta.shipmentId) ===
                    Number(selectedShipment.id) &&
                  Number.isFinite(
                    new Date(selectedEta.expectedCompletionTime).getTime()
                  )
                    ? new Date(
                        selectedEta.expectedCompletionTime
                      ).toLocaleString()
                    : selectedEta?.requestFailed
                      ? "Could not be loaded"
                      : "Not available"}
                </span>
                <span>
                  GPS status:{" "}
                  {gpsTrackingShipmentId != null &&
                  String(gpsTrackingShipmentId) ===
                    String(selectedShipment.id)
                    ? gpsStatus === "active"
                      ? "GPS Active"
                      : gpsStatus === "requesting"
                        ? "Requesting permission..."
                        : gpsStatus === "connecting"
                          ? "Waiting for GPS fix..."
                          : gpsStatus === "error"
                            ? "GPS Error"
                            : "GPS Starting"
                    : "Stopped"}
                </span>
                <span>
                  Last updated:{" "}
                  {gpsLastUpdated &&
                  String(gpsTrackingShipmentId) ===
                    String(selectedShipment.id)
                    ? new Date(gpsLastUpdated).toLocaleString()
                    : "Not updated by live GPS"}
                </span>
              </div>
            )}
            {gpsError && (
              <div
                role="alert"
                style={{ marginTop: "8px", color: "#ff8c96" }}
              >
                {gpsError}
              </div>
            )}

            <div className="driver-map" ref={mapContainerRef}>
              {selectedShipment && hasSelectedLocation ? (
                <MapContainer
                  center={[
                    Number(selectedLocation.latitude),
                    Number(selectedLocation.longitude),
                  ]}
                  zoom={15}
                  scrollWheelZoom
                  style={{ width: "100%", height: "100%" }}
                >
                  <FitMapToPoints
                    points={mapPoints}
                    fitKey={mapFitKey}
                    mapRef={leafletMapRef}
                  />
                  <PanMapToCurrentLocation
                    shipmentId={selectedShipment.id}
                    location={selectedLocation}
                  />
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {selectedRouteCoordinates.length > 1 && (
                    <Polyline
                      positions={selectedRouteCoordinates}
                      pathOptions={{
                        color: "#36dcb0",
                        weight: 6,
                        opacity: 0.9,
                      }}
                    >
                      <Popup>
                        <strong>
                          Actual delivery route:{" "}
                          {selectedShipment.trackingNumber ||
                            `Shipment #${selectedShipment.id}`}
                        </strong>
                        <br />
                        {selectedRoute?.origin} →{" "}
                        {selectedShipment.receiverAddress}
                      </Popup>
                    </Polyline>
                  )}

                  <CircleMarker
                    center={[
                      Number(selectedLocation.latitude),
                      Number(selectedLocation.longitude),
                    ]}
                    radius={10}
                    pathOptions={{
                      color: "#ffffff",
                      weight: 3,
                      fillColor: "#2583ff",
                      fillOpacity: 1,
                    }}
                  >
                    <Popup>
                      <strong>Current Location / Driver</strong>
                      <br />
                      {selectedDriver.name} (Operator ID:{" "}
                      {selectedDriver.operatorId})
                      <br />
                      {selectedLocation.locationName || "Latest GPS location"}
                      <br />
                      <small>
                        {Number(selectedLocation.latitude).toFixed(6)},{" "}
                        {Number(selectedLocation.longitude).toFixed(6)}
                      </small>
                    </Popup>
                  </CircleMarker>

                  {destination && (
                    <CircleMarker
                      center={[destination.latitude, destination.longitude]}
                      radius={10}
                      pathOptions={{
                        color: "#ffffff",
                        weight: 3,
                        fillColor: "#ff8a24",
                        fillOpacity: 1,
                      }}
                    >
                      <Popup>
                        <strong>Delivery Destination</strong>
                        <br />
                        {selectedShipment.receiverAddress || "Not available"}
                      </Popup>
                    </CircleMarker>
                  )}
                </MapContainer>
              ) : (
                <div
                  role={loadError ? "alert" : "status"}
                  style={{
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  {loading
                    ? "Loading shipment tracking..."
                    : loadError
                      ? loadError
                      : !selectedShipment
                        ? "No active assigned shipment is available."
                        : !hasSelectedLocation
                          ? "Current driver GPS location is unavailable."
                          : "Delivery destination coordinates are unavailable."}
                </div>
              )}

              <div className="driver-map-info" style={{ zIndex: 1000 }}>
                <div>
                  <span></span>
                  {loadError
                    ? "Tracking API error"
                    : loading
                      ? "Refreshing shipment tracking"
                      : gpsTrackingShipmentId != null &&
                          String(gpsTrackingShipmentId) ===
                            String(selectedShipment?.id) &&
                          gpsStatus === "active"
                        ? "GPS Active"
                        : hasSelectedLocation
                          ? "Latest backend GPS location"
                        : "Current GPS unavailable"}
                </div>
                <strong>
                  {selectedShipment?.trackingNumber ||
                    (selectedShipment
                      ? `Shipment #${selectedShipment.id}`
                      : "No active shipment selected")}
                </strong>
                <small>
                  {!destination
                    ? "Delivery destination unavailable"
                    : selectedRouteCoordinates.length > 1
                    ? "Actual persisted delivery route"
                    : "Route unavailable"}
                </small>
                <small>{loadError || "Refreshes every 15 seconds"}</small>
              </div>
            </div>
            <div
              aria-label="Map legend"
              style={{
                display: "flex",
                gap: "18px",
                flexWrap: "wrap",
                marginTop: "12px",
                fontSize: "11px",
              }}
            >
              <span>
                <i
                  style={{
                    display: "inline-block",
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "#2583ff",
                    marginRight: "6px",
                  }}
                ></i>
                Current Driver Location
              </span>
              <span>
                <i
                  style={{
                    display: "inline-block",
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "#ff8a24",
                    marginRight: "6px",
                  }}
                ></i>
                Delivery Destination
              </span>
              <span>
                <i
                  style={{
                    display: "inline-block",
                    width: "20px",
                    height: "3px",
                    verticalAlign: "middle",
                    background: "#36dcb0",
                    marginRight: "6px",
                  }}
                ></i>
                Actual Delivery Route
              </span>
            </div>

          </div>


          {/* Driver Status */}

          <div className="driver-status-card">

            <div className="driver-card-header">

              <div>

                <h2>Delivery Progress</h2>

                <p>
                  Shipment statuses from live shipment data
                </p>

              </div>

            </div>


            <div className="driver-status-chart">

              <div
                className="status-ring"
                style={{ background: statusRingBackground }}
              >

                <div>

                  <strong>{shipments.length}</strong>

                  <span>Shipments</span>

                </div>

              </div>


              <div className="status-legend">

                {DELIVERY_STATUSES.map((status, index) => (
                  <div key={status}>
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: STATUS_COLORS[index] }}
                    ></span>
                    <label>{getStatusLabel(status)}</label>
                    <strong>{statusCounts[index]}</strong>
                  </div>
                ))}

              </div>

            </div>


            <div className="driver-performance">

              <div>

                <span>Driver utilization</span>

                <strong>{utilization}%</strong>

              </div>

              <div className="driver-performance-bar">

                <span
                  style={{
                    width: `${utilization}%`,
                  }}
                ></span>

              </div>

            </div>

          </div>

        </section>


        {/* Drivers Table */}

        <section className="drivers-table-card">

          <div className="drivers-table-header">

            <div>

              <h2>Assigned Shipments</h2>

              <p>
              Active delivery assignments first; other assignments are separated below
              </p>

            </div>


            <div className="driver-tools">

              <div className="driver-search">

                <Search size={16} />

                <input
                  type="text"
                  placeholder="Search driver or shipment..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />

              </div>

              <button className="driver-filter">All Drivers</button>

            </div>

          </div>


          <div className="drivers-table-wrapper">

            <table className="drivers-table">

              <thead>

                <tr>

                  <th>DRIVER / OPERATOR</th>
                  <th>SHIPMENT</th>
                  <th>CURRENT LOCATION</th>
                  <th>SPEED</th>
                  <th>ETA</th>
                  <th>STATUS</th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td colSpan="6">

                      <div
                        style={{
                          padding: "30px",
                          textAlign: "center",
                        }}
                      >
                        Loading driver data...
                      </div>

                    </td>

                  </tr>

                ) : orderedFilteredDrivers.length === 0 ? (

                  <tr>

                    <td colSpan="6">

                      <div
                        style={{
                          padding: "30px",
                          textAlign: "center",
                        }}
                      >
                        No assigned shipments found.
                      </div>

                    </td>

                  </tr>

                ) : (

                  orderedFilteredDrivers.map((driver, index) => {

                    const shipment = driver.shipment;
                    const location = driver.location;
                    const status = shipment?.status;
                    const etaValue = driver.eta?.expectedCompletionTime;
                    const etaDate = etaValue ? new Date(etaValue) : null;
                    const etaLabel =
                      driver.eta?.requestFailed
                        ? "ETA could not be loaded"
                        : driver.eta?.shipmentId != null &&
                            Number(driver.eta.shipmentId) === Number(shipment.id) &&
                            etaDate &&
                            Number.isFinite(etaDate.getTime())
                          ? etaDate.toLocaleString()
                          : "Not available";
                    const active = isActiveShipment(shipment);
                    const previousActive =
                      index > 0 &&
                      isActiveShipment(
                        orderedFilteredDrivers[index - 1].shipment
                      );

                    return (
                      <Fragment key={driver.id}>
                        {index === 0 || previousActive !== active ? (
                          <tr>
                            <td colSpan="6">
                              <strong>
                                {active
                                  ? `Active delivery shipments (${activeFilteredDrivers.length})`
                                  : `Other assigned shipments (${otherFilteredDrivers.length})`}
                              </strong>
                            </td>
                          </tr>
                        ) : null}
                        <tr>

                        {/* Driver */}

                        <td>

                          <div className="driver-name-cell">

                            <div className="driver-small-avatar">
                              {getInitials(driver.name)}
                            </div>

                            <div>

                              <strong>
                                {driver.name}
                              </strong>

                              <span>Operator ID: {driver.operatorId}</span>

                            </div>

                          </div>

                        </td>


                        {/* Shipment */}

                        <td>

                          <span className="driver-shipment">
                            {shipment?.trackingNumber ||
                              `Shipment #${shipment?.id || ""}`}
                          </span>

                        </td>


                        {/* Current Location */}

                        <td>

                          <div className="driver-location">

                            <MapPin size={14} />

                            {isValidLocationRecord(
                              location,
                              shipment.assignedOperatorId
                            )
                              ? `${Number(location.latitude).toFixed(6)}, ${Number(
                                  location.longitude
                                ).toFixed(6)}`
                              : "Location unavailable"}

                          </div>

                        </td>


                        {/* Speed */}

                        <td>

                          <div className="driver-speed">

                            <Gauge size={14} />

                            {driver.speedKmh == null
                              ? "Not available"
                              : `${driver.speedKmh.toFixed(1)} km/h`}

                          </div>

                        </td>


                        {/* ETA */}

                        <td>

                          <div className="driver-eta">

                            <Clock3 size={14} />

                            {etaLabel}

                          </div>

                        </td>


                        {/* Status */}

                        <td>

                          <span
                            className={`driver-status ${getStatusClass(
                              status
                            )}`}
                          >

                            <i></i>
                            {status ? getStatusLabel(status) : "Not available"}

                          </span>

                        </td>


                        </tr>
                      </Fragment>
                    );
                  })

                )}

              </tbody>

            </table>

          </div>


          <div className="drivers-footer">

            <span>

              Showing{" "}
              <strong>{filteredDrivers.length}</strong>{" "}
              of{" "}
              <strong>{drivers.length}</strong>{" "}
              assigned shipments

            </span>

            <button>
              View All Drivers →
            </button>

          </div>

        </section>


        {/* Bottom cards */}

        <section
          className="driver-bottom-grid"
          style={{ gridTemplateColumns: "minmax(0, 1fr)" }}
        >
          <div className="driver-bottom-card">

            <div className="bottom-driver-icon purple-icon">

              <Navigation size={21} />

            </div>

            <div>

              <span>GPS Locations Available</span>

              <strong>{trackedLocations}</strong>

              <p>
                Shipments with GPS location data
              </p>

            </div>

          </div>
        </section>

      </main>

    </div>
  );
}

export default DriverTracking;
