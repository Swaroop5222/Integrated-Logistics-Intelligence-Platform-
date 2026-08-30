import React from "react";

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

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div>
      <button onClick={handleBack}>
        ← Back to Shipments
      </button>

      <h1>Shipment Details</h1>

      <h2>{shipment.trackingNumber}</h2>

      <h3>Current Status</h3>
      <p>{shipment.status}</p>

      <hr />

      <h3>Sender Information</h3>
      <p><strong>Name:</strong> {shipment.sender.name}</p>
      <p><strong>Phone:</strong> {shipment.sender.phone}</p>
      <p><strong>Email:</strong> {shipment.sender.email}</p>

      <hr />

      <h3>Receiver Information</h3>
      <p><strong>Name:</strong> {shipment.receiver.name}</p>
      <p><strong>Phone:</strong> {shipment.receiver.phone}</p>
      <p><strong>Email:</strong> {shipment.receiver.email}</p>

      <hr />

      <h3>Package Information</h3>
      <p><strong>Type:</strong> {shipment.package.type}</p>
      <p><strong>Weight:</strong> {shipment.package.weight}</p>
      <p>
        <strong>Dimensions:</strong>{" "}
        {shipment.package.dimensions}
      </p>

      <hr />

      <h3>Delivery Address</h3>
      <p>{shipment.deliveryAddress}</p>

      <hr />

      <h3>Tracking Timeline</h3>

      <ul>
        <li>● Created</li>
        <li>● Picked Up</li>
        <li>● In Transit</li>
        <li>○ Out for Delivery</li>
        <li>○ Delivered</li>
      </ul>
    </div>
  );
}

export default ShipmentDetailsPage;