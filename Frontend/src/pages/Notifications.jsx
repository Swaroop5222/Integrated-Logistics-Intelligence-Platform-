import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "../api";
import "./Notifications.css";

/* =========================================================
   RESPONSE HELPERS
   ========================================================= */

function getShipments(response) {
  if (Array.isArray(response)) {
    return response;
  }

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

function getHistory(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.history)) {
    return response.history;
  }

  if (Array.isArray(response?.statusHistory)) {
    return response.statusHistory;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

/* =========================================================
   USER HELPERS
   ========================================================= */

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

  return parts[0]
    .slice(0, 2)
    .toUpperCase();
}

/* =========================================================
   SHIPMENT HELPERS
   ========================================================= */

function getTrackingNumber(shipment) {
  return (
    shipment?.trackingNumber ??
    shipment?.trackingId ??
    null
  );
}

function normalizeStatus(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

/* =========================================================
   HISTORY HELPERS
   ========================================================= */

function getHistoryStatus(historyItem, shipment) {
  return normalizeStatus(
    historyItem?.status ??
      historyItem?.shipmentStatus ??
      historyItem?.newStatus ??
      historyItem?.toStatus ??
      historyItem?.currentStatus ??
      shipment?.status
  );
}

function getHistoryDate(historyItem, shipment) {
  return (
    historyItem?.changedAt ??
    historyItem?.timestamp ??
    historyItem?.recordedAt ??
    historyItem?.createdAt ??
    historyItem?.updatedAt ??
    historyItem?.date ??
    historyItem?.statusChangedAt ??
    shipment?.updatedAt ??
    shipment?.createdAt ??
    null
  );
}

/* =========================================================
   DATE FORMAT
   ========================================================= */

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

/* =========================================================
   STATUS FORMAT
   ========================================================= */

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

/* =========================================================
   CREATE NOTIFICATION
   ========================================================= */

function createNotification(
  shipment,
  historyItem,
  index
) {
  const status = getHistoryStatus(
    historyItem,
    shipment
  );

  const trackingNumber =
    getTrackingNumber(shipment);

  const trackingText =
    trackingNumber || "Data unavailable";

  const time = getHistoryDate(
    historyItem,
    shipment
  );

  const base = {
    shipmentId: shipment?.id ?? null,
    trackingNumber,
    time,
    historyIndex: index,
  };

  switch (status) {
    case "CREATED":
      return {
        ...base,
        id: `shipment-${shipment.id}-created-${index}`,
        type: "info",
        icon: "info",
        title: "Shipment created",
        message: `${trackingText} has been created.`,
      };

    case "PICKED_UP":
      return {
        ...base,
        id: `shipment-${shipment.id}-picked-up-${index}`,
        type: "success",
        icon: "success",
        title: "Shipment picked up",
        message: `${trackingText} has been picked up from the origin.`,
      };

    case "IN_TRANSIT":
      return {
        ...base,
        id: `shipment-${shipment.id}-in-transit-${index}`,
        type: "info",
        icon: "info",
        title: "Shipment in transit",
        message: `${trackingText} is currently in transit.`,
      };

    case "OUT_FOR_DELIVERY":
      return {
        ...base,
        id: `shipment-${shipment.id}-out-for-delivery-${index}`,
        type: "info",
        icon: "info",
        title: "Shipment out for delivery",
        message: `${trackingText} is out for delivery.`,
      };

    case "DELIVERED":
      return {
        ...base,
        id: `shipment-${shipment.id}-delivered-${index}`,
        type: "success",
        icon: "success",
        title: "Shipment delivered",
        message: `${trackingText} has been successfully delivered.`,
      };

    case "FAILED_DELIVERY":
      return {
        ...base,
        id: `shipment-${shipment.id}-failed-${index}`,
        type: "warning",
        icon: "warning",
        title: "Delivery failed",
        message: `${trackingText} has a failed delivery status.`,
      };

    case "CANCELLED":
      return {
        ...base,
        id: `shipment-${shipment.id}-cancelled-${index}`,
        type: "warning",
        icon: "warning",
        title: "Shipment cancelled",
        message: `${trackingText} has been cancelled.`,
      };

    default:
      return {
        ...base,
        id: `shipment-${shipment.id}-update-${index}`,
        type: "info",
        icon: "info",
        title: "Shipment updated",
        message: `${trackingText} status is ${formatStatus(
          status
        )}.`,
      };
  }
}

/* =========================================================
   REMOVE EXACT DUPLICATES
   ========================================================= */

function removeDuplicateNotifications(
  notifications
) {
  const unique = new Map();

  notifications.forEach(
    (notification) => {
      const timestamp = notification.time
        ? new Date(
            notification.time
          ).getTime()
        : "";

      const key = [
        notification.shipmentId,
        notification.trackingNumber,
        notification.title,
        timestamp,
      ].join("|");

      if (!unique.has(key)) {
        unique.set(
          key,
          notification
        );
      }
    }
  );

  return Array.from(
    unique.values()
  );
}

/* =========================================================
   COMPONENT
   ========================================================= */

function Notifications() {
  const [user, setUser] =
    useState(null);

  const [shipments, setShipments] =
    useState([]);

  const [
    shipmentHistories,
    setShipmentHistories,
  ] = useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD DATA
     ======================================================= */

  const loadNotifications =
    useCallback(async () => {
      try {
        setError("");

        const [
          userResponse,
          shipmentResponse,
        ] = await Promise.all([
          apiRequest(
            "/api/users/me"
          ),
          apiRequest(
            "/api/shipments"
          ),
        ]);

        const actualShipments =
          getShipments(
            shipmentResponse
          );

        setUser(userResponse);
        setShipments(
          actualShipments
        );

        const historyResults =
          await Promise.all(
            actualShipments.map(
              async (shipment) => {
                if (!shipment?.id) {
                  return {
                    shipmentId: null,
                    history: [],
                  };
                }

                try {
                  const historyResponse =
                    await apiRequest(
                      `/api/shipments/${shipment.id}/history`
                    );

                  return {
                    shipmentId:
                      shipment.id,
                    history:
                      getHistory(
                        historyResponse
                      ),
                  };
                } catch (historyError) {
                  console.error(
                    `Unable to load history for shipment ${shipment.id}:`,
                    historyError
                  );

                  return {
                    shipmentId:
                      shipment.id,
                    history: [],
                  };
                }
              }
            )
          );

        const historyMap = {};

        historyResults.forEach(
          (result) => {
            if (
              result.shipmentId !==
              null
            ) {
              historyMap[
                result.shipmentId
              ] = result.history;
            }
          }
        );

        setShipmentHistories(
          historyMap
        );
      } catch (err) {
        console.error(
          "Notifications loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load notification data."
        );

        setUser(null);
        setShipments([]);
        setShipmentHistories({});
      } finally {
        setLoading(false);
      }
    }, []);

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /* =======================================================
     REFRESH EVERY 30 SECONDS
     ======================================================= */

  useEffect(() => {
    const interval =
      setInterval(
        loadNotifications,
        30000
      );

    return () =>
      clearInterval(interval);
  }, [loadNotifications]);

  /* =======================================================
     REFRESH WHEN TAB BECOMES VISIBLE
     ======================================================= */

  useEffect(() => {
    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          loadNotifications();
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loadNotifications]);

  /* =======================================================
     BUILD NOTIFICATIONS
     ======================================================= */

  const notifications =
    useMemo(() => {
      const allNotifications =
        [];

      shipments.forEach(
        (shipment) => {
          const history =
            shipmentHistories[
              shipment.id
            ];

          if (
            !Array.isArray(history) ||
            history.length === 0
          ) {
            return;
          }

          history.forEach(
            (
              historyItem,
              index
            ) => {
              allNotifications.push(
                createNotification(
                  shipment,
                  historyItem,
                  index
                )
              );
            }
          );
        }
      );

      const uniqueNotifications =
        removeDuplicateNotifications(
          allNotifications
        );

      return uniqueNotifications.sort(
        (a, b) => {
          const dateA =
            new Date(
              a.time || 0
            ).getTime();

          const dateB =
            new Date(
              b.time || 0
            ).getTime();

          return dateB - dateA;
        }
      );
    }, [
      shipments,
      shipmentHistories,
    ]);

  /* =======================================================
     USER DISPLAY
     ======================================================= */

  const initials =
    getInitials(user);

  /* =======================================================
     READ STATUS
     ======================================================= */

  const handleMarkAllRead =
    () => {
      /*
       * The current backend does not
       * provide a notification read/unread
       * API, so no fake state is changed.
       */
      return;
    };

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="notifications-page">
        <main className="notifications-main">
          <div
            style={{
              padding: "40px",
              color: "#777e91",
            }}
          >
            Loading notifications...
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <div className="notifications-page">

      {/* ===================================================
          SIDEBAR
          =================================================== */}

      <aside className="notifications-sidebar">

        <div className="notifications-logo">

          <div className="notifications-logo-icon">
            S
          </div>

          <div>
            <h2>
              ShipTrack
            </h2>

            <span>
              PRO
            </span>
          </div>

        </div>

        <div className="notifications-menu-title">
          CUSTOMER
        </div>

        <nav>

          <Link
            to="/dashboard/customer"
            className="notifications-nav-link"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/shipments/active"
            className="notifications-nav-link"
          >
            <span>▣</span>
            Active Shipments
          </Link>

          <Link
            to="/shipments/history"
            className="notifications-nav-link"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/tracking"
            className="notifications-nav-link"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/notifications"
            className="notifications-nav-link active"
          >
            <span>♢</span>
            Notifications
          </Link>

          <Link
            to="/tracking-insights"
            className="notifications-nav-link"
          >
            <span>▥</span>
            Tracking Insights
          </Link>

        </nav>

        <div className="notifications-sidebar-bottom">

          <Link
            to="/login"
            className="notifications-logout"
            onClick={() => {
              localStorage.removeItem(
                "shiptrackToken"
              );

              localStorage.removeItem(
                "shiptrackUser"
              );
            }}
          >
            ⇥ Logout
          </Link>

        </div>

      </aside>

      {/* ===================================================
          MAIN
          =================================================== */}

      <main className="notifications-main">

        {/* =================================================
            HEADER
            ================================================= */}

        <header className="notifications-header">

          <div>

            <div className="notifications-breadcrumb">
              Customer / Notifications
            </div>

            <h1>
              Notifications
            </h1>

            <p>
              Stay updated with your shipment activity.
            </p>

          </div>

          <div className="notifications-avatar">
            {initials}
          </div>

        </header>

        {/* =================================================
            ERROR
            ================================================= */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 15px",
              borderRadius: "10px",
              color: "#ff8b78",
              background:
                "rgba(255,80,70,0.08)",
              border:
                "1px solid rgba(255,80,70,0.15)",
              fontSize: "11px",
            }}
          >
            {error}
          </div>
        )}

        {/* =================================================
            SUMMARY
            ================================================= */}

        <section className="notifications-summary">

          <div>

            <span>
              NOTIFICATION CENTER
            </span>

            <h2>
              Shipment Updates
            </h2>

            <p>
              Notification read status is
              not available from the current
              backend API.
            </p>

          </div>

          <button
            type="button"
            className="mark-read-btn"
            onClick={
              handleMarkAllRead
            }
            title="Read status is not supported by the current backend"
          >
            Mark all as read
          </button>

        </section>

        {/* =================================================
            NOTIFICATIONS
            ================================================= */}

        <section className="notifications-panel">

          <div className="notifications-panel-header">

            <h2>
              Recent Notifications
            </h2>

            <span>
              {notifications.length}{" "}
              {notifications.length ===
              1
                ? "update"
                : "updates"}
            </span>

          </div>

          {notifications.length ===
          0 ? (

            <div
              style={{
                padding:
                  "45px 24px",
                textAlign:
                  "center",
                color:
                  "#777f91",
                fontSize:
                  "12px",
              }}
            >
              No shipment history
              updates are available
              from the backend.
            </div>

          ) : (
            notifications.map(
              (notification) => {

                let icon;

                if (
                  notification.icon ===
                  "success"
                ) {
                  icon = (
                    <CheckCircle2
                      size={18}
                    />
                  );
                } else if (
                  notification.icon ===
                  "warning"
                ) {
                  icon = (
                    <AlertTriangle
                      size={18}
                    />
                  );
                } else {
                  icon = (
                    <Info
                      size={18}
                    />
                  );
                }

                return (
                  <div
                    key={
                      notification.id
                    }
                    className="notification-item"
                  >

                    <div
                      className={`notification-icon ${notification.type}`}
                    >
                      {icon}
                    </div>

                    <div className="notification-content">

                      <div className="notification-title-row">

                        <h3>
                          {
                            notification.title
                          }
                        </h3>

                      </div>

                      <p>
                        {
                          notification.message
                        }
                      </p>

                      <span className="notification-time">
                        {formatDateTime(
                          notification.time
                        )}
                      </span>

                    </div>

                  </div>
                );
              }
            )
          )}

        </section>

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="notifications-footer">
          © 2026 ShipTrack Pro · Integrated
          Logistics Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default Notifications;