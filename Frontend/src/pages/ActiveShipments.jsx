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
function ActiveShipments() {
  const shipments = [
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