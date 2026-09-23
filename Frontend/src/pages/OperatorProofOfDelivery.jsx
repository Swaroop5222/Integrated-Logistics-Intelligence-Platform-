

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import "./OperatorProofOfDelivery.css";

const STATUS_OPTIONS = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED_DELIVERY",
  "CANCELLED",
];

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getStatusClass(status) {
  if (status === "DELIVERED") return "verified-status";
  if (status === "FAILED_DELIVERY" || status === "CANCELLED") {
    return "exception-status";
  }

  return "pending-status";
}

function OperatorProofOfDelivery() {
  const [shipments, setShipments] = useState([]);
  const [podRecords, setPodRecords] = useState({});
  const [selectedShipment, setSelectedShipment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [podLoading, setPodLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [remarks, setRemarks] = useState("");
  const [deliveredAt, setDeliveredAt] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("DELIVERED");

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    loadShipments();
  }, []);

  async function loadShipments() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/api/shipments");

      const list = Array.isArray(data)
        ? data
        : data?.content || data?.shipments || [];

      setShipments(list);

      await loadPodRecords(list);
    } catch (err) {
  console.error("Failed to load shipment data:", err);
  setError("Unable to load delivery information. Please try again.");
}finally {
      setLoading(false);
    }
  }

  async function loadPodRecords(list) {
    const records = {};

    await Promise.all(
      list.map(async (shipment) => {
        try {
          const pod = await apiRequest(
            `/api/shipments/${shipment.id}/pod`
          );

          if (pod) {
            records[shipment.id] = pod;
          }
        } catch {
          // A shipment without POD is normal.
        }
      })
    );

    setPodRecords(records);
  }

  function openShipment(shipment) {
    setSelectedShipment(shipment);

    const existingPod = podRecords[shipment.id];

    if (existingPod) {
      setRemarks(existingPod.remarks || "");
      setDeliveryStatus(existingPod.deliveryStatus || "DELIVERED");
      setDeliveredAt(
        existingPod.deliveredAt
          ? existingPod.deliveredAt.slice(0, 16)
          : ""
      );
    } else {
      setRemarks("");
      setDeliveryStatus("DELIVERED");

      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

      setDeliveredAt(now.toISOString().slice(0, 16));
    }

    setHasSignature(false);

    requestAnimationFrame(() => {
      clearSignature();
    });
  }

  function closeShipment() {
    setSelectedShipment(null);
    setError("");
    setHasSignature(false);
  }

  function getCanvasCoordinates(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startDrawing(event) {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");
    const { x, y } = getCanvasCoordinates(event);

    context.beginPath();
    context.moveTo(x, y);

    setIsDrawing(true);
    setHasSignature(true);
  }

  function draw(event) {
    if (!isDrawing) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");
    const { x, y } = getCanvasCoordinates(event);

    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = "#111827";

    context.lineTo(x, y);
    context.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clearSignature() {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);

    setHasSignature(false);
  }

  function getSignatureData() {
    const canvas = canvasRef.current;

    if (!canvas || !hasSignature) {
      return "";
    }

    return canvas.toDataURL("image/png");
  }

  async function savePod() {
    if (!selectedShipment) return;

    if (selectedShipment.status !== "DELIVERED") {
      setError(
        "POD can only be created after the shipment is DELIVERED."
      );
      return;
    }

    if (podRecords[selectedShipment.id]) {
      setError("A POD already exists for this shipment.");
      return;
    }

    const signature = getSignatureData();

    if (!signature) {
      setError("Please capture the receiver signature.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        deliveredAt: deliveredAt
          ? new Date(deliveredAt).toISOString().slice(0, 19)
          : new Date().toISOString().slice(0, 19),
        deliveryStatus,
        signature,
        remarks,
      };

      const createdPod = await apiRequest(
        `/api/shipments/${selectedShipment.id}/pod`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      setPodRecords((previous) => ({
        ...previous,
        [selectedShipment.id]: createdPod,
      }));

      closeShipment();
    } catch (err) {
      setError(err.message || "Failed to save proof of delivery.");
    } finally {
      setSaving(false);
    }
  }

  const deliveredShipments = shipments.filter(
    (shipment) => shipment.status === "DELIVERED"
  );

  const verifiedCount = Object.keys(podRecords).length;

  const pendingCount = deliveredShipments.filter(
    (shipment) => !podRecords[shipment.id]
  ).length;

  const exceptionCount = shipments.filter(
    (shipment) =>
      shipment.status === "FAILED_DELIVERY" ||
      shipment.status === "CANCELLED"
  ).length;

  return (
    <div className="pod-page">
      <aside className="pod-sidebar">
        <div className="pod-brand">
          <div className="pod-brand-logo">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>Operator Console</span>
          </div>
        </div>

        <nav className="pod-nav">
          <Link to="/dashboard/operator" className="pod-nav-link">
            Dashboard
          </Link>

          <Link
            to="/operator/shipment-tracking"
            className="pod-nav-link"
          >
            Shipment Tracking
          </Link>

          <Link
            to="/operator/live-delivery"
            className="pod-nav-link"
          >
            Live Deliveries
          </Link>

          <Link
            to="/operator/driver-tracking"
            className="pod-nav-link"
          >
            Driver Tracking
          </Link>

          <Link to="/operator/routes" className="pod-nav-link">
            Route Management
          </Link>

          <Link to="/operator/eta-delay" className="pod-nav-link">
            ETA & Delays
          </Link>

          <Link
            to="/operator/pod"
            className="pod-nav-link active"
          >
            Proof of Delivery
          </Link>
        </nav>

        <div className="pod-sidebar-bottom">
          <div className="pod-user">
            <div className="pod-avatar">OP</div>

            <div>
              <strong>Logistics Operator</strong>
              <span>Operations Team</span>
            </div>
          </div>

          <Link to="/login" className="pod-logout">
            Logout
          </Link>
        </div>
      </aside>

      <main className="pod-main">
        <header className="pod-header">
          <div>
            <span className="pod-eyebrow">
              LOGISTICS OPERATIONS
            </span>

            <h1>Proof of Delivery</h1>

            <p>
              View and record delivery confirmations directly from
              shipment data.
            </p>
          </div>

          <div className="pod-live-status">
            <span></span>
             System Online
          </div>
        </header>

        {error && (
          <div className="pod-error">
            {error}
          </div>
        )}

        <section className="pod-stats">
          <div className="pod-stat-card orange">
            <div className="pod-stat-icon">✓</div>

            <div>
  <span>Delivered Shipments</span>
  <strong>{deliveredShipments.length}</strong>
</div>
          </div>

          <div className="pod-stat-card green">
            <div className="pod-stat-icon">✓</div>

            <div>
              <span>POD Verified</span>
              <strong>{verifiedCount}</strong>
              <small>Verified deliveries</small>
            </div>
          </div>

          <div className="pod-stat-card purple">
            <div className="pod-stat-icon">◷</div>

            <div>
              <span>POD Pending</span>
              <strong>{pendingCount}</strong>
              <small>Awaiting confirmation</small>
            </div>
          </div>

          <div className="pod-stat-card red">
            <div className="pod-stat-icon">!</div>

            <div>
              <span>Exceptions</span>
              <strong>{exceptionCount}</strong>
              <small>Requires attention</small>
            </div>
          </div>
        </section>

        <section className="pod-panel pod-table-panel">
          <div className="pod-panel-header">
            <div>
              <span className="pod-panel-label">
                SHIPMENT DELIVERY RECORDS
              </span>

              <h2>Proof of Delivery</h2>

              <p>
  Shipment and delivery information
</p>
            </div>

            <Link
              to="/operator/shipment-tracking"
              className="pod-view-link"
            >
              View shipments →
            </Link>
          </div>

          {loading ? (
            <div className="pod-empty-state">
              Loading shipment data...
            </div>
          ) : shipments.length === 0 ? (
            <div className="pod-empty-state">
              No shipments found.
            </div>
          ) : (
            <div className="pod-table-wrapper">
              <table className="pod-table">
                <thead>
                  <tr>
                    <th>Shipment</th>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Receiver</th>
                    <th>Delivered</th>
                    <th>POD</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {shipments.map((shipment) => {
                    const pod = podRecords[shipment.id];

                    return (
                      <tr key={shipment.id}>
                        <td>
                          <div className="pod-shipment">
                            <span className="pod-shipment-icon">
                              ✓
                            </span>

                            <div>
                              <strong>
                                {shipment.trackingNumber ||
                                  `Shipment #${shipment.id}`}
                              </strong>

                              <small>
                                ID: {shipment.id}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          {shipment.referenceNumber ||
                            shipment.orderId ||
                            shipment.reference ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={`pod-status ${getStatusClass(
                              shipment.status
                            )}`}
                          >
                            <span></span>
                            {shipment.status || "UNKNOWN"}
                          </span>
                        </td>

                        <td>
                          {pod?.receiverName ||
                            shipment.receiverName ||
                            shipment.receiver?.name ||
                            "—"}
                        </td>

                        <td>
                          {pod
                            ? formatDateTime(pod.deliveredAt)
                            : "—"}
                        </td>

                        <td>
                          <span
                            className={`pod-status ${
                              pod
                                ? "verified-status"
                                : shipment.status === "DELIVERED"
                                ? "pending-status"
                                : "exception-status"
                            }`}
                          >
                            <span></span>
                            {pod
                              ? "Verified"
                              : shipment.status === "DELIVERED"
                              ? "Pending"
                              : "Not Available"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="pod-view-link"
                            onClick={() =>
                              openShipment(shipment)
                            }
                          >
                            {pod ? "View POD" : "Open"} →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selectedShipment && (
        <div className="pod-modal-backdrop">
          <div className="pod-modal">
            <div className="pod-modal-header">
              <div>
                <span className="pod-panel-label">
                  PROOF OF DELIVERY
                </span>

                <h2>
                  {selectedShipment.trackingNumber ||
                    `Shipment #${selectedShipment.id}`}
                </h2>
              </div>

              <button
                type="button"
                className="pod-close"
                onClick={closeShipment}
              >
                ×
              </button>
            </div>

            <div className="pod-details-grid">
              <div>
                <span>Shipment ID</span>
                <strong>{selectedShipment.id}</strong>
              </div>

              <div>
                <span>Reference</span>
                <strong>
                  {selectedShipment.referenceNumber ||
                    selectedShipment.orderId ||
                    selectedShipment.reference ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>Shipment Status</span>
                <strong>
                  {selectedShipment.status || "—"}
                </strong>
              </div>

              <div>
                <span>Tracking Number</span>
                <strong>
                  {selectedShipment.trackingNumber || "—"}
                </strong>
              </div>
            </div>

            <div className="pod-receiver-section">
              <h3>Receiver Details</h3>

              <div className="pod-details-grid">
                <div>
                  <span>Name</span>
                  <strong>
                    {podRecords[selectedShipment.id]
                      ?.receiverName ||
                      selectedShipment.receiverName ||
                      selectedShipment.receiver?.name ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {podRecords[selectedShipment.id]
                      ?.receiverPhone ||
                      selectedShipment.receiverPhone ||
                      selectedShipment.receiver?.phone ||
                      "—"}
                  </strong>
                </div>

                <div className="pod-address">
                  <span>Address</span>
                  <strong>
                    {podRecords[selectedShipment.id]
                      ?.receiverAddress ||
                      selectedShipment.receiverAddress ||
                      selectedShipment.receiver?.address ||
                      "—"}
                  </strong>
                </div>
              </div>
            </div>

            {podRecords[selectedShipment.id] ? (
              <div className="pod-existing-record">
                <h3>Existing POD</h3>

                <div className="pod-details-grid">
                  <div>
                    <span>Delivery Time</span>
                    <strong>
                      {formatDateTime(
                        podRecords[selectedShipment.id]
                          .deliveredAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>
                      {
                        podRecords[selectedShipment.id]
                          .deliveryStatus
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Delivered By</span>
                    <strong>
                      {
                        podRecords[selectedShipment.id]
                          .deliveredByUserName
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Remarks</span>
                    <strong>
                      {podRecords[selectedShipment.id].remarks ||
                        "—"}
                    </strong>
                  </div>
                </div>

                {podRecords[selectedShipment.id].signature && (
                  <div className="pod-signature-preview">
                    <h3>Receiver Signature</h3>

                    <img
                      src={
                        podRecords[selectedShipment.id].signature
                      }
                      alt="Receiver signature"
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="pod-form-section">
                  <h3>Delivery Confirmation</h3>

                  <div className="pod-form-grid">
                    <label>
                      Delivery Time
                      <input
                        type="datetime-local"
                        value={deliveredAt}
                        onChange={(event) =>
                          setDeliveredAt(event.target.value)
                        }
                      />
                    </label>

                    <label>
                      Delivery Status
                      <select
                        value={deliveryStatus}
                        onChange={(event) =>
                          setDeliveryStatus(event.target.value)
                        }
                      >
                        <option value="DELIVERED">
                          DELIVERED
                        </option>
                      </select>
                    </label>
                  </div>

                  <label className="pod-remarks">
                    Remarks
                    <textarea
                      value={remarks}
                      onChange={(event) =>
                        setRemarks(event.target.value)
                      }
                      placeholder="Enter delivery remarks..."
                      rows="3"
                    />
                  </label>
                </div>

                <div className="pod-signature-section">
                  <div className="pod-signature-header">
                    <h3>Receiver Signature</h3>

                    <button
                      type="button"
                      onClick={clearSignature}
                    >
                      Clear
                    </button>
                  </div>

                  <canvas
                    ref={canvasRef}
                    width={700}
                    height={220}
                    className="pod-signature-canvas"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                  />

                  <small>
                    Ask the receiver to sign inside the box.
                  </small>
                </div>

                <div className="pod-modal-actions">
                  <button
                    type="button"
                    className="pod-cancel-button"
                    onClick={closeShipment}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="pod-save-button"
                    onClick={savePod}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Proof of Delivery"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OperatorProofOfDelivery;
