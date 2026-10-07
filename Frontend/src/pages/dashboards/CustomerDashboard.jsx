import {
  ArrowRight,
  Bell,
  CheckCircle2,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "../../api";
import "./CustomerDashboard.css";

const ACTIVE_STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
];

const TRANSIT_STATUSES = [
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
];

function getShipments(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.shipments)) {
    return response.shipments;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function getStatus(shipment) {
  return String(
    shipment?.status ??
      shipment?.shipmentStatus ??
      ""
  ).toUpperCase();
}

function getTrackingNumber(shipment) {
  return (
    shipment?.trackingNumber ??
    shipment?.trackingId ??
    null
  );
}

function getOrigin(shipment) {
  return (
    shipment?.senderAddress ??
    shipment?.origin ??
    shipment?.senderCity ??
    null
  );
}

function getDestination(shipment) {
  return (
    shipment?.receiverAddress ??
    shipment?.destination ??
    shipment?.receiverCity ??
    null
  );
}

function getDisplayName(user) {
  return (
    user?.fullName ??
    user?.name ??
    user?.username ??
    user?.email ??
    "Customer"
  );
}

function getInitials(user) {
  const name = getDisplayName(user);

  if (!name || name === "Customer") {
    return "C";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return parts[0].slice(0, 2).toUpperCase();
}

function formatStatus(status) {
  if (!status) {
    return "Data unavailable";
  }

  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function formatDate(value) {
  if (!value) {
    return "Data unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "Data unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLatestShipmentDate(shipment) {
  return (
    shipment?.updatedAt ??
    shipment?.createdAt ??
    shipment?.createdDate ??
    null
  );
}

function getStatusClass(status) {
  switch (status) {
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
      return "in-transit";

    case "DELIVERED":
      return "delivered";

    case "PICKED_UP":
      return "picked-up";

    default:
      return "in-transit";
  }
}

function getCurrentLocation(locationData) {
  const location =
    locationData?.currentLocation ??
    locationData?.location ??
    null;

  if (!location) {
    return null;
  }

  if (typeof location === "string") {
    return location;
  }

  return (
    location?.locationName ??
    location?.name ??
    location?.address ??
    null
  );
}

function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] =
    useState(null);
  const [locationData, setLocationData] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] =
    useState(false);
  const [error, setError] = useState("");

  /*
   * Load actual backend data.
   */
  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const [
        userResponse,
        shipmentResponse,
      ] = await Promise.all([
        apiRequest("/api/users/me"),
        apiRequest("/api/shipments"),
      ]);

      const backendShipments =
        getShipments(shipmentResponse);

      setUser(userResponse);
      setShipments(backendShipments);

      /*
       * Select an actual active shipment.
       * If none is active, select the latest
       * shipment returned by the backend.
       */
      const activeShipment =
        backendShipments.find((shipment) =>
          ACTIVE_STATUSES.includes(
            getStatus(shipment)
          )
        ) ?? null;

      const latestShipment =
        [...backendShipments]
          .sort((a, b) => {
            const aTime = new Date(
              getLatestShipmentDate(a) || 0
            ).getTime();

            const bTime = new Date(
              getLatestShipmentDate(b) || 0
            ).getTime();

            return bTime - aTime;
          })[0] ?? null;

      setSelectedShipment(
        activeShipment ??
          latestShipment ??
          null
      );
    } catch (err) {
      console.error(
        "Customer Dashboard Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load dashboard data."
      );

      setUser(null);
      setShipments([]);
      setSelectedShipment(null);
      setLocationData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /*
   * Refresh shipment data every 30 seconds.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  /*
   * Refresh when browser tab becomes active.
   */
  useEffect(() => {
    const handleVisibility = () => {
      if (
        document.visibilityState === "visible"
      ) {
        loadDashboard();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [loadDashboard]);

  /*
   * Load actual current location.
   */
  const loadLocation = useCallback(
    async (shipmentId) => {
      if (!shipmentId) {
        setLocationData(null);
        return;
      }

      setLocationLoading(true);

      try {
        const response = await apiRequest(
          `/api/shipments/${shipmentId}/location`
        );

        setLocationData(response);
      } catch (err) {
        console.error(
          "Location API Error:",
          err
        );

        setLocationData(null);
      } finally {
        setLocationLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedShipment?.id) {
      loadLocation(selectedShipment.id);
    } else {
      setLocationData(null);
    }
  }, [
    selectedShipment?.id,
    loadLocation,
  ]);

  /*
   * Refresh live location every 15 seconds.
   */
  useEffect(() => {
    if (!selectedShipment?.id) {
      return undefined;
    }

    const interval = setInterval(() => {
      loadLocation(selectedShipment.id);
    }, 15000);

    return () => clearInterval(interval);
  }, [
    selectedShipment?.id,
    loadLocation,
  ]);

  /*
   * Calculate all dashboard numbers from backend
   * shipment records.
   */
  const metrics = useMemo(() => {
    const total = shipments.length;

    const active = shipments.filter(
      (shipment) =>
        ACTIVE_STATUSES.includes(
          getStatus(shipment)
        )
    ).length;

    const inTransit = shipments.filter(
      (shipment) =>
        TRANSIT_STATUSES.includes(
          getStatus(shipment)
        )
    ).length;

    const delivered = shipments.filter(
      (shipment) =>
        getStatus(shipment) === "DELIVERED"
    ).length;

    return {
      total,
      active,
      inTransit,
      delivered,
    };
  }, [shipments]);

  /*
   * Recent shipments are actual backend shipments.
   */
  const recentShipments = useMemo(() => {
    return [...shipments]
      .sort((a, b) => {
        const aTime = new Date(
          getLatestShipmentDate(a) || 0
        ).getTime();

        const bTime = new Date(
          getLatestShipmentDate(b) || 0
        ).getTime();

        return bTime - aTime;
      })
      .slice(0, 4);
  }, [shipments]);

  const userName = getDisplayName(user);

  const selectedTrackingNumber =
    getTrackingNumber(selectedShipment);

  const selectedStatus = selectedShipment
    ? getStatus(selectedShipment)
    : "";

  const currentLocation =
    getCurrentLocation(locationData);

  if (loading) {
    return (
      <div className="customer-dashboard">
        <main className="customer-main">
          <div
            style={{
              padding: "40px",
              color: "#777e91",
            }}
          >
            Loading dashboard data...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="customer-sidebar">

        <div className="customer-brand">

          <div className="brand-icon">
            <Truck size={22} />
          </div>

          <div>
            <h2>
              LOGISTICS
            </h2>

            <p>
              INTELLIGENCE
            </p>
          </div>

        </div>

        <div className="sidebar-section">

          <div className="sidebar-title">
            MAIN MENU
          </div>

          <nav>

            <Link
              to="/dashboard/customer"
              className="sidebar-link active"
            >
              <span>⌂</span>
              Overview
            </Link>

            <Link
              to="/shipments/active"
              className="sidebar-link"
            >
              <span>▣</span>
              Active Shipments
            </Link>

            <Link
              to="/shipments/history"
              className="sidebar-link"
            >
              <span>◫</span>
              Shipment History
            </Link>

            <Link
              to="/tracking"
              className="sidebar-link"
            >
              <span>◎</span>
              Tracking
            </Link>

            <Link
              to="/notifications"
              className="sidebar-link"
            >
              <span>◉</span>
              Notifications
            </Link>

            <Link
              to="/tracking-insights"
              className="sidebar-link"
            >
              <span>⌁</span>
              Tracking Insights
            </Link>

          </nav>

        </div>

        <div className="sidebar-bottom">

          <Link
            to="/notifications"
            className="help-card"
          >
            <div className="help-icon">
              ?
            </div>

            <div>
              <strong>
                Need help?
              </strong>

              <p>
                We're here for you.
              </p>
            </div>
          </Link>

          <Link
            to="/login"
            className="logout-button"
            onClick={() => {
              localStorage.removeItem(
                "shiptrackToken"
              );

              localStorage.removeItem(
                "shiptrackUser"
              );
            }}
          >
            ↪ Logout
          </Link>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="customer-main">

        {/* ================= TOPBAR ================= */}

        <header className="customer-topbar">

          <div>

            <p className="welcome-small">
              CUSTOMER PORTAL
            </p>

            <h1>
              Good afternoon, {userName}
            </h1>

            <p className="welcome-text">
              Here's what's happening with your
              shipments today.
            </p>

          </div>

          <div className="topbar-actions">

            <Link
              to="/notifications"
              className="top-icon"
              aria-label="Notifications"
            >
              <Bell size={17} />

              <span className="red-dot" />
            </Link>

            <div className="profile">

              <div className="profile-info">

                <strong>
                  {userName}
                </strong>

                <span>
                  CUSTOMER
                </span>

              </div>

              <div className="profile-avatar">
                {getInitials(user)}
              </div>

            </div>

          </div>

        </header>

        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 15px",
              borderRadius: "10px",
              color: "#ff8b78",
              background:
                "rgba(255, 80, 70, 0.08)",
              border:
                "1px solid rgba(255, 80, 70, 0.15)",
              fontSize: "10px",
            }}
          >
            {error}
          </div>
        )}

        {/* ================= STATS ================= */}

        <section className="stats-grid">

          <Link
            to="/shipments/active"
            className="stat-card orange"
          >

            <div className="stat-top">

              <span>
                ACTIVE SHIPMENTS
              </span>

              <div className="stat-icon">
                <Package size={16} />
              </div>

            </div>

            <h2>
              {metrics.active}
            </h2>

            <p>
              Current active shipments
            </p>

          </Link>

          <Link
            to="/tracking"
            className="stat-card purple"
          >

            <div className="stat-top">

              <span>
                IN TRANSIT
              </span>

              <div className="stat-icon">
                <ArrowRight size={16} />
              </div>

            </div>

            <h2>
              {metrics.inTransit}
            </h2>

            <p>
              Currently in transit
            </p>

          </Link>

          <Link
            to="/shipments/history"
            className="stat-card green"
          >

            <div className="stat-top">

              <span>
                DELIVERED
              </span>

              <div className="stat-icon">
                <CheckCircle2 size={16} />
              </div>

            </div>

            <h2>
              {metrics.delivered}
            </h2>

            <p>
              Successfully delivered
            </p>

          </Link>

          <Link
            to="/notifications"
            className="stat-card pink"
          >

            <div className="stat-top">

              <span>
                NOTIFICATIONS
              </span>

              <div className="stat-icon">
                <Bell size={16} />
              </div>

            </div>

            <h2
              style={{
                fontSize: "16px",
                marginTop: "22px",
              }}
            >
              Data unavailable
            </h2>

            <p>
              Notification data not provided
            </p>

          </Link>

        </section>

        {/* ================= MAIN CONTENT ================= */}

        <div className="dashboard-content">

          {/* ================= RECENT SHIPMENTS ================= */}

          <section className="panel">

            <div className="panel-header">

              <div>
                <p className="panel-label">
                  SHIPMENT ACTIVITY
                </p>

                <h2>
                  Recent Shipments
                </h2>
              </div>

              <Link
                to="/shipments/active"
                className="view-all"
              >
                View all →
              </Link>

            </div>

            {recentShipments.length === 0 ? (

              <div
                style={{
                  padding: "40px 22px",
                  color: "#686f81",
                  fontSize: "10px",
                  textAlign: "center",
                }}
              >
                No shipments available.
              </div>

            ) : (

              recentShipments.map(
                (shipment) => {

                  const trackingNumber =
                    getTrackingNumber(
                      shipment
                    );

                  const status =
                    getStatus(shipment);

                  const origin =
                    getOrigin(shipment);

                  const destination =
                    getDestination(shipment);

                  return (
                    <div
                      key={shipment.id}
                      className="shipment-row"
                    >

                      <div className="shipment-main">

                        <div className="shipment-box">
                          <Package size={16} />
                        </div>

                        <div>

                          <strong>
                            {trackingNumber ||
                              "Data unavailable"}
                          </strong>

                          <p>
                            {origin ||
                              "Data unavailable"}
                            {" → "}
                            {destination ||
                              "Data unavailable"}
                          </p>

                        </div>

                      </div>

                      <div className="shipment-date">

                        <span>
                          Created
                        </span>

                        <strong>
                          {formatDate(
                            shipment.createdAt ??
                              shipment.createdDate
                          )}
                        </strong>

                      </div>

                      <div className="shipment-status">

                        <span
                          className={`status-badge ${getStatusClass(
                            status
                          )}`}
                        >
                          <i />
                          {formatStatus(status)}
                        </span>

                        <small>
                          {formatDateTime(
                            shipment.updatedAt
                          )}
                        </small>

                      </div>

                      {trackingNumber ? (

                        <Link
                          to={`/tracking?trackingNumber=${encodeURIComponent(
                            trackingNumber
                          )}`}
                          className="track-arrow"
                        >
                          →
                        </Link>

                      ) : (

                        <span
                          className="track-arrow"
                        >
                          —
                        </span>

                      )}

                    </div>
                  );
                }
              )

            )}

          </section>

          {/* ================= LIVE TRACKING ================= */}

          <section className="panel">

            <div className="panel-header">

              <div>
                <p className="panel-label">
                  LIVE VISIBILITY
                </p>

                <h2>
                  Tracking Insights
                </h2>
              </div>

              {selectedShipment && (
                <span className="live-badge">
                  <i />
                  LIVE
                </span>
              )}

            </div>

            {!selectedShipment ? (

              <div
                style={{
                  padding: "35px 22px",
                  color: "#686f81",
                  fontSize: "10px",
                  textAlign: "center",
                }}
              >
                No shipment available for
                tracking.
              </div>

            ) : (

              <div className="insight-route">

                <div className="location">

                  <div className="location-icon orange-icon">
                    <MapPin size={14} />
                  </div>

                  <div>

                    <span>
                      FROM
                    </span>

                    <strong>
                      {getOrigin(
                        selectedShipment
                      ) ||
                        "Data unavailable"}
                    </strong>

                  </div>

                </div>

                <div className="route-line">

                  <span className="route-dot" />

                  <div className="route-progress" />

                  <span className="route-dot" />

                </div>

                <div className="location destination">

                  <div>

                    <span>
                      TO
                    </span>

                    <strong>
                      {getDestination(
                        selectedShipment
                      ) ||
                        "Data unavailable"}
                    </strong>

                  </div>

                  <div className="location-icon purple-icon">
                    <MapPin size={14} />
                  </div>

                </div>

                <div className="insight-details">

                  <div>

                    <span>
                      TRACKING ID
                    </span>

                    <strong>
                      {selectedTrackingNumber ||
                        "Data unavailable"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      CURRENT STATUS
                    </span>

                    <strong>
                      {formatStatus(
                        selectedStatus
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      CURRENT LOCATION
                    </span>

                    <strong>
                      {locationLoading
                        ? "Loading..."
                        : currentLocation ||
                          "Data unavailable"}
                    </strong>

                  </div>

                </div>

                {selectedTrackingNumber && (
                  <Link
                    to={`/tracking?trackingNumber=${encodeURIComponent(
                      selectedTrackingNumber
                    )}`}
                    className="tracking-button"
                  >
                    Track Shipment →
                  </Link>
                )}

              </div>

            )}

          </section>

        </div>

        {/* ================= LOWER SECTION ================= */}

        <div className="lower-grid">

          {/* Delivery Performance */}

          <section className="panel">

            <div className="panel-header">

              <div>
                <p className="panel-label">
                  OVERVIEW
                </p>

                <h2>
                  Delivery Status
                </h2>
              </div>

              <span className="period">
                Current data
              </span>

            </div>

            <div className="delivery-chart">

              <div className="chart-number">

                <strong>
                  {metrics.total}
                </strong>

                <span>
                  Total shipments
                </span>

              </div>

              <div className="chart-bars">

                <div className="bar-group">
                  <div
                    className="bar"
                    style={{
                      height: `${Math.max(
                        8,
                        metrics.active * 10
                      )}px`,
                    }}
                  />
                  <span>
                    Active
                  </span>
                </div>

                <div className="bar-group">
                  <div
                    className="bar"
                    style={{
                      height: `${Math.max(
                        8,
                        metrics.inTransit * 10
                      )}px`,
                    }}
                  />
                  <span>
                    Transit
                  </span>
                </div>

                <div className="bar-group">
                  <div
                    className="bar"
                    style={{
                      height: `${Math.max(
                        8,
                        metrics.delivered * 10
                      )}px`,
                    }}
                  />
                  <span>
                    Delivered
                  </span>
                </div>

              </div>

            </div>

          </section>

          {/* Notifications */}

          <section className="panel">

            <div className="panel-header">

              <div>
                <p className="panel-label">
                  UPDATES
                </p>

                <h2>
                  Notifications
                </h2>
              </div>

              <Link
                to="/notifications"
                className="notification-number"
              >
                Data unavailable
              </Link>

            </div>

            <div className="notification-item">

              <div className="notification-icon orange-notification">
                i
              </div>

              <div>

                <strong>
                  Notification data unavailable
                </strong>

                <p>
                  The current backend does not
                  provide a notification API for
                  the customer dashboard.
                </p>

                <span>
                  Backend endpoint unavailable
                </span>

              </div>

            </div>

          </section>

        </div>

        {/* ================= FOOTER ================= */}

        <footer className="dashboard-footer">

          <span>
            © 2026 ShipTrack Pro
          </span>

          <span>
            Customer Portal
          </span>

        </footer>

      </main>
    </div>
  );
}

export default CustomerDashboard;