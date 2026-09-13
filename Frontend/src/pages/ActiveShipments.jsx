import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  Clock,
  ChevronRight,
} from "lucide-react";
import "./ModulePages.css";
import { apiRequest } from "../api";

const defaultShipments = [
  {
    id: "TRK-2026-001",
    from: "Hyderabad",
    to: "Bengaluru",
    status: "In Transit",
    eta: "Today, 6:30 PM",
    progress: 68,
  },
  {
    id: "TRK-2026-003",
    from: "Mumbai",
    to: "Pune",
    status: "Picked Up",
    eta: "03 Sep 2026",
    progress: 28,
  },
  {
    id: "TRK-2026-004",
    from: "Delhi",
    to: "Jaipur",
    status: "In Transit",
    eta: "04 Sep 2026",
    progress: 54,
  },
];

function ActiveShipments() {
  const [shipments, setShipments] = useState(defaultShipments);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadActiveShipments() {
      try {
        const data = await apiRequest("/api/shipments");
        if (active && Array.isArray(data) && data.length > 0) {
          const activeList = data.filter(
            (s) => s.status !== "DELIVERED" && s.status !== "CANCELLED"
          );

          if (activeList.length > 0) {
            setShipments(
              activeList.map((s) => ({
                id: s.trackingNumber,
                from: s.senderAddress || "Hyderabad",
                to: s.receiverAddress || "Destination",
                status: String(s.status).replaceAll("_", " "),
                eta: s.updatedAt
                  ? new Date(s.updatedAt).toLocaleDateString()
                  : "Pending",
                progress:
                  s.status === "OUT_FOR_DELIVERY"
                    ? 85
                    : s.status === "IN_TRANSIT"
                    ? 60
                    : s.status === "PICKED_UP"
                    ? 35
                    : 15,
              }))
            );
          }
        }
      } catch {
        // Fall back to default shipments
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

      <div className="shipment-grid">

        {shipments.map((shipment) => (
          <div className="shipment-module-card" key={shipment.id}>

            <div className="shipment-card-top">
              <div className="shipment-icon">
                <Package size={22} />
              </div>

              <span className="status-badge">
                {shipment.status}
              </span>
            </div>

            <h2>{shipment.id}</h2>

            <div className="route-info">

              <div>
                <MapPin size={17} />
                <div>
                  <small>FROM</small>
                  <strong>{shipment.from}</strong>
                </div>
              </div>

              <ChevronRight size={20} />

              <div>
                <MapPin size={17} />
                <div>
                  <small>TO</small>
                  <strong>{shipment.to}</strong>
                </div>
              </div>

            </div>

            <div className="progress-section">

              <div className="progress-header">
                <span>Delivery Progress</span>
                <strong>{shipment.progress}%</strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${shipment.progress}%` }}
                />
              </div>

            </div>

            <div className="shipment-meta">

              <div>
                <Clock size={16} />
                <span>{shipment.eta}</span>
              </div>

              <div>
                <Truck size={16} />
                <span>Express</span>
              </div>

            </div>

            <Link
              to={`/tracking?trackingNumber=${shipment.id}`}
              className="track-button"
            >
              Track Shipment
              <ChevronRight size={18} />
            </Link>

          </div>
        ))}

      </div>

    </div>
  );
}

export default ActiveShipments;