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
    shipment?.packageType ||
    shipment?.packageCategory ||
    shipment?.category ||
    shipment?.shipmentType ||
    "Data unavailable"
  );
}

function getWeight(shipment) {
  const weight =
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
    "Data unavailable"
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

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [loadingShipment, setLoadingShipment] =
    useState(false);

  const [error, setError] = useState("");

  const [locationError, setLocationError] =
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
      setError(
        "Please enter a tracking number."
      );
      return;
    }

    try {
      setLoadingShipment(true);
      setError("");
      setLocationError("");
      setShipment(null);
      setLocation(null);

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

      /*
       * Get current live location.
       */
      if (shipmentData?.id) {
        try {
          const locationData =
            await apiRequest(
              `/api/shipments/${shipmentData.id}/location`
            );

          setLocation(locationData);
        } catch (locationErr) {
          console.warn(
            "Current location unavailable:",
            locationErr
          );

          setLocation(null);

          setLocationError(
            locationErr?.message ||
              "Current location unavailable."
          );
        }
      }
    } catch (err) {
      console.error(
        "Tracking request failed:",
        err
      );

      setShipment(null);
      setLocation(null);

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