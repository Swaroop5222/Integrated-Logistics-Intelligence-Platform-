import { useState } from "react";
import ShipmentCard from "../components/ShipmentCard";
import "./LogisticsOperator.css";

// ---------------------------------------------------------------------------
// MOCK DATA
// This page has no backend/API connected yet. All data below is static,
// hard-coded mock data used only to demonstrate the UI layout. Nothing here
// is real-time, and nothing here is fetched from a server.
// ---------------------------------------------------------------------------

const mockSummary = {
  activeShipments: 128,
  deliveriesInProgress: 34,
  delayedShipments: 6,
  driversTracked: 21,
};

const mockShipments = [
  {
    trackingNumber: "SHP-10234",
    status: "In Transit",
    sender: "Anitha Traders Pvt Ltd",
    receiver: "Rahul Sharma",
    packageInfo: "Electronics, 2.4 kg",
    deliveryAddress: "Flat 302, Lotus Residency, Vijayawada",
    currentLocation: "Hyderabad Hub",
    eta: "Today, 6:30 PM",
    lastUpdated: "10 minutes ago",
  },
  {
    trackingNumber: "SHP-10241",
    status: "Out for Delivery",
    sender: "Green Valley Foods",
    receiver: "Priya Reddy",
    packageInfo: "Packaged Groceries, 5.1 kg",
    deliveryAddress: "12-4-56, MG Road, Vijayawada",
    currentLocation: "Vijayawada Local Station",
    eta: "Today, 3:15 PM",
    lastUpdated: "2 minutes ago",
  },
  {
    trackingNumber: "SHP-10198",
    status: "Delayed",
    sender: "Bright Textiles Co.",
    receiver: "Karthik Rao",
    packageInfo: "Apparel, 1.8 kg",
    deliveryAddress: "45 Anna Salai, Chennai",
    currentLocation: "Chennai Sorting Facility",
    eta: "Tomorrow, 11:00 AM",
    lastUpdated: "35 minutes ago",
  },
  {
    trackingNumber: "SHP-10255",
    status: "Delivered",
    sender: "Skyline Electronics",
    receiver: "Meera Iyer",
    packageInfo: "Mobile Accessories, 0.6 kg",
    deliveryAddress: "22 Residency Road, Bengaluru",
    currentLocation: "Bengaluru - Customer Address",
    eta: "Delivered",
    lastUpdated: "1 hour ago",
  },
];

const mockLiveDeliveries = [
  {
    trackingNumber: "SHP-10241",
    driver: "Driver #A12",
    lastLocationUpdate: "12:04 PM",
    status: "Moving towards destination",
  },
  {
    trackingNumber: "SHP-10247",
    driver: "Driver #A07",
    lastLocationUpdate: "12:01 PM",
    status: "Stopped - possible traffic",
  },
];

const mockDrivers = [
  {
    driverId: "A12",
    name: "Driver #A12",
    assignedShipments: 3,
    lastKnownLocation: "NH16, near Vijayawada",
    status: "Active",
  },
  {
    driverId: "A07",
    name: "Driver #A07",
    assignedShipments: 2,
    lastKnownLocation: "Chennai Bypass Road",
    status: "Active",
  },
  {
    driverId: "A19",
    name: "Driver #A19",
    assignedShipments: 1,
    lastKnownLocation: "Depot - Bengaluru",
    status: "Idle",
  },
];

const mockRoutes = [
  {
    routeId: "RT-501",
    origin: "Hyderabad Hub",
    destination: "Vijayawada Local Station",
    distance: "275 km",
    trafficCondition: "Moderate",
    optimizationNote: "Optimized route suggested (saves ~18 min)",
  },
  {
    routeId: "RT-502",
    origin: "Chennai Sorting Facility",
    destination: "Bengaluru - Customer Address",
    distance: "346 km",
    trafficCondition: "Heavy",
    optimizationNote: "Alternate route available",
  },
];

const mockEtaMonitoring = [
  {
    trackingNumber: "SHP-10234",
    originalEta: "Today, 5:45 PM",
    currentEta: "Today, 6:30 PM",
    delayStatus: "Minor delay predicted",
  },
  {
    trackingNumber: "SHP-10198",
    originalEta: "Today, 8:00 PM",
    currentEta: "Tomorrow, 11:00 AM",
    delayStatus: "Significant delay",
  },
];

const mockProofOfDelivery = [
  {
    trackingNumber: "SHP-10255",
    digitalSignature: "Captured",
    deliveryPhoto: "Captured",
    confirmation: "Confirmed by recipient",
    verification: "Verified",
    evidenceStorage: "Stored (mock reference: EVID-4471)",
  },
];

function LogisticsOperator() {
  // Local UI-only state: which shipment status filter is selected.
  // This does not call any API - it only filters the mock array above.
  const [statusFilter, setStatusFilter] = useState("All");

  const statusOptions = [
    "All",
    ...Array.from(new Set(mockShipments.map((s) => s.status))),
  ];

  const filteredShipments =
    statusFilter === "All"
      ? mockShipments
      : mockShipments.filter((s) => s.status === statusFilter);

  return (
    <div className="logistics-operator-page">
      <div className="lo-header">
        <h2>Logistics Operator Dashboard</h2>
        <p className="lo-subtext">
          Operational overview for shipment tracking, delivery monitoring,
          route management and proof of delivery.
        </p>
        <span className="mock-badge">Mock data - no backend connected</span>
      </div>

      {/* 1. OPERATIONAL DASHBOARD / OVERVIEW */}
      <section className="lo-section">
        <h3 className="section-title">Operational Dashboard</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-value">
              {mockSummary.activeShipments}
            </span>
            <span className="summary-label">Active Shipments</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">
              {mockSummary.deliveriesInProgress}
            </span>
            <span className="summary-label">Deliveries In Progress</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">
              {mockSummary.delayedShipments}
            </span>
            <span className="summary-label">Delayed Shipments</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">
              {mockSummary.driversTracked}
            </span>
            <span className="summary-label">Drivers Being Tracked</span>
          </div>
        </div>
      </section>

      {/* 2. SHIPMENT TRACKING */}
      <section className="lo-section">
        <h3 className="section-title">Shipment Tracking</h3>

        <div className="filter-row">
          <label htmlFor="statusFilter">Filter by status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="lo-card-grid">
          {filteredShipments.map((shipment) => (
            <ShipmentCard
              key={shipment.trackingNumber}
              trackingNumber={shipment.trackingNumber}
              status={shipment.status}
              sender={shipment.sender}
              receiver={shipment.receiver}
              packageInfo={shipment.packageInfo}
              deliveryAddress={shipment.deliveryAddress}
              currentLocation={shipment.currentLocation}
              eta={shipment.eta}
              lastUpdated={shipment.lastUpdated}
            />
          ))}
          {filteredShipments.length === 0 && (
            <p className="empty-state">No shipments match this filter.</p>
          )}
        </div>
      </section>

      {/* 3. LIVE DELIVERY MONITORING */}
      <section className="lo-section">
        <h3 className="section-title">Live Delivery Monitoring</h3>
        <p className="section-desc">
          Location updates shown below are static mock values for UI
          demonstration only - this page is not connected to a live
          tracking feed.
        </p>
        <div className="lo-card-grid">
          {mockLiveDeliveries.map((delivery) => (
            <div className="lo-card" key={delivery.trackingNumber}>
              <div className="lo-card-header">
                <span className="tracking-number">
                  {delivery.trackingNumber}
                </span>
              </div>
              <p>
                <strong>Driver:</strong> {delivery.driver}
              </p>
              <p>
                <strong>Status:</strong> {delivery.status}
              </p>
              <p className="lo-card-meta">
                Last location update: {delivery.lastLocationUpdate}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DRIVER TRACKING */}
      <section className="lo-section">
        <h3 className="section-title">Driver Tracking</h3>
        <div className="lo-table-wrapper">
          <table className="lo-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Assigned Shipments</th>
                <th>Last Known Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockDrivers.map((driver) => (
                <tr key={driver.driverId}>
                  <td>{driver.name}</td>
                  <td>{driver.assignedShipments}</td>
                  <td>{driver.lastKnownLocation}</td>
                  <td>{driver.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. ROUTE MANAGEMENT */}
      <section className="lo-section">
        <h3 className="section-title">Route Management</h3>
        <p className="section-desc">
          Route visibility, planning, optimization and history concepts are
          represented below using mock route data.
        </p>
        <div className="lo-card-grid">
          {mockRoutes.map((route) => (
            <div className="lo-card" key={route.routeId}>
              <div className="lo-card-header">
                <span className="tracking-number">{route.routeId}</span>
              </div>
              <p>
                <strong>Origin:</strong> {route.origin}
              </p>
              <p>
                <strong>Destination:</strong> {route.destination}
              </p>
              <p>
                <strong>Distance:</strong> {route.distance}
              </p>
              <p>
                <strong>Traffic:</strong> {route.trafficCondition}
              </p>
              <p className="lo-card-meta">{route.optimizationNote}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ETA / DELAY MONITORING */}
      <section className="lo-section">
        <h3 className="section-title">ETA / Delay Monitoring</h3>
        <div className="lo-table-wrapper">
          <table className="lo-table">
            <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Original ETA</th>
                <th>Current ETA</th>
                <th>Delay Status</th>
              </tr>
            </thead>
            <tbody>
              {mockEtaMonitoring.map((row) => (
                <tr key={row.trackingNumber}>
                  <td>{row.trackingNumber}</td>
                  <td>{row.originalEta}</td>
                  <td>{row.currentEta}</td>
                  <td>{row.delayStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. PROOF OF DELIVERY */}
      <section className="lo-section">
        <h3 className="section-title">Proof of Delivery</h3>
        <div className="lo-card-grid">
          {mockProofOfDelivery.map((pod) => (
            <div className="lo-card" key={pod.trackingNumber}>
              <div className="lo-card-header">
                <span className="tracking-number">
                  {pod.trackingNumber}
                </span>
              </div>
              <p>
                <strong>Digital Signature:</strong> {pod.digitalSignature}
              </p>
              <p>
                <strong>Delivery Photo:</strong> {pod.deliveryPhoto}
              </p>
              <p>
                <strong>Confirmation:</strong> {pod.confirmation}
              </p>
              <p>
                <strong>Verification:</strong> {pod.verification}
              </p>
              <p className="lo-card-meta">{pod.evidenceStorage}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LogisticsOperator;