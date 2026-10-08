import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Tracking.css";
import { apiRequest } from "../api";

/* =========================
   USER HELPERS
========================= */

function getUserName(user) {
  return (
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email ||
    "User"
  );
}

function getUserInitials(user) {
  const name = getUserName(user);

  if (!name || name === "User") {
    return "U";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

/* =========================
   SHIPMENT HELPERS
========================= */

function getStatus(shipment) {
  return String(shipment?.status || "").toUpperCase();
}

function formatStatus(status) {
  if (!status) {
    return "Data unavailable";
  }

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getTrackingNumber(shipment) {
  return (
    shipment?.trackingNumber ||
    shipment?.trackingId ||
    "Data unavailable"
  );
}

function getOrigin(shipment) {
  return (
    shipment?.senderAddress ||
    shipment?.senderCity ||
    shipment?.origin ||
    "Data unavailable"
  );
}

function getDestination(shipment) {
  return (
    shipment?.receiverAddress ||
    shipment?.receiverCity ||
    shipment?.destination ||
    "Data unavailable"
  );
}

function getPackageType(shipment) {
  return (
    shipment?.packageDescription ||
    shipment?.packageType ||
    shipment?.packageCategory ||
    shipment?.category ||
    shipment?.shipmentType ||
    "Data unavailable"
  );
}

function getWeight(shipment) {
  const weight =
    shipment?.packageWeightKg ??
    shipment?.weight ??
    shipment?.packageWeight ??
    shipment?.weightKg;

  if (
    weight === undefined ||
    weight === null ||
    weight === ""
  ) {
    return "Data unavailable";
  }

  return `${weight} kg`;
}

function getOperatorName(shipment) {
  return (
    shipment?.assignedOperator?.name ||
    shipment?.assignedOperatorName ||
    shipment?.operatorName ||
    "Data unavailable"
  );
}

function getPriority(shipment) {
  return (
    shipment?.priority ||
    shipment?.deliveryPriority ||
    (shipment?.assignedOperatorName
      ? "Assigned operator"
      : "Operator assignment unavailable")
  );
}

/* =========================
   DATE / TIME
========================= */

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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================
   LOCATION HELPERS
========================= */

function getCurrentLocation(locationData) {
  if (!locationData) {
    return null;
  }

  return (
    locationData?.currentLocation ||
    locationData
  );
}

function getLocationName(locationData) {
  const current =
    getCurrentLocation(locationData);

  return (
    current?.locationName ||
    current?.location_name ||
    locationData?.locationName ||
    locationData?.location_name ||
    (Number.isFinite(Number(current?.latitude)) &&
    Number.isFinite(Number(current?.longitude))
      ? `${Number(current.latitude).toFixed(5)}, ${Number(current.longitude).toFixed(5)}`
      : null) ||
    "Data unavailable"
  );
}

function getLatitude(locationData) {
  const current =
    getCurrentLocation(locationData);

  return (
    current?.latitude ??
    locationData?.latitude ??
    null
  );
}

function getLongitude(locationData) {
  const current =
    getCurrentLocation(locationData);

  return (
    current?.longitude ??
    locationData?.longitude ??
    null
  );
}

/* =========================
   TIMELINE
========================= */

const TIMELINE_STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function getTimelineSteps(shipment) {
  const currentStatus = getStatus(shipment);

  const currentIndex =
    TIMELINE_STATUSES.indexOf(currentStatus);

  return TIMELINE_STATUSES.map(
    (timelineStatus, index) => {
      let state = "";

      if (
        currentStatus === "CANCELLED" ||
        currentStatus === "FAILED_DELIVERY"
      ) {
        if (index <= currentIndex) {
          state = "completed";
        }

        if (index === 0) {
          state = "completed";
        }
      } else if (
        currentIndex >= 0 &&
        index < currentIndex
      ) {
        state = "completed";
      } else if (
        currentIndex >= 0 &&
        index === currentIndex
      ) {
        state = "current";
      }

      return {
        status: timelineStatus,
        state,
      };
    }
  );
}

/* =========================
   COMPONENT
========================= */

function Tracking() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const urlTrackingNumber =
    searchParams.get("trackingNumber") || "";

  const [user, setUser] = useState(null);

  const [trackingNumber, setTrackingNumber] =
    useState(urlTrackingNumber);

  const [shipment, setShipment] = useState(null);

  const [location, setLocation] = useState(null);
  const [shipmentHistory, setShipmentHistory] = useState([]);
  const [eta, setEta] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [proofOfDelivery, setProofOfDelivery] = useState(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [loadingShipment, setLoadingShipment] =
    useState(false);

  const [error, setError] = useState("");

  const [locationError, setLocationError] =
    useState("");

  const [detailsWarning, setDetailsWarning] =
    useState("");

  /* =========================
     LOAD LOGGED-IN USER
  ========================= */

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        setLoadingUser(true);

        const userData =
          await apiRequest("/api/users/me");

        if (!active) return;

        setUser(userData);
      } catch (err) {
        console.error(
          "Failed to load logged-in user:",
          err
        );
      } finally {
        if (active) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  /* =========================
     TRACK SHIPMENT
  ========================= */

  async function trackShipment(number) {
    const cleanNumber =
      String(number || "").trim();

    if (!cleanNumber) {
      setShipment(null);
      setLocation(null);
      setShipmentHistory([]);
      setEta(null);
      setForecasts([]);
      setProofOfDelivery(null);
      setDetailsWarning("");
      setError(
        "Please enter a tracking number."
      );
      return;
    }

    try {
      setLoadingShipment(true);
      setError("");
      setLocationError("");
      setDetailsWarning("");
      setShipment(null);
      setLocation(null);
      setShipmentHistory([]);
      setEta(null);
      setForecasts([]);
      setProofOfDelivery(null);

      setTrackingNumber(cleanNumber);

      setSearchParams({
        trackingNumber: cleanNumber,
      });

      /*
       * Existing backend endpoint:
       * GET /api/shipments/track/{trackingNumber}
       */
      const shipmentData =
        await apiRequest(
          `/api/shipments/track/${encodeURIComponent(
            cleanNumber
          )}`
        );

      setShipment(shipmentData);

      if (shipmentData?.id) {
        const shipmentId = shipmentData.id;
        const terminalStatus = [
          "DELIVERED",
          "CANCELLED",
          "FAILED_DELIVERY",
        ].includes(
          String(shipmentData.status || "").toUpperCase()
        );
        const optionalResults = await Promise.allSettled([
          apiRequest(`/api/shipments/${shipmentId}/location`),
          apiRequest(`/api/shipments/${shipmentId}/history`),
          terminalStatus
            ? Promise.resolve(null)
            : apiRequest(`/api/routes/shipment/${shipmentId}`),
          apiRequest(`/api/forecasts/shipment/${shipmentId}`),
          apiRequest(`/api/shipments/${shipmentId}/pod`),
        ]);
        const [
          locationResult,
          historyResult,
          routeResult,
          forecastResult,
          podResult,
        ] = optionalResults;
        const failedRequests = optionalResults.filter(
          (result) =>
            result.status === "rejected" &&
            result.reason?.status !== 404
        );

        if (failedRequests.length > 0) {
          console.error(
            "Some shipment tracking details could not be loaded:",
            failedRequests.map((result) => result.reason)
          );
          setDetailsWarning(
            "Some tracking details could not be loaded."
          );
        }

        if (locationResult.status === "fulfilled") {
          setLocation(locationResult.value);
        } else {
          setLocation(null);
          setLocationError(
            locationResult.reason?.message ||
              "Current location unavailable."
          );
        }

        if (
          historyResult.status === "fulfilled" &&
          Array.isArray(historyResult.value)
        ) {
          setShipmentHistory(historyResult.value);
        }

        if (
          forecastResult.status === "fulfilled" &&
          Array.isArray(forecastResult.value)
        ) {
          setForecasts(forecastResult.value);
        }

        if (podResult.status === "fulfilled") {
          setProofOfDelivery(podResult.value);
        }

        const route =
          routeResult.status === "fulfilled"
            ? routeResult.value
            : null;

        if (
          route?.destinationLatitude != null &&
          route?.destinationLongitude != null &&
          !terminalStatus
        ) {
          try {
            const etaData = await apiRequest(
              `/api/shipments/${shipmentId}/eta`,
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

            setEta(etaData);
          } catch (etaErr) {
            console.error(
              "Failed to load shipment ETA:",
              etaErr
            );
            setDetailsWarning(
              "Some tracking details could not be loaded."
            );
          }
        }
      }
    } catch (err) {
      console.error(
        "Tracking request failed:",
        err
      );

      setShipment(null);
      setLocation(null);
      setShipmentHistory([]);
      setEta(null);
      setForecasts([]);
      setProofOfDelivery(null);

      setError(
        err?.message ||
          `No active shipment was found for tracking ID: ${cleanNumber}.`
      );
    } finally {
      setLoadingShipment(false);
    }
  }

  /* =========================
     AUTO TRACK URL NUMBER
  ========================= */

  useEffect(() => {
    if (!urlTrackingNumber) {
      return;
    }

    trackShipment(urlTrackingNumber);

    // Run only when page initially loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     SEARCH SUBMIT
  ========================= */

  function handleSubmit(event) {
    event.preventDefault();

    trackShipment(trackingNumber);
  }

  const status = getStatus(shipment);
  const isTerminalStatus = [
    "DELIVERED",
    "CANCELLED",
    "FAILED_DELIVERY",
  ].includes(status);

  const formattedStatus =
    formatStatus(status);

  const locationName =
    getLocationName(location);

  const latitude =
    getLatitude(location);

  const longitude =
    getLongitude(location);

  const hasCoordinates =
    latitude !== null &&
    longitude !== null;

  const timeline =
    shipment
      ? getTimelineSteps(shipment)
      : [];

  const latestForecast = [...forecasts].sort(
    (left, right) =>
      new Date(right.createdAt || 0) -
      new Date(left.createdAt || 0)
  )[0] || null;

  return (
    <div className="tracking-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="tracking-sidebar">
        <div className="tracking-logo">
          <div className="tracking-logo-icon">
            S
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="tracking-menu-title">
          CUSTOMER
        </div>

        <nav>
          <Link
            to="/dashboard/customer"
            className="tracking-nav-link"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/shipments/active"
            className="tracking-nav-link"
          >
            <span>▣</span>
            Active Shipments
          </Link>

          <Link
            to="/shipments/history"
            className="tracking-nav-link"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/tracking"
            className="tracking-nav-link active"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/notifications"
            className="tracking-nav-link"
          >
            <span>♢</span>
            Notifications
          </Link>

          <Link
            to="/tracking-insights"
            className="tracking-nav-link"
          >
            <span>▥</span>
            Tracking Insights
          </Link>
        </nav>

        <div className="tracking-sidebar-bottom">
          <Link
            to="/login"
            className="tracking-logout"
          >
            ⇥ Logout
          </Link>
        </div>
      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="tracking-main">

        {/* HEADER */}

        <header className="tracking-header">
          <div>
            <div className="tracking-breadcrumb">
              Customer / Tracking
            </div>

            <h1>Track Shipment</h1>

            <p>
              Follow your shipment location, delivery
              status and ETA.
            </p>
          </div>

          {/* DYNAMIC USER */}

          <div
            className="tracking-avatar"
            title={getUserName(user)}
          >
            {loadingUser
              ? "..."
              : getUserInitials(user)}
          </div>
        </header>

        {/* =========================
            SEARCH
        ========================= */}

        <section className="tracking-search-card">
          <div>
            <div className="tracking-search-label">
              TRACKING NUMBER
            </div>

            <h2>
              Track your shipment
            </h2>
          </div>

          <form
            className="tracking-search-form"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={trackingNumber}
              onChange={(event) =>
                setTrackingNumber(
                  event.target.value
                )
              }
              placeholder="Enter tracking number"
            />

            <button
              type="submit"
              disabled={loadingShipment}
            >
              {loadingShipment
                ? "Tracking..."
                : "Track Shipment"}
            </button>
          </form>
        </section>

        {/* =========================
            ERROR / NOT FOUND
        ========================= */}

        {error && (
          <section className="tracking-panel">

            <div className="tracking-panel-header">
              <div>
                <span>TRACKING NUMBER</span>

                <h2>
                  {trackingNumber ||
                    "Data unavailable"}
                </h2>
              </div>
            </div>

            <div className="tracking-current-status">
              <div className="tracking-status-icon">
                !
              </div>

              <div>
                <span>
                  SHIPMENT NOT FOUND
                </span>

                <h2>
                  Shipment Not Found
                </h2>

                <p>{error}</p>
              </div>
            </div>

          </section>
        )}

        {/* =========================
            SHIPMENT PANEL
        ========================= */}

        {shipment && !error && (
          <>
            <section className="tracking-panel">

              {/* PANEL HEADER */}

              <div className="tracking-panel-header">
                <div>
                  <span>
                    TRACKING NUMBER
                  </span>

                  <h2>
                    {getTrackingNumber(
                      shipment
                    )}
                  </h2>
                </div>

                {status !==
                  "DELIVERED" &&
                  status !==
                    "CANCELLED" &&
                  status !==
                    "FAILED_DELIVERY" && (
                    <div className="tracking-live">
                      <span />
                      LIVE TRACKING
                    </div>
                  )}
              </div>

              {/* CURRENT STATUS */}

              <div className="tracking-current-status">

                <div className="tracking-status-icon">
                  ✓
                </div>

                <div>
                  <span>
                    CURRENT STATUS
                  </span>

                  <h2>
                    {formattedStatus}
                  </h2>

                  <p>
                    Tracking information from
                    your shipment.
                  </p>
                </div>

                <div className="tracking-eta">
                  <span>
                    CURRENT LOCATION
                  </span>

                  <strong>
                    {locationName}
                  </strong>

                  <small>
                    {hasCoordinates
                      ? `${latitude}, ${longitude}`
                      : "Location coordinates unavailable"}
                  </small>
                </div>

              </div>

              {/* LOCATION ERROR */}

              {locationError && (
                <div
                  style={{
                    padding:
                      "0 25px 20px",
                    color: "#777f91",
                    fontSize: "11px",
                  }}
                >
                  {locationError}
                </div>
              )}

              {detailsWarning && (
                <div
                  role="status"
                  style={{
                    padding: "0 25px 20px",
                    color: "#ffb36b",
                    fontSize: "11px",
                  }}
                >
                  {detailsWarning}
                </div>
              )}

              {/* TIMELINE */}

              <div className="tracking-timeline">

                {timeline.map(
                  (step, index) => (
                    <div key={step.status}>

                      <div
                        className={`timeline-step ${step.state}`}
                      >
                        <div className="timeline-dot">
                          {step.state ===
                          "completed"
                            ? "✓"
                            : index + 1}
                        </div>

                        <div>
                          <strong>
                            {formatStatus(
                              step.status
                            )}
                          </strong>

                          <span>
                            {step.status ===
                            status
                              ? "Current shipment status"
                              : step.state ===
                                "completed"
                              ? "Completed"
                              : "Pending"}
                          </span>
                        </div>
                      </div>

                      {index <
                        timeline.length - 1 && (
                        <div className="timeline-line" />
                      )}

                    </div>
                  )
                )}

                {(
                  status ===
                    "CANCELLED" ||
                  status ===
                    "FAILED_DELIVERY"
                ) && (
                  <>
                    <div className="timeline-line" />

                    <div className="timeline-step current">
                      <div className="timeline-dot">
                        !
                      </div>

                      <div>
                        <strong>
                          {formattedStatus}
                        </strong>

                        <span>
                          Current shipment status
                        </span>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </section>

            {shipmentHistory.length > 0 && (
              <section className="tracking-history-panel">
                <h2>Shipment history</h2>
                <ol>
                  {[...shipmentHistory]
                    .sort(
                      (left, right) =>
                        new Date(left.createdAt || 0) -
                        new Date(right.createdAt || 0)
                    )
                    .map((event, index) => (
                      <li key={`${event.id || event.createdAt || "status"}-${index}`}>
                        <strong>{formatStatus(event.status)}</strong>
                        <span>{formatDateTime(event.createdAt)}</span>
                        {event.remarks && <small>{event.remarks}</small>}
                      </li>
                    ))}
                </ol>
              </section>
            )}

            {/* =========================
                DETAILS
            ========================= */}

            <div className="tracking-details-grid">

              <div className="tracking-detail-card">
                <span>ORIGIN</span>

                <strong>
                  {getOrigin(shipment)}
                </strong>

                <small>
                  Sender
                </small>
              </div>

              <div className="tracking-detail-card">
                <span>DESTINATION</span>

                <strong>
                  {getDestination(
                    shipment
                  )}
                </strong>

                <small>
                  Receiver
                </small>
              </div>

              <div className="tracking-detail-card">
                <span>PACKAGE</span>

                <strong>
                  {getPackageType(
                    shipment
                  )}
                </strong>

                <small>
                  {getWeight(shipment)}
                </small>
              </div>

              <div className="tracking-detail-card">
                <span>OPERATOR</span>

                <strong>
                  {getOperatorName(
                    shipment
                  )}
                </strong>

                <small>
                  {getPriority(shipment)}
                </small>
              </div>

              <div className="tracking-detail-card">
                <span>ESTIMATED DELIVERY</span>
                <strong>
                  {formatDateTime(eta?.expectedCompletionTime)}
                </strong>
                <small>
                  {eta?.predictedDelayHours != null
                    ? `${eta.predictedDelayHours} predicted delay hours`
                    : "No live ETA available"}
                </small>
              </div>

              <div className="tracking-detail-card">
                <span>DELIVERY FORECAST</span>
                <strong>
                  {isTerminalStatus
                    ? "Not applicable"
                    : formatDateTime(
                        latestForecast?.predictedDeliveryTime
                      )}
                </strong>
                <small>
                  {isTerminalStatus
                    ? `Shipment is ${formattedStatus.toLowerCase()}`
                    : latestForecast?.predictedStatus
                    ? `Predicted status: ${formatStatus(
                        latestForecast.predictedStatus
                      )}`
                    : "No saved forecast available"}
                </small>
              </div>

              <div className="tracking-detail-card">
                <span>PROOF OF DELIVERY</span>
                <strong>
                  {proofOfDelivery
                    ? "Recorded"
                    : status === "DELIVERED"
                    ? "Unavailable"
                    : "Pending delivery"}
                </strong>
                <small>
                  {proofOfDelivery
                    ? formatDateTime(proofOfDelivery.deliveredAt)
                    : status === "DELIVERED"
                    ? "No proof of delivery record is available"
                    : "Available after delivery"}
                </small>
                {proofOfDelivery?.signature?.startsWith(
                  "data:image/"
                ) && (
                  <img
                    src={proofOfDelivery.signature}
                    alt="Proof of delivery signature"
                    style={{
                      display: "block",
                      marginTop: "10px",
                      maxWidth: "100%",
                      maxHeight: "80px",
                      objectFit: "contain",
                    }}
                  />
                )}
              </div>

            </div>
          </>
        )}

        {/* =========================
            INITIAL STATE
        ========================= */}

        {!shipment &&
          !error &&
          !loadingShipment && (
            <section className="tracking-panel">

              <div className="tracking-panel-header">
                <div>
                  <span>
                    TRACKING
                  </span>

                  <h2>
                    Where is your shipment?
                  </h2>
                </div>
              </div>

              <div className="tracking-current-status">
                <div className="tracking-status-icon">
                  ⌖
                </div>

                <div>
                  <span>
                    ENTER A TRACKING NUMBER
                  </span>

                  <h2>
                    Track Shipment
                  </h2>

                  <p>
                    Enter a valid ShipTrack
                    tracking number above to
                    view shipment information.
                  </p>
                </div>
              </div>

            </section>
          )}

        {/* FOOTER */}

        <footer className="tracking-footer">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>

      </main>
    </div>
  );
}

export default Tracking;