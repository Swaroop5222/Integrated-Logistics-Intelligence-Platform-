
import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Phone,
  Gauge,
} from "lucide-react";

import { apiRequest } from "../api";
import "./DriverTracking.css";

const LOCATION_REFRESH_INTERVAL = 15000;

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

function summarizeSpeed(locationHistory) {
  const points = (Array.isArray(locationHistory) ? locationHistory : [])
    .filter((location) => {
      const recordedAt = new Date(location?.recordedAt).getTime();
      return hasCoordinates(location) && Number.isFinite(recordedAt);
    })
    .map((location) => ({
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      recordedAt: new Date(location.recordedAt).getTime(),
    }))
    .sort((first, second) => first.recordedAt - second.recordedAt);

  let distanceKm = 0;
  let elapsedHours = 0;

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
    const distance =
      6371 *
      2 *
      Math.atan2(
        Math.sqrt(boundedHaversine),
        Math.sqrt(1 - boundedHaversine)
      );

    distanceKm += distance;
    elapsedHours += intervalHours;
  }

  return {
    speedKmh: elapsedHours > 0 ? distanceKm / elapsedHours : null,
    distanceKm,
    elapsedHours,
  };
}

function DriverTracking() {
  const [shipments, setShipments] = useState([]);
  const [locations, setLocations] = useState({});
  const [locationHistories, setLocationHistories] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const requestInProgress = useRef(false);
  const mapRef = useRef(null);

  const loadData = useCallback(async (showLoading = false) => {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    if (showLoading) setLoading(true);

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

      setCurrentUser(user);
      setShipments(shipmentList);

      let hasLocationError = false;
      const locationResults = await Promise.all(
        shipmentList.map(async (shipment) => {
          const [locationResult, historyResult] = await Promise.allSettled([
            apiRequest(`/api/shipments/${shipment.id}/location`),
            apiRequest(`/api/shipments/${shipment.id}/location-history`),
          ]);

          if (locationResult.status === "rejected") {
            hasLocationError = true;
            console.error(
              `Failed to load current location for shipment ${shipment.id}:`,
              locationResult.reason
            );
          }

          if (historyResult.status === "rejected") {
            hasLocationError = true;
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
          const currentLocation =
            locationResult.status === "fulfilled"
              ? locationResult.value
              : null;
          const latestHistoryLocation = [...history].sort(
            (first, second) =>
              new Date(second?.recordedAt || 0) -
              new Date(first?.recordedAt || 0)
          )[0];

          return {
            shipmentId: shipment.id,
            location: currentLocation || latestHistoryLocation || null,
            history,
          };
        })
      );

      setLocations(
        Object.fromEntries(
          locationResults.map(({ shipmentId, location }) => [
            shipmentId,
            location,
          ])
        )
      );
      setLocationHistories(
        Object.fromEntries(
          locationResults.map(({ shipmentId, history }) => [
            shipmentId,
            history,
          ])
        )
      );
      setLoadError(
        hasLocationError ? "Some location updates could not be loaded." : ""
      );
    } catch (error) {
      console.error("Failed to load driver tracking data:", error);
      setLoadError("Driver location data could not be refreshed.");
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    loadData(true);
    const refreshTimer = window.setInterval(
      () => loadData(),
      LOCATION_REFRESH_INTERVAL
    );

    return () => window.clearInterval(refreshTimer);
  }, [loadData]);

  const centerMap = () => {
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    loadData();
  };

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

  /*
   * Build drivers from the shipments returned by the backend.
   * One operator can have multiple shipments.
   */
  const drivers = useMemo(() => {
    const grouped = new Map();

    shipments.forEach((shipment) => {
      if (!shipment.assignedOperatorId) {
        return;
      }

      const operatorId = shipment.assignedOperatorId;

      if (!grouped.has(operatorId)) {
        grouped.set(operatorId, {
          id: operatorId,
          name:
            shipment.assignedOperatorName ||
            `Operator #${operatorId}`,
          shipments: [],
        });
      }

      grouped.get(operatorId).shipments.push(shipment);
    });

    return Array.from(grouped.values()).map((driver) => {
      const activeShipments = driver.shipments.filter(
        (shipment) =>
          shipment.status !== "DELIVERED" &&
          shipment.status !== "CANCELLED"
      );
      const candidateShipments =
        activeShipments.length > 0 ? activeShipments : driver.shipments;

      const selectedShipment = [...candidateShipments].sort((first, second) => {
        const firstLocation = locations[first.id];
        const secondLocation = locations[second.id];
        const firstHasLocation = hasCoordinates(firstLocation);
        const secondHasLocation = hasCoordinates(secondLocation);

        if (firstHasLocation !== secondHasLocation) {
          return firstHasLocation ? -1 : 1;
        }

        if (firstHasLocation && secondHasLocation) {
          const locationTimeDifference =
            new Date(secondLocation.recordedAt || 0) -
            new Date(firstLocation.recordedAt || 0);
          if (locationTimeDifference !== 0) return locationTimeDifference;
        }

        return (
          new Date(second.updatedAt || second.createdAt || 0) -
          new Date(first.updatedAt || first.createdAt || 0)
        );
      })[0];
      const speedTotals = driver.shipments.reduce(
        (result, shipment) => {
          const summary = summarizeSpeed(locationHistories[shipment.id]);
          return {
            distanceKm: result.distanceKm + summary.distanceKm,
            elapsedHours: result.elapsedHours + summary.elapsedHours,
          };
        },
        { distanceKm: 0, elapsedHours: 0 }
      );
      const latestLocationShipment = [...driver.shipments]
        .filter((shipment) => hasCoordinates(locations[shipment.id]))
        .sort(
          (first, second) =>
            new Date(locations[second.id]?.recordedAt || 0) -
            new Date(locations[first.id]?.recordedAt || 0)
        )[0];

      return {
        ...driver,
        shipment: selectedShipment,
        location: selectedShipment
          ? locations[selectedShipment.id]
          : null,
        latestLocation: latestLocationShipment
          ? locations[latestLocationShipment.id]
          : null,
        latestLocationShipment,
        speedKmh:
          speedTotals.elapsedHours > 0
            ? speedTotals.distanceKm / speedTotals.elapsedHours
            : null,
      };
    });
  }, [shipments, locations, locationHistories]);

  const activeDrivers = drivers.filter(
    (driver) =>
      driver.shipment &&
      driver.shipment.status !== "DELIVERED" &&
      driver.shipment.status !== "CANCELLED"
  );

  const attentionShipments = shipments.filter(
    (shipment) =>
      shipment.status === "FAILED_DELIVERY" ||
      shipment.status === "CANCELLED"
  );

  const attentionDriverIds = new Set(
    attentionShipments
      .map((shipment) => shipment.assignedOperatorId)
      .filter(Boolean)
  );

  const mapDrivers = drivers.filter(
    (driver) => hasCoordinates(driver.latestLocation)
  );
  const trackedLocations = mapDrivers.length;

  const speedDrivers = drivers.filter(
    (driver) => driver.speedKmh != null
  );
  const averageSpeed =
    speedDrivers.length > 0
      ? speedDrivers.reduce((total, driver) => total + driver.speedKmh, 0) /
        speedDrivers.length
      : null;

  const totalDrivers = drivers.length;
  const onRoadDrivers = activeDrivers.length;
  const attentionDrivers = attentionDriverIds.size;

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
      locationName.includes(query)
    );
  });

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
      return "Unknown";
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

  const getProgress = (status) => {
    switch (status) {
      case "DELIVERED":
        return 100;
      case "OUT_FOR_DELIVERY":
        return 75;
      case "IN_TRANSIT":
        return 50;
      case "PICKED_UP":
        return 25;
      default:
        return 0;
    }
  };

  const mapBounds = mapDrivers.reduce(
    (bounds, driver) => ({
      minLatitude: Math.min(
        bounds.minLatitude,
        Number(driver.latestLocation.latitude)
      ),
      maxLatitude: Math.max(
        bounds.maxLatitude,
        Number(driver.latestLocation.latitude)
      ),
      minLongitude: Math.min(
        bounds.minLongitude,
        Number(driver.latestLocation.longitude)
      ),
      maxLongitude: Math.max(
        bounds.maxLongitude,
        Number(driver.latestLocation.longitude)
      ),
    }),
    {
      minLatitude: Infinity,
      maxLatitude: -Infinity,
      minLongitude: Infinity,
      maxLongitude: -Infinity,
    }
  );

  const getMapPosition = (location) => {
    const latitudeRange =
      mapBounds.maxLatitude - mapBounds.minLatitude;
    const longitudeRange =
      mapBounds.maxLongitude - mapBounds.minLongitude;
    const latitudeRatio =
      latitudeRange > 0
        ? (Number(location.latitude) - mapBounds.minLatitude) /
          latitudeRange
        : 0.5;
    const longitudeRatio =
      longitudeRange > 0
        ? (Number(location.longitude) - mapBounds.minLongitude) /
          longitudeRange
        : 0.5;

    return {
      left: `${10 + longitudeRatio * 80}%`,
      top: `${90 - latitudeRatio * 80}%`,
    };
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
            <b>{activeDrivers.length}</b>
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
                  Monitor driver locations, vehicle movement
                  and delivery progress in real time.
                </p>

              </div>

              <div className="driver-live-badge">
                <span></span>
                LIVE TRACKING
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
              Tracking Active
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


            <div className="driver-map" ref={mapRef}>

              <div className="driver-map-grid"></div>

              <div className="driver-map-road map-road-a"></div>
              <div className="driver-map-road map-road-b"></div>
              <div className="driver-map-road map-road-c"></div>
              <div className="driver-map-road map-road-d"></div>

              {mapDrivers
                .map((driver) => {
                  const position = getMapPosition(driver.latestLocation);

                  return (
                    <div
                      key={driver.id}
                      className="driver-marker"
                      style={{
                        left: position.left,
                        top: position.top,
                      }}
                      title={`${driver.name} - ${
                        driver.latestLocation.locationName ||
                        `${driver.latestLocation.latitude}, ${driver.latestLocation.longitude}`
                      }${
                        driver.latestLocation.recordedAt
                          ? ` (recorded ${driver.latestLocation.recordedAt})`
                          : ""
                      }`}
                    >
                      <Truck size={14} />
                    </div>
                  );
                })}


              <div className="driver-map-info">

                <div>
                  <span></span>
                  {trackedLocations > 0
                    ? "GPS Tracking Active"
                    : "Location unavailable"}
                </div>

                <strong>
                  {trackedLocations} GPS Locations Available
                </strong>

                <small>
                  {loadError || "Refreshes every 15 seconds"}
                </small>

              </div>

            </div>

          </div>


          {/* Driver Status */}

          <div className="driver-status-card">

            <div className="driver-card-header">

              <div>

                <h2>Driver Status</h2>

                <p>
                  Current availability
                </p>

              </div>

            </div>


            <div className="driver-status-chart">

              <div className="status-ring">

                <div>

                  <strong>{totalDrivers}</strong>

                  <span>Drivers</span>

                </div>

              </div>


              <div className="status-legend">

                <div>

                  <span className="legend-dot green-dot"></span>

                  <label>On Road</label>

                  <strong>{onRoadDrivers}</strong>

                </div>


                <div>

                  <span className="legend-dot blue-dot"></span>

                  <label>Available</label>

                  <strong>0</strong>

                </div>


                <div>

                  <span className="legend-dot orange-dot"></span>

                  <label>Break</label>

                  <strong>0</strong>

                </div>


                <div>

                  <span className="legend-dot red-dot"></span>

                  <label>Attention</label>

                  <strong>{attentionDrivers}</strong>

                </div>

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

              <h2>Active Drivers</h2>

              <p>
                Driver information from assigned shipments
              </p>

            </div>


            <div className="driver-tools">

              <div className="driver-search">

                <Search size={16} />

                <input
                  type="text"
                  placeholder="Search driver or vehicle..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />

              </div>

              <button className="driver-filter">
                All Drivers
              </button>

            </div>

          </div>


          <div className="drivers-table-wrapper">

            <table className="drivers-table">

              <thead>

                <tr>

                  <th>DRIVER</th>
                  <th>VEHICLE</th>
                  <th>SHIPMENT</th>
                  <th>CURRENT LOCATION</th>
                  <th>SPEED</th>
                  <th>ETA</th>
                  <th>STATUS</th>
                  <th>ACTION</th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td colSpan="8">

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

                ) : filteredDrivers.length === 0 ? (

                  <tr>

                    <td colSpan="8">

                      <div
                        style={{
                          padding: "30px",
                          textAlign: "center",
                        }}
                      >
                        No drivers found.
                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredDrivers.map((driver) => {

                    const shipment = driver.shipment;
                    const location = driver.location;

                    const status =
                      shipment?.status || "UNKNOWN";

                    return (

                      <tr key={driver.id}>

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

                              <span>
                                Operator ID: {driver.id}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* Vehicle */}

                        <td>

                          <span className="vehicle-number">
                            Not provided
                          </span>

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

                            {location?.locationName ||
                              (location?.latitude != null &&
                              location?.longitude != null
                                ? `${location.latitude}, ${location.longitude}`
                                : "Location unavailable")}

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

                            Not available

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

                            {getStatusLabel(status)}

                          </span>

                        </td>


                        {/* Action */}

                        <td>

                          <button
                            className="call-driver"
                            title="Driver action"
                          >
                            <Phone size={14} />
                          </button>

                        </td>

                      </tr>

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
              drivers currently assigned

            </span>

            <button>
              View All Drivers →
            </button>

          </div>

        </section>


        {/* Bottom cards */}

        <section className="driver-bottom-grid">

          <div className="driver-bottom-card">

            <div className="bottom-driver-icon">

              <CheckCircle2 size={21} />

            </div>

            <div>

              <span>Driver Safety Score</span>

              <strong>Data unavailable</strong>

              <p>
                No safety score in backend
              </p>

            </div>

          </div>


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


          <div className="driver-bottom-card">

            <div className="bottom-driver-icon green-icon">

              <Clock3 size={21} />

            </div>

            <div>

              <span>Avg Driving Time</span>

              <strong>Data unavailable</strong>

              <p>
                No driving-time data in backend
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default DriverTracking;
