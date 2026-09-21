import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

import { apiRequest } from "../api";

import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Package,
  Radio,
  Search,
  Truck,
  UserRound,
  AlertTriangle,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "./OperatorLiveDelivery.css";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function OperatorLiveDelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [locations, setLocations] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);

      const [user, shipments] = await Promise.all([
        apiRequest("/api/users/me"),
        apiRequest("/api/shipments"),
      ]);

      setCurrentUser(user);

      const shipmentList = Array.isArray(shipments) ? shipments : [];
      setDeliveries(shipmentList);

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
      console.error("Failed to load live delivery data:", error);
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

  const activeDeliveries = deliveries.filter(
    (delivery) =>
      delivery.status !== "DELIVERED" &&
      delivery.status !== "CANCELLED"
  );

  const completedDeliveries = deliveries.filter(
    (delivery) => delivery.status === "DELIVERED"
  );

  const delayedDeliveries = deliveries.filter(
    (delivery) =>
      delivery.status === "FAILED_DELIVERY" ||
      delivery.status === "CANCELLED"
  );

  const trackedLocations = Object.values(locations).filter(Boolean).length;

  return (
    <div className="operator-live-page">
      {/* Sidebar */}
      <aside className="operator-live-sidebar">
        <div className="operator-brand">
          <div className="operator-brand-icon">
            <Truck size={22} />
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="operator-role">
          <span className="role-dot"></span>
          Logistics Operator
        </div>

        <nav className="operator-live-nav">
          <Link to="/dashboard/operator">
            <Navigation size={18} />
            Dashboard
          </Link>

          <Link to="/operator/live-delivery" className="active">
            <Radio size={18} />
            Live Deliveries
            <span className="nav-count">{activeDeliveries.length}</span>
          </Link>

          <Link to="/dashboard/operator">
            <Package size={18} />
            Shipment Tracking
          </Link>

          <Link to="/dashboard/operator">
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

        <div className="sidebar-bottom">
          <Link to="/dashboard/operator" className="back-dashboard">
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="operator-user">
            <div className="operator-avatar">{operatorInitials}</div>

            <div>
              <strong>{operatorName}</strong>
              <span>Logistics Operator</span>
            </div>

            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="operator-live-main">
        {/* Header */}
        <header className="operator-live-header">
          <div>
            <div className="page-breadcrumb">
              Operations <span>/</span> Live Deliveries
            </div>

            <div className="page-title-row">
              <div>
                <h1>Live Delivery Monitoring</h1>
                <p>
                  Monitor active deliveries, drivers and real-time shipment
                  movement.
                </p>
              </div>

              <div className="live-indicator">
                <span></span>
                LIVE
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button className="icon-button">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <button
              className="refresh-button"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw size={17} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="live-stats">
          <div className="live-stat-card">
            <div className="stat-icon orange">
              <Truck size={22} />
            </div>

            <div>
              <span>Active Deliveries</span>
              <strong>{activeDeliveries.length}</strong>
              <small>Currently assigned</small>
            </div>
          </div>

          <div className="live-stat-card">
            <div className="stat-icon purple">
              <UserRound size={22} />
            </div>

            <div>
              <span>Drivers On Road</span>
              <strong>
                {
                  new Set(
                    activeDeliveries
                      .map((delivery) => delivery.assignedOperatorId)
                      .filter(Boolean)
                  ).size
                }
              </strong>
              <small>Assigned operators</small>
            </div>
          </div>

          <div className="live-stat-card">
            <div className="stat-icon cyan">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedDeliveries.length}</strong>
              <small>Delivered shipments</small>
            </div>
          </div>

          <div className="live-stat-card">
            <div className="stat-icon red">
              <AlertTriangle size={22} />
            </div>

            <div>
              <span>Attention Required</span>
              <strong>{delayedDeliveries.length}</strong>
              <small className="negative">Failed or cancelled</small>
            </div>
          </div>
        </section>

        {/* Map + Activity */}
        <section className="monitor-grid">
          {/* Map */}
          <div className="live-map-card">
            <div className="card-header">
              <div>
                <h2>Live Fleet Map</h2>
                <p>Real-time vehicle locations</p>
              </div>

              <button className="map-control">
                <Navigation size={16} />
                Center Map
              </button>
            </div>

            <div className="fake-map">
  <MapContainer
    center={[17.385, 78.4867]}
    zoom={6}
    scrollWheelZoom={true}
    style={{
      width: "100%",
      height: "100%",
      minHeight: "420px",
    }}
  >
    <TileLayer
      attribution="&copy; OpenStreetMap contributors"
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {Object.entries(locations).map(
      ([shipmentId, location]) => {
        const latitude = Number(
          location?.currentLocation?.latitude ??
            location?.latitude
        );

        const longitude = Number(
          location?.currentLocation?.longitude ??
            location?.longitude
        );

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          return null;
        }

        const shipment = deliveries.find(
          (item) =>
            String(item.id) === String(shipmentId)
        );

        return (
          <Marker
            key={`marker-${shipmentId}`}
            position={[latitude, longitude]}
          >
            <Popup>
              <strong>
                {shipment?.trackingNumber ||
                  `Shipment #${shipmentId}`}
              </strong>

              <br />

              {shipment?.assignedOperatorName ||
                "Operator"}

              <br />

              {location?.currentLocation?.locationName ||
                location?.locationName ||
                "Current location"}

              <br />

              <small>
                {latitude.toFixed(6)},{" "}
                {longitude.toFixed(6)}
              </small>
            </Popup>
          </Marker>
        );
      }
    )}
  </MapContainer>

  <div className="map-info-box">
    <div>
      <span className="map-live-dot"></span>
      Live tracking active
    </div>

    <strong>{trackedLocations} tracked</strong>

    <small>
      Using shipment location data
    </small>
  </div>
</div>
          </div>

          {/* Alerts */}
          <div className="activity-card">
            <div className="card-header">
              <div>
                <h2>Operational Alerts</h2>
                <p>Requires operator attention</p>
              </div>

              <span className="alert-count">
                {delayedDeliveries.length}
              </span>
            </div>

            <div className="alert-list">
              {delayedDeliveries.length > 0 ? (
                delayedDeliveries.map((delivery) => (
                  <div
                    className="alert-item danger"
                    key={`alert-${delivery.id}`}
                  >
                    <div className="alert-icon">
                      <AlertTriangle size={17} />
                    </div>

                    <div>
                      <strong>Shipment requires attention</strong>

                      <p>
                        {delivery.trackingNumber ||
                          `Shipment #${delivery.id}`}{" "}
                        has status{" "}
                        {(delivery.status || "UNKNOWN").replaceAll(
                          "_",
                          " "
                        )}
                        .
                      </p>

                      <span>
                        {delivery.updatedAt
                          ? new Date(
                              delivery.updatedAt
                            ).toLocaleString()
                          : "Recently updated"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="alert-item success">
                  <div className="alert-icon">
                    <CheckCircle2 size={17} />
                  </div>

                  <div>
                    <strong>No shipment alerts</strong>
                    <p>
                      No failed or cancelled shipments require attention.
                    </p>
                    <span>Current shipment data</span>
                  </div>
                </div>
              )}
            </div>

            <button className="view-alerts">
              View all alerts
            </button>
          </div>
        </section>

        {/* Delivery Table */}
        <section className="delivery-card">
          <div className="delivery-card-header">
            <div>
              <h2>Active Deliveries</h2>
              <p>Currently moving shipments</p>
            </div>

            <div className="delivery-tools">
              <div className="search-box">
                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search shipment or driver..."
                />
              </div>

              <button className="filter-button">
                All Deliveries
              </button>
            </div>
          </div>

          <div className="delivery-table-wrapper">
            <table className="delivery-table">
              <thead>
                <tr>
                  <th>SHIPMENT</th>
                  <th>DRIVER</th>
                  <th>ROUTE</th>
                  <th>CURRENT LOCATION</th>
                  <th>PROGRESS</th>
                  <th>ETA</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div
                        style={{
                          padding: "30px",
                          textAlign: "center",
                        }}
                      >
                        {loading
                          ? "Loading shipments..."
                          : "No shipments found."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  deliveries.map((delivery) => {
                    const progress =
                      delivery.status === "DELIVERED"
                        ? 100
                        : delivery.status === "OUT_FOR_DELIVERY"
                        ? 75
                        : delivery.status === "IN_TRANSIT"
                        ? 50
                        : delivery.status === "PICKED_UP"
                        ? 25
                        : 0;

                    const driverName =
                      delivery.assignedOperatorName || "Operator";

                    const driverInitials = driverName
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase();

                    const currentLocation = locations[delivery.id];

                    return (
                      <tr key={delivery.id}>
                        {/* Shipment */}
                        <td>
                          <div className="shipment-id">
                            <div className="shipment-icon">
                              <Package size={16} />
                            </div>

                            <div>
                              <strong>
                                {delivery.trackingNumber ||
                                  `Shipment #${delivery.id}`}
                              </strong>

                              <span>
                                {delivery.referenceNumber ||
                                  "Shipment"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Driver */}
                        <td>
                          <div className="driver-cell">
                            <div className="small-avatar">
                              {driverInitials}
                            </div>

                            <span>{driverName}</span>
                          </div>
                        </td>

                        {/* Route */}
                        <td>
                          <span className="route-text">
                            {delivery.senderCity ||
                              delivery.senderAddress ||
                              "Pickup"}{" "}
                            →{" "}
                            {delivery.receiverCity ||
                              delivery.receiverAddress ||
                              "Destination"}
                          </span>
                        </td>

                        {/* Current Location */}
                        <td>
                          <div className="location-cell">
                            <MapPin size={15} />

                            {currentLocation?.locationName ||
                              (currentLocation?.latitude != null &&
                              currentLocation?.longitude != null
                                ? `${currentLocation.latitude}, ${currentLocation.longitude}`
                                : "Location unavailable")}
                          </div>
                        </td>

                        {/* Progress */}
                        <td>
                          <div className="progress-cell">
                            <div className="progress-top">
                              <span>
                                {progress}%
                              </span>
                            </div>

                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${progress}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* ETA */}
                        <td>
                          <div className="eta-cell">
                            <Clock3 size={15} />
                            <span>—</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`delivery-status ${
                              delivery.status === "DELIVERED"
                                ? "near"
                                : delivery.status ===
                                    "FAILED_DELIVERY" ||
                                  delivery.status === "CANCELLED"
                                ? "delayed"
                                : "route"
                            }`}
                          >
                            <span></span>

                            {(delivery.status || "UNKNOWN").replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Showing{" "}
              <strong>{deliveries.length}</strong>{" "}
              active deliveries
            </span>

            <button>View All Deliveries →</button>
          </div>
        </section>

        {/* Bottom Cards */}
        <section className="bottom-monitor-grid">
          <div className="mini-monitor-card">
            <div className="mini-card-icon">
              <Navigation size={21} />
            </div>

            <div>
              <span>Tracked Locations</span>
              <strong>{trackedLocations}</strong>
              <p>Shipment locations available</p>
            </div>
          </div>

          <div className="mini-monitor-card">
            <div className="mini-card-icon purple">
              <Radio size={21} />
            </div>

            <div>
              <span>Live Tracking</span>
              <strong>{trackedLocations}</strong>
              <p>Shipments with GPS data</p>
            </div>
          </div>

          <div className="mini-monitor-card">
            <div className="mini-card-icon green">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Successful Deliveries</span>
              <strong>{completedDeliveries.length}</strong>
              <p>Delivered shipments</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OperatorLiveDelivery;