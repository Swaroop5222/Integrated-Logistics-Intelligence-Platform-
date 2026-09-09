import "./ShipmentCard.css";

/**
 * ShipmentCard
 *
 * Purely presentational, reusable card for displaying a single shipment's
 * tracking details. It holds no shipment data of its own — every field is
 * received through props, so the same component works on any dashboard
 * (Customer, Business, Logistics Operator, etc.) and can later be driven
 * directly by the Spring Boot API response without any change to this file
 * (map API response fields -> these same prop names when integrating).
 *
 * Props:
 * @param {string} trackingNumber  - Shipment tracking number
 * @param {string} status          - e.g. "In Transit", "Delivered", "Pending", "Cancelled", "Out for Delivery"
 * @param {string} sender          - Sender name
 * @param {string} receiver        - Receiver name
 * @param {string} packageInfo     - Package details, e.g. "Electronics, 2kg"
 * @param {string} deliveryAddress - Destination address
 * @param {string} currentLocation - Current / last known location
 * @param {string} eta             - Estimated time of arrival
 * @param {string} lastUpdated     - Timestamp of the last tracking update
 */
function ShipmentCard({
  trackingNumber,
  status,
  sender,
  receiver,
  packageInfo,
  deliveryAddress,
  currentLocation,
  eta,
  lastUpdated,
}) {
  const statusClass = status
    ? `status-${status.toLowerCase().trim().replace(/\s+/g, "-")}`
    : "status-unknown";

  return (
    <div className="shipment-card">
      <div className="shipment-card-header">
        <div>
          <h3>{trackingNumber || "N/A"}</h3>
          <p>Shipment Tracking</p>
        </div>

        <span className={`shipment-status ${statusClass}`}>
          {status || "Unknown"}
        </span>
      </div>

      <div className="shipment-card-body">
        <div className="shipment-field">
          <span className="field-label">Sender</span>
          <span>{sender || "N/A"}</span>
        </div>

        <div className="shipment-field">
          <span className="field-label">Receiver</span>
          <span>{receiver || "N/A"}</span>
        </div>

        <div className="shipment-field">
          <span className="field-label">Package Information</span>
          <span>{packageInfo || "N/A"}</span>
        </div>

        <div className="shipment-field">
          <span className="field-label">Delivery Address</span>
          <span>{deliveryAddress || "N/A"}</span>
        </div>

        <div className="shipment-field">
          <span className="field-label">Current / Last Known Location</span>
          <span>{currentLocation || "N/A"}</span>
        </div>

        <div className="shipment-field">
          <span className="field-label">ETA</span>
          <span>{eta || "N/A"}</span>
        </div>
      </div>

      <div className="shipment-card-footer">
        <span>Last Updated</span>
        <strong>{lastUpdated || "N/A"}</strong>
      </div>
    </div>
  );
}

ShipmentCard.defaultProps = {
  trackingNumber: "",
  status: "",
  sender: "",
  receiver: "",
  packageInfo: "",
  deliveryAddress: "",
  currentLocation: "",
  eta: "",
  lastUpdated: "",
};

export default ShipmentCard;