
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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

function DriverTracking() {
  const [shipments, setShipments] = useState([]);
  const [locations, setLocations] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [user, shipmentData] = await Promise.all([
        apiRequest("/api/users/me"),
        apiRequest("/api/shipments"),
      ]);

      const shipmentList = Array.isArray(shipmentData)
        ? shipmentData
        : [];

      setCurrentUser(user);
      setShipments(shipmentList);

      const locationResults = await Promise.all(
        shipmentList.map(async (shipment) => {
          try {
            const location = await apiRequest(
              `/api/shipments/${shipment.id}/location`
            );

            return [shipment.id, location];
          } catch (error) {
            console.error(
              `Location unavailable for shipment ${shipment.id}:`,
              error
            );

            return [shipment.id, null];
          }
        })
      );

      setLocations(Object.fromEntries(locationResults));
    } catch (error) {
      console.error("Failed to load driver tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      const activeShipment = driver.shipments.find(
        (shipment) =>
          shipment.status !== "DELIVERED" &&
          shipment.status !== "CANCELLED"
      );

      const selectedShipment =
        activeShipment ||
        [...driver.shipments].sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.createdAt || 0)
        )[0];

      return {
        ...driver,
        shipment: selectedShipment,
        location: selectedShipment
          ? locations[selectedShipment.id]
          : null,
      };
    });
  }, [shipments, locations]);

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

  const trackedLocations = Object.values(locations).filter(
    (location) =>
      location &&
      location.latitude != null &&
      location.longitude != null
  ).length;

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

  /*
   * Convert actual GPS coordinates into positions
   * on the existing decorative map.
   */
  const getMapPosition = (location) => {
    if (
      !location ||
      location.latitude == null ||
      location.longitude == null
    ) {
      return null;
    }

    const minLat = 8;
    const maxLat = 21;
    const minLng = 72;
    const maxLng = 88;

    const left =
      ((location.longitude - minLng) /
        (maxLng - minLng)) *
      100;

    const top =
      ((maxLat - location.latitude) /
        (maxLat - minLat)) *
      100;

    return {
      left: `${Math.max(5, Math.min(95, left))}%`,
      top: `${Math.max(8, Math.min(92, top))}%`,
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

              <strong>Not available</strong>

              <small>
                Speed data unavailable
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

              <button className="center-driver-map">
                <Navigation size={15} />
                Center Map
              </button>

            </div>


            <div className="driver-map">

              <div className="driver-map-grid"></div>

              <div className="driver-map-road map-road-a"></div>
              <div className="driver-map-road map-road-b"></div>
              <div className="driver-map-road map-road-c"></div>
              <div className="driver-map-road map-road-d"></div>


              <div className="driver-city hyd-city">
                <span></span>
                Hyderabad
              </div>

              <div className="driver-city blr-city">
                <span></span>
                Bengaluru
              </div>

              <div className="driver-city mum-city">
                <span></span>
                Mumbai
              </div>

              <div className="driver-city chn-city">
                <span></span>
                Chennai
              </div>


              {/* Real backend GPS markers */}

              {drivers
                .filter((driver) => driver.location)
                .map((driver) => {

                  const position = getMapPosition(
                    driver.location
                  );

                  if (!position) {
                    return null;
                  }

                  return (
                    <div
                      key={driver.id}
                      className="driver-marker"
                      style={{
                        left: position.left,
                        top: position.top,
                      }}
                      title={`${driver.name} - ${
                        driver.location.locationName ||
                        "GPS location"
                      }`}
                    >
                      <Truck size={14} />
                    </div>
                  );
                })}


              <div className="driver-map-info">

                <div>
                  <span></span>
                  GPS Tracking Active
                </div>

                <strong>
                  {trackedLocations} GPS Locations Available
                </strong>

                <small>
                  Based on shipment tracking data
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

                            Not available

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
