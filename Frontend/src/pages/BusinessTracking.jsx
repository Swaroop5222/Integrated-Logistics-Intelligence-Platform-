import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./BusinessTracking.css";
import { apiRequest } from "../api";

const TERMINAL_STATUSES = [
  "DELIVERED",
  "CANCELLED",
  "FAILED_DELIVERY",
];

function formatHours(value) {
  const hours = Number(value);
  return Number.isFinite(hours)
    ? `${hours.toFixed(2)} hours`
    : "Data unavailable";
}

function formatConfidence(value) {
  const confidence = Number(value);
  if (!Number.isFinite(confidence)) return "";
  const percent = confidence <= 1 ? confidence * 100 : confidence;
  return ` (${Math.round(percent)}% confidence)`;
}

function BusinessTracking() {
  const [searchParams] = useSearchParams();

  const initialTracking = searchParams.get("trackingNumber") || "";

  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [searchedTracking, setSearchedTracking] = useState(initialTracking);
  const [liveShipment, setLiveShipment] = useState(null);
  const [user, setUser] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [trackingWarning, setTrackingWarning] = useState("");
  const [trackingState, setTrackingState] = useState(
    initialTracking ? "loading" : "idle"
  );

  useEffect(() => {
    let active = true;

    apiRequest("/api/users/me")
      .then((data) => {
        if (active) setUser(data);
      })
      .catch((error) => {
        console.error("Failed to load business profile:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchLiveShipment() {
      if (!searchedTracking.trim()) {
        setTrackingState("idle");
        setLiveShipment(null);
        setSearchError("");
        setTrackingWarning("");
        return;
      }

      setTrackingState("loading");
      setSearchError("");
      setTrackingWarning("");

      try {
        const data = await apiRequest(
          `/api/shipments/track/${encodeURIComponent(searchedTracking.trim())}`
        );

        if (!active) return;

        const shipmentId = data.id;
        const optionalRequests = await Promise.allSettled([
          apiRequest(`/api/shipments/${shipmentId}/history`),
          apiRequest(`/api/shipments/${shipmentId}/location`),
          apiRequest(`/api/shipments/${shipmentId}/location-history`),
          apiRequest(`/api/shipments/${shipmentId}/tracking`),
          apiRequest(`/api/routes/shipment/${shipmentId}`),
          apiRequest(`/api/forecasts/shipment/${shipmentId}`),
        ]);

        if (!active) return;

        const failedOptionalRequests = optionalRequests.filter(
          (result) =>
            result.status === "rejected" &&
            result.reason?.status !== 404
        );
        if (failedOptionalRequests.length > 0) {
          console.error(
            "Failed to load optional tracking details:",
            failedOptionalRequests.map((result) => result.reason)
          );
        }

        const [historyResult, locationResult, locationHistoryResult,
          trackingResult, routeResult, forecastResult] = optionalRequests;
        const history = historyResult.status === "fulfilled" &&
          Array.isArray(historyResult.value) ? historyResult.value : [];
        const location = locationResult.status === "fulfilled"
          ? locationResult.value : null;
        const locationHistory = locationHistoryResult.status === "fulfilled" &&
          Array.isArray(locationHistoryResult.value) ? locationHistoryResult.value : [];
        const tracking = trackingResult.status === "fulfilled"
          ? trackingResult.value : null;
        let route = routeResult.status === "fulfilled"
          ? routeResult.value : null;
        let routeFailed = false;
        if (!route && routeResult.status === "rejected" &&
            routeResult.reason?.status === 404) {
          try {
            route = await apiRequest(
              `/api/routes/shipment/${shipmentId}/calculate`,
              { method: "POST" }
            );
          } catch (routeError) {
            routeFailed = true;
            console.error("Failed to calculate shipment route:", routeError);
          }
        }

        let forecasts = forecastResult.status === "fulfilled" &&
          Array.isArray(forecastResult.value) ? forecastResult.value : [];
        let forecastFailed = false;
        if (forecasts.length === 0) {
          try {
            const forecast = await apiRequest(
              `/api/forecasts/generate?shipmentId=${shipmentId}`,
              { method: "POST" }
            );
            if (forecast) forecasts = [forecast];
          } catch (forecastError) {
            forecastFailed = true;
            console.error("Failed to generate shipment forecast:", forecastError);
          }
        }

        const etaResult = route?.destinationLatitude != null &&
          route?.destinationLongitude != null &&
          !TERMINAL_STATUSES.includes(data.status)
          ? await Promise.allSettled([
              apiRequest(`/api/shipments/${shipmentId}/eta`, {
                method: "POST",
                body: JSON.stringify({
                  destination: {
                    latitude: route.destinationLatitude,
                    longitude: route.destinationLongitude,
                  },
                }),
              }),
            ])
          : [];

        const eta = etaResult[0]?.status === "fulfilled"
          ? etaResult[0].value : null;
        const etaFailed = etaResult[0]?.status === "rejected";
        if (etaFailed) {
          console.error(
            "Failed to load shipment ETA:",
            etaResult[0].reason
          );
        }
        if (
          failedOptionalRequests.length > 0 ||
          routeFailed ||
          forecastFailed ||
          etaFailed
        ) {
          setTrackingWarning(
            "Some tracking details could not be loaded."
          );
        }
        const currentLocation = location ||
          tracking?.currentLocation ||
          null;
        const events = [
          ...history.map((item) => ({
            at: item.createdAt,
            title: item.status
              ? `Status: ${String(item.status).replaceAll("_", " ")}`
              : null,
            detail: item.remarks || item.updatedByName,
          })),
          ...locationHistory.map((item) => ({
            at: item.recordedAt,
            title: item.locationName,
            detail: item.recordedByOperatorName,
          })),
        ]
          .filter((event) => event.title || event.detail)
          .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
          .map((event, index) => ({
            ...event,
            date: event.at ? new Date(event.at).toLocaleDateString() : "",
            time: event.at ? new Date(event.at).toLocaleTimeString() : "",
            active: index === 0,
          }));

        setLiveShipment({
          ...data,
          currentLocation,
          locationHistory,
          route,
          eta,
          forecasts,
          events,
        });
        setTrackingState("found");
      } catch {
        if (active) {
          setLiveShipment(null);
          setTrackingState("notfound");
          setTrackingWarning("");
          setSearchError(
            "Shipment could not be loaded. It may not exist or you may not have permission to view it."
          );
        }
      }
    }

    fetchLiveShipment();

    return () => {
      active = false;
    };
  }, [searchedTracking]);

  const shipment = liveShipment;
  const userName =
    user?.fullName || user?.name || user?.email || "Business Client";

  const handleSearch = (e) => {
    e.preventDefault();

    const value = trackingNumber.trim().toUpperCase();

    if (!value) {
      setSearchError("Enter a tracking number.");
      setTrackingState("idle");
      setLiveShipment(null);
      return;
    }

    setSearchedTracking(value);
  };

  return (
    <div className="business-tracking-page">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

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

          <Link
            to="/dashboard/business"
            className="business-nav-link"
          >
            <span className="nav-icon">⌂</span>
            <span>Overview</span>
          </Link>

          <Link
            to="/business/create-shipment"
            className="business-nav-link"
          >
            <span className="nav-icon">＋</span>
            <span>Create Shipment</span>
          </Link>

          <Link
            to="/business/shipment-management"
            className="business-nav-link"
          >
            <span className="nav-icon">▣</span>
            <span>Shipment Management</span>
          </Link>

          <Link
            to="/business/shipment-history"
            className="business-nav-link"
          >
            <span className="nav-icon">◷</span>
            <span>Shipment History</span>
          </Link>

          <Link
            to="/business/package-information"
            className="business-nav-link"
          >
            <span className="nav-icon">□</span>
            <span>Package Information</span>
          </Link>

          <Link
            to="/business/tracking"
            className="business-nav-link active"
          >
            <span className="nav-icon">⌁</span>
            <span>Tracking</span>
          </Link>

          <Link
            to="/business/delivery-performance"
            className="business-nav-link"
          >
            <span className="nav-icon">↗</span>
            <span>Delivery Performance</span>
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-nav-link"
          >
            <span className="nav-icon">!</span>
            <span>Delay Analysis</span>
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-nav-link"
          >
            <span className="nav-icon">◎</span>
            <span>Logistics Overview</span>
          </Link>

          <Link
            to="/business/customer-activity"
            className="business-nav-link"
          >
            <span className="nav-icon">♙</span>
            <span>Customer Activity</span>
          </Link>

          <Link
            to="/business/reports"
            className="business-nav-link"
          >
            <span className="nav-icon">▥</span>
            <span>Reports & Export</span>
          </Link>

        </nav>

        <Link
          to="/login"
          className="business-logout"
        >
          <span>⇥</span>
          <span>Logout</span>
        </Link>

      </aside>


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="business-tracking-main">

        {/* TOP BAR */}

        <header className="business-topbar">

          <div>
            <div className="breadcrumb">
              Business Client / Tracking
            </div>

            <h1>Shipment Tracking</h1>

            <p>Track shipment status and backend-reported location.</p>
          </div>

          <div className="business-user">

            <div className="user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{userName}</strong>
              <span>Business Client</span>
            </div>

          </div>

        </header>


        {/* ==========================================
            SEARCH
        ========================================== */}

        <section className="tracking-search-card">

          <div className="search-heading">

            <div className="search-icon">
              ⌕
            </div>

            <div>
              <h2>Track a Shipment</h2>
              <p>
                Enter a tracking ID to view the latest shipment
                information.
              </p>
            </div>

          </div>

          <form
            className="tracking-search-form"
            onSubmit={handleSearch}
          >

            <input
              type="text"
              value={trackingNumber}
              onChange={(e) =>
                setTrackingNumber(e.target.value)
              }
              placeholder="Enter tracking ID"
            />

            <button type="submit">
              Track Shipment
            </button>

          </form>
          {searchError && (
            <p role="alert" className="tracking-error">
              {searchError}
            </p>
          )}
          {trackingWarning && (
            <p role="alert" className="tracking-error">
              {trackingWarning}
            </p>
          )}

        </section>


        {/* ==========================================
            IDLE / LOADING / NOT FOUND STATES
        ========================================== */}

        {trackingState !== "found" && (
          <section className="tracking-overview-card">
            <div className="tracking-overview-top">
              <div>
                {trackingState === "idle" && (
                  <>
                    <h2>Track a shipment</h2>
                    <p>Enter a tracking ID above to view live shipment details.</p>
                  </>
                )}

                {trackingState === "loading" && (
                  <>
                    <h2>Looking up {searchedTracking}...</h2>
                    <p>Fetching the latest shipment information.</p>
                  </>
                )}

                {trackingState === "notfound" && (
                  <>
                    <h2>Shipment Not Found</h2>
                    <p>
                      We couldn't find a shipment matching "{searchedTracking}",
                      or you don't have permission to view it.
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>
        )}


        {/* ==========================================
            SHIPMENT HEADER
        ========================================== */}

        {trackingState === "found" && shipment && (
        <>
        <section className="tracking-overview-card">

          <div className="tracking-overview-top">

            <div>

              <div className="tracking-label">
                TRACKING ID
              </div>

              <h2>{searchedTracking}</h2>

              {shipment.referenceId && (
                <p>Reference: {shipment.referenceId}</p>
              )}

            </div>

            <div
              className={`tracking-status ${
                shipment.status
                  .toLowerCase()
                  .replace(/\s+/g, "-")
              }`}
            >
              <span className="status-dot"></span>
              {String(shipment.status || "")
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (letter) => letter.toUpperCase())}
            </div>

          </div>


          {/* ROUTE */}

          {(shipment.senderAddress || shipment.route?.origin ||
            shipment.receiverAddress || shipment.route?.destination) && (
          <div className="shipment-route">

            <div className="route-location">

              <span className="route-marker origin">
                ●
              </span>

              <div>
                <span>ORIGIN</span>
                <strong>{shipment.route?.origin || shipment.senderAddress}</strong>
              </div>

            </div>


            <div className="route-line"></div>


            <div className="route-location destination">

              <span className="route-marker destination-marker">
                ●
              </span>

              <div>
                <span>DESTINATION</span>
                <strong>{shipment.route?.destination || shipment.receiverAddress}</strong>
              </div>

            </div>

          </div>
          )}


          {/* CURRENT LOCATION */}

          {shipment.currentLocation && (
          <div className="current-location">

            <div className="live-indicator">
              <span></span>
              LATEST
            </div>

            <div>
              <span>Current Location</span>
              <strong>
                {shipment.currentLocation.locationName ||
                  `${shipment.currentLocation.latitude}, ${shipment.currentLocation.longitude}`}
              </strong>
            </div>

          </div>
          )}

        </section>


        {/* ==========================================
            STAT CARDS
        ========================================== */}

        {(shipment.eta?.expectedCompletionTime ||
          shipment.forecasts.length ||
          shipment.packageWeightKg != null) && (
        <section className="tracking-stats">

          {shipment.eta?.expectedCompletionTime && (
          <div className="tracking-stat-card orange">

            <span>Estimated Delivery</span>

            <strong>
              {new Date(shipment.eta.expectedCompletionTime).toLocaleString()}
            </strong>

            <small>
              Expected arrival
            </small>

          </div>
          )}

          {shipment.packageWeightKg != null && (
          <div className="tracking-stat-card pink">
            <span>Package Weight</span>
            <strong>
              {shipment.packageWeightKg} kg
            </strong>
          </div>
          )}
        </section>
        )}


        {/* ==========================================
            TWO COLUMN CONTENT
        ========================================== */}

        <section className="tracking-content-grid">


          {/* ========================================
              TRACKING TIMELINE
          ======================================== */}

          <div className="tracking-panel timeline-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  SHIPMENT JOURNEY
                </span>

                <h2>Tracking Timeline</h2>
              </div>

              <span className="event-count">
                {shipment.events.length} Events
              </span>

            </div>


            <div className="timeline">

              {shipment.events.map((event, index) => (

                <div
                  className={`timeline-item ${
                    event.active ? "active" : ""
                  }`}
                  key={index}
                >

                  <div className="timeline-marker">
                    {event.active ? "●" : "✓"}
                  </div>

                  <div className="timeline-line"></div>

                  <div className="timeline-content">

                    <div className="timeline-date">
                      {event.date} · {event.time}
                    </div>

                    <h3>{event.title || event.detail}</h3>

                    {event.title && event.detail && (
                      <p>{event.detail}</p>
                    )}

                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* ========================================
              SHIPMENT DETAILS
          ======================================== */}

          <div className="tracking-panel details-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  SHIPMENT DETAILS
                </span>

                <h2>Package Information</h2>
              </div>

            </div>


            <div className="detail-list">

              <div className="detail-row">
                <span>Customer</span>
                <strong>{shipment.customerName || "Not assigned"}</strong>
              </div>

              {shipment.packageDescription && <div className="detail-row">
                <span>Package Type</span>
                <strong>{shipment.packageDescription}</strong>
              </div>
              }
              {shipment.packageWeightKg != null && <div className="detail-row">
                <span>Total Weight</span>
                <strong>{shipment.packageWeightKg} kg</strong>
              </div>
              }
              {shipment.route?.distanceKm != null && <div className="detail-row">
                <span>Route Distance</span>
                <strong>{shipment.route.distanceKm} km</strong>
              </div>}
              {shipment.route?.estimatedDurationMinutes != null && <div className="detail-row">
                <span>Route Duration</span>
                <strong>{shipment.route.estimatedDurationMinutes} min</strong>
              </div>}
              {shipment.eta && <>
                {shipment.eta.trafficCondition && <div className="detail-row">
                  <span>Traffic</span>
                  <strong>{String(shipment.eta.trafficCondition).replaceAll("_", " ")}</strong>
                </div>}
                {shipment.eta.trafficDelayHours != null && <div className="detail-row">
                  <span>Traffic Delay</span>
                  <strong>{formatHours(shipment.eta.trafficDelayHours)}</strong>
                </div>}
                {shipment.eta.weatherDelayHours != null && <div className="detail-row">
                  <span>Weather Delay</span>
                  <strong>{formatHours(shipment.eta.weatherDelayHours)}</strong>
                </div>}
                {shipment.eta.routeChangeDelayHours != null && <div className="detail-row">
                  <span>Route Change Delay</span>
                  <strong>{formatHours(shipment.eta.routeChangeDelayHours)}</strong>
                </div>}
                {shipment.eta.predictedDelayHours != null && <div className="detail-row">
                  <span>Predicted Delay</span>
                  <strong>{formatHours(shipment.eta.predictedDelayHours)}</strong>
                </div>}
              </>}
              {shipment.forecasts.map((forecast) => (
                <div className="detail-row" key={forecast.id}>
                  <span>Forecast · {String(forecast.predictedStatus || "").replaceAll("_", " ")}</span>
                  <strong>
                    {forecast.predictedDeliveryTime
                      ? new Date(forecast.predictedDeliveryTime).toLocaleString()
                      : ""}
                    {formatConfidence(forecast.confidence)}
                  </strong>
                </div>
              ))}

            </div>


            <Link
              to="/business/shipment-management"
              className="view-shipment-button"
            >
              View Shipment Management
            </Link>

          </div>

        </section>
        </>
        )}


        {/* ==========================================
            FOOTER
        ========================================== */}

        <footer className="business-footer">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default BusinessTracking;