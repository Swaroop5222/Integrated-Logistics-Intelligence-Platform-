import React from "react";
import "./ShipmentDetailsPage.css";

function ShipmentDetailsPage() {
  const shipment = {
    trackingNumber: "TRK001",
    status: "IN TRANSIT",

    sender: {
      name: "ABC Logistics",
      phone: "+91 9876543210",
      email: "sender@abclogistics.com",
    },

    receiver: {
      name: "John Doe",
      phone: "+91 9876543211",
      email: "john@example.com",
    },

    package: {
      type: "Electronics",
      weight: "2.5 kg",
      dimensions: "30 x 20 x 15 cm",
    },

    deliveryAddress:
      "Chennai, Tamil Nadu, India - 600001",
  };

  const timeline = [
    { status: "Created", completed: true },
    { status: "Picked Up", completed: true },
    { status: "In Transit", completed: true },
    { status: "Out for Delivery", completed: false },
    { status: "Delivered", completed: false },
  ];

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="shipment-page">

      <div className="shipment-container">

        <button className="back-button" onClick={handleBack}>
          ← Back to Shipments
        </button>

        {/* Header */}
        <div className="shipment-header">
          <h1>Shipment Details</h1>
          <p className="tracking-number">
            {shipment.trackingNumber}
          </p>

          <div className="status-section">
            <span>Current Status</span>
            <div className="status-badge">
              {shipment.status}
            </div>
          </div>
        </div>

        {/* Sender and Receiver */}
        <div className="info-grid">

          <div className="info-card">
            <h3>📤 Sender Information</h3>
            <p>
              <strong>Name:</strong> {shipment.sender.name}
            </p>
            <p>
              <strong>Phone:</strong> {shipment.sender.phone}
            </p>
            <p>
              <strong>Email:</strong> {shipment.sender.email}
            </p>
          </div>

          <div className="info-card">
            <h3>📥 Receiver Information</h3>
            <p>
              <strong>Name:</strong> {shipment.receiver.name}
            </p>
            <p>
              <strong>Phone:</strong> {shipment.receiver.phone}
            </p>
            <p>
              <strong>Email:</strong> {shipment.receiver.email}
            </p>
          </div>

        </div>

        {/* Package */}
        <div className="info-card">
          <h3>📦 Package Information</h3>

          <div className="package-grid">
            <p>
              <strong>Type</strong>
              <span>{shipment.package.type}</span>
            </p>

            <p>
              <strong>Weight</strong>
              <span>{shipment.package.weight}</span>
            </p>

            <p>
              <strong>Dimensions</strong>
              <span>{shipment.package.dimensions}</span>
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="info-card">
          <h3>📍 Delivery Address</h3>
          <p>{shipment.deliveryAddress}</p>
        </div>

        {/* Timeline */}
        <div className="timeline-card">
          <h3>Tracking Timeline</h3>

          <div className="timeline">
            {timeline.map((item, index) => (
              <div
                className={`timeline-item ${
                  item.completed ? "completed" : ""
                }`}
                key={index}
              >
                <div className="timeline-dot"></div>

                <div className="timeline-content">
                  {item.status}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}

export default ShipmentDetailsPage;
