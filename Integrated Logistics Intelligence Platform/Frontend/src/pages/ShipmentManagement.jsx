import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ShipmentManagement.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api/shipments";
const statuses = ["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED_DELIVERY", "CANCELLED"];
const nextStatuses = {
  CREATED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED_DELIVERY"],
  FAILED_DELIVERY: ["OUT_FOR_DELIVERY"],
};

function formatStatus(status) {
  return status?.replaceAll("_", " ") || "UNKNOWN";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "Not available";
}

function ShipmentManagement() {
  const [shipments, setShipments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ receiverName: "", receiverAddress: "", packageDescription: "", packageWeight: "" });
  const [lifecycle, setLifecycle] = useState({ status: "", description: "" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const selected = shipments.find((shipment) => shipment.id === selectedId) || shipments[0];

  async function request(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Request failed (${response.status})`);
    }
    return response.status === 204 ? null : response.json();
  }

  async function loadShipments() {
    try {
      setError("");
      const data = await request(API_URL);
      setShipments(data);
      if (!selectedId && data.length) selectShipment(data[0]);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function loadHistory(shipmentId) {
    try {
      setHistory(await request(`${API_URL}/${shipmentId}/history`));
    } catch (requestError) {
      setHistory([]);
      setError(requestError.message);
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    void loadShipments();
  }, []);

  useEffect(() => {
    if (selected) void loadHistory(selected.id);
  }, [selected?.id]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const filteredShipments = useMemo(() => shipments.filter((shipment) => {
    const value = search.toLowerCase();
    const matchesSearch = [shipment.trackingNumber, shipment.senderName, shipment.receiverName, shipment.senderAddress, shipment.receiverAddress]
      .some((field) => field?.toLowerCase().includes(value));
    return matchesSearch && (statusFilter === "ALL" || shipment.status === statusFilter);
  }), [shipments, search, statusFilter]);

  async function saveUpdate(event) {
    event.preventDefault();
    try {
      const updated = await request(`${API_URL}/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, packageWeight: Number(editForm.packageWeight) }),
      });
      setShipments((current) => current.map((item) => item.id === updated.id ? updated : item));
      setEditing(false);
      setNotice("Shipment updated successfully.");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateLifecycle(event) {
    event.preventDefault();
    if (!lifecycle.status) return;
    try {
      const updated = await request(`${API_URL}/${selected.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lifecycle),
      });
      setShipments((current) => current.map((item) => item.id === updated.id ? updated : item));
      await loadHistory(updated.id);
      setLifecycle({ status: nextStatuses[updated.status]?.[0] || "", description: "" });
      setNotice("Lifecycle status updated successfully.");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function cancelShipment() {
    if (!selected || !window.confirm(`Cancel ${selected.trackingNumber}?`)) return;
    try {
      const updated = await request(`${API_URL}/${selected.id}`, { method: "DELETE" });
      setShipments((current) => current.map((item) => item.id === updated.id ? updated : item));
      await loadHistory(updated.id);
      setNotice("Shipment cancelled successfully.");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function selectShipment(shipment) {
    setSelectedId(shipment.id);
    setEditForm({
      receiverName: shipment.receiverName || "",
      receiverAddress: shipment.receiverAddress || "",
      packageDescription: shipment.packageDescription || "",
      packageWeight: shipment.packageWeight || "",
    });
    setLifecycle({ status: nextStatuses[shipment.status]?.[0] || "", description: "" });
    setEditing(false);
    setNotice("");
    setError("");
  }

  return (
    <div className="shipment-management-page">
      <aside className="management-sidebar">
        <div className="management-logo"><div className="management-logo-icon">S</div><div><h2>ShipTrack Pro</h2><span>LOGISTICS INTELLIGENCE</span></div></div>
        <div className="management-menu-title">BUSINESS CLIENT</div>
        <nav className="management-navigation">
          <Link to="/dashboard/business" className="management-nav-link">⌂ Overview</Link>
          <Link to="/business/create-shipment" className="management-nav-link">＋ Create Shipment</Link>
          <Link to="/business/shipment-management" className="management-nav-link active">▣ Shipment Management</Link>
          <Link to="/business/shipment-history" className="management-nav-link">◷ Shipment History</Link>
        </nav>
        <Link to="/login" className="management-logout">⇥ Logout</Link>
      </aside>

      <main className="management-main">
        <header className="management-header">
          <div><div className="management-breadcrumb">BUSINESS CLIENT / SHIPMENT MANAGEMENT</div><h1>Shipment Management</h1><p>View and manage shipments from the live backend.</p></div>
          <div className="management-profile"><div className="management-avatar">R</div><div><strong>Rekha Patil</strong><span>Business Client</span></div></div>
        </header>

        {notice && <div className="management-notice">{notice}</div>}
        {error && <div className="management-error">{error}</div>}

        <section className="management-summary">
          <div className="summary-card"><span>TOTAL SHIPMENTS</span><strong>{shipments.length}</strong><small>From backend</small></div>
          <div className="summary-card"><span>ACTIVE</span><strong>{shipments.filter((item) => !["DELIVERED", "CANCELLED"].includes(item.status)).length}</strong><small>In progress</small></div>
          <div className="summary-card"><span>DELIVERED</span><strong>{shipments.filter((item) => item.status === "DELIVERED").length}</strong><small>Completed</small></div>
          <div className="summary-card"><span>CANCELLED</span><strong>{shipments.filter((item) => item.status === "CANCELLED").length}</strong><small>Closed</small></div>
        </section>

        <section className="management-panel">
          <div className="management-panel-header"><div><span>SHIPMENT DATABASE</span><h2>All Shipments</h2></div><Link to="/business/create-shipment" className="management-create-btn">+ Create Shipment</Link></div>
          <div className="management-tools">
            <div className="management-search"><span>⌕</span><input placeholder="Search tracking, sender or receiver..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
            <select className="management-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All Statuses</option>{statuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}</select>
          </div>
          <div className="management-table-wrapper">
            <table className="management-table"><thead><tr><th>TRACKING ID</th><th>SENDER</th><th>RECEIVER</th><th>STATUS</th><th>CREATED</th><th>ACTION</th></tr></thead>
              <tbody>{filteredShipments.map((shipment) => <tr key={shipment.id} className={selected?.id === shipment.id ? "selected-row" : ""} onClick={() => selectShipment(shipment)}>
                <td><strong>{shipment.trackingNumber}</strong><small>#{shipment.id}</small></td><td>{shipment.senderName}</td><td>{shipment.receiverName}</td><td><span className={`management-status ${shipment.status.toLowerCase()}`}>● {formatStatus(shipment.status)}</span></td><td>{formatDate(shipment.createdAt)}</td><td><button className="manage-action" onClick={() => selectShipment(shipment)}>View</button></td>
              </tr>)}</tbody>
            </table>
            {!filteredShipments.length && <div className="no-results"><h3>No shipments found</h3><p>Try changing your search or create a shipment.</p></div>}
          </div>
        </section>

        {selected && <section className="shipment-detail-card">
          <div className="detail-title"><div><span>SHIPMENT DETAILS</span><h2>{selected.trackingNumber}</h2><p>{selected.senderAddress} to {selected.receiverAddress}</p></div><span className={`management-status ${selected.status.toLowerCase()}`}>{formatStatus(selected.status)}</span></div>
          <div className="detail-actions"><button onClick={() => setEditing((value) => !value)} disabled={["DELIVERED", "CANCELLED"].includes(selected.status)}>{editing ? "Close edit" : "Edit shipment"}</button><button className="danger-action" onClick={cancelShipment} disabled={["DELIVERED", "CANCELLED"].includes(selected.status)}>Cancel shipment</button></div>
          {editing && <form className="shipment-edit-form" onSubmit={saveUpdate}><input value={editForm.receiverName} onChange={(event) => setEditForm({ ...editForm, receiverName: event.target.value })} placeholder="Receiver name" required /><input value={editForm.receiverAddress} onChange={(event) => setEditForm({ ...editForm, receiverAddress: event.target.value })} placeholder="Receiver address" required /><input value={editForm.packageDescription} onChange={(event) => setEditForm({ ...editForm, packageDescription: event.target.value })} placeholder="Package description" required /><input type="number" min="0.01" step="0.01" value={editForm.packageWeight} onChange={(event) => setEditForm({ ...editForm, packageWeight: event.target.value })} placeholder="Weight (kg)" required /><button type="submit">Save changes</button></form>}
          {nextStatuses[selected.status]?.length > 0 && <form className="lifecycle-form" onSubmit={updateLifecycle}><h3>Update lifecycle</h3><select value={lifecycle.status} onChange={(event) => setLifecycle({ ...lifecycle, status: event.target.value })}>{nextStatuses[selected.status].map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}</select><input value={lifecycle.description} onChange={(event) => setLifecycle({ ...lifecycle, description: event.target.value })} placeholder="Status update description (optional)" /><button type="submit">Update status</button></form>}
          <div className="shipment-history"><h3>Lifecycle history</h3>{history.length ? history.map((item) => <div className="history-item" key={item.id}><strong>{formatStatus(item.status)}</strong><span>{item.description || "No description"} · {formatDate(item.changedAt)}</span></div>) : <p>No lifecycle history available.</p>}</div>
        </section>}
      </main>
    </div>
  );
}

export default ShipmentManagement;
