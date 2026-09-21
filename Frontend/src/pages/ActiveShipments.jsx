import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  ChevronRight,
} from "lucide-react";
import "./ModulePages.css";
import { apiRequest } from "../api";

const ACTIVE_STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
];

function formatStatus(status) {
  if (!status) return "Data unavailable";

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Data unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFrom(shipment) {
  return (
    shipment.senderAddress ||
    shipment.senderCity ||
    shipment.origin ||
    "Data unavailable"
  );
}

function getTo(shipment) {
  return (
    shipment.receiverAddress ||
    shipment.receiverCity ||
    shipment.destination ||
    "Data unavailable"
  );
}

function ActiveShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadActiveShipments() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/api/shipments");

        if (!active) return;

        const allShipments = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.shipments)
          ? data.shipments
          : [];

        const activeShipments = allShipments.filter((shipment) =>
          ACTIVE_STATUSES.includes(String(shipment.status || "").toUpperCase())
        );

        setShipments(activeShipments);
      } catch (err) {
        if (!active) return;

        setShipments([]);
        setError(err?.message || "Unable to load shipments.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadActiveShipments();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="module-page">
      <div className="module-topbar">
        <Link to="/dashboard/customer" className="back-link">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>

      <div className="module-header">
        <div>
          <span className="module-label">SHIPMENT MANAGEMENT</span>

          <h1>Active Shipments</h1>

          <p>
            Monitor all your shipments that are currently in progress.
          </p>
        </div>

        <div className="module-count">
          <Package size={20} />
          <span>{shipments.length} Active</span>
        </div>
      </div>

      {loading && (
        <div className="no-results">
          Loading shipments...
        </div>
      )}

      {!loading && error && (
        <div className="no-results">
          {error}
        </div>
      )}

      {!loading && !error && shipments.length === 0 && (
        <div className="no-results">
          No active shipments found.
        </div>
      )}

      {!loading && !error && shipments.length > 0 && (
        <div className="shipment-grid">
          {shipments.map((shipment) => {
            const trackingNumber =
              shipment.trackingNumber ||
              shipment.trackingId ||
              shipment.id;

            const status = String(shipment.status || "").toUpperCase();

            return (
              <div
                className="shipment-module-card"
                key={shipment.id || trackingNumber}
              >
                <div className="shipment-card-top">
                  <div className="shipment-icon">
                    <Package size={22} />
                  </div>

                  <span className="status-badge">
                    {formatStatus(shipment.status)}
                  </span>
                </div>

                <h2>{trackingNumber || "Data unavailable"}</h2>

                <div className="route-info">
                  <div>
                    <MapPin size={17} />

                    <div>
                      <small>FROM</small>
                      <strong>{getFrom(shipment)}</strong>
                    </div>
                  </div>

                  <ChevronRight size={20} />

                  <div>
                    <MapPin size={17} />

                    <div>
                      <small>TO</small>
                      <strong>{getTo(shipment)}</strong>
                    </div>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span>Delivery Progress</span>
                    <strong>Data unavailable</strong>
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill" />
                  </div>
                </div>

                <div className="shipment-meta">
                  <div>
                    <Clock size={16} />

                    <span>
                      {shipment.updatedAt
                        ? `Updated ${formatDate(shipment.updatedAt)}`
                        : shipment.createdAt
                        ? `Created ${formatDate(shipment.createdAt)}`
                        : "Date unavailable"}
                    </span>
                  </div>

                  <div>
                    <span>
                      {shipment.priority
                        ? formatStatus(shipment.priority)
                        : "Data unavailable"}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/tracking?trackingNumber=${encodeURIComponent(
                    trackingNumber
                  )}`}
                  className="track-button"
                >
                  Track Shipment
                  <ChevronRight size={18} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ActiveShipments;