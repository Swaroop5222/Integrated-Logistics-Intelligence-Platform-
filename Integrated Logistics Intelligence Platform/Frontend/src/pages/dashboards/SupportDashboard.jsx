import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Package,
  Users,
  Bell,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  Eye,
  ArrowRight,
  LogOut,
  Menu,
  X,
  UserRound,
  MapPin,
  MessageCircle,
  ClipboardCheck,
  CircleAlert,
  ChevronRight,
} from "lucide-react";

import "./SupportDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api/shipments";

function toSupportShipment(shipment) {
  return {
    id: shipment.id,
    rawStatus: shipment.status,
    tracking: shipment.trackingNumber,
    order: `Shipment #${shipment.id}`,
    customer: shipment.receiverName,
    destination: shipment.receiverAddress,
    status: shipment.status.replaceAll("_", " "),
    eta: shipment.status === "DELIVERED" ? "Delivered" : "Not available",
    updated: shipment.updatedAt || shipment.createdAt || "Not available",
  };
}

function SupportDashboard() {
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState("");
  const activeCount = shipments.filter((shipment) => !["DELIVERED", "CANCELLED"].includes(shipment.rawStatus)).length;
  const deliveredCount = shipments.filter((shipment) => shipment.rawStatus === "DELIVERED").length;
  const attentionCount = shipments.filter((shipment) => shipment.rawStatus === "FAILED_DELIVERY").length;
  const customers = shipments.map((shipment) => ({ name: shipment.customer, shipment: shipment.tracking, activity: `Status: ${shipment.status}`, time: shipment.updated }));
  const alerts = shipments.filter((shipment) => shipment.rawStatus === "FAILED_DELIVERY").map((shipment) => ({ title: "Delivery exception", description: `${shipment.tracking} requires attention.`, time: shipment.updated, type: "danger" }));

  async function updateShipment(id, method, body) {
    try {
      const response = await fetch(`${API_URL}/${id}${method === "PATCH" ? "/status" : ""}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status})`);
      const updated = await response.json();
      setShipments((current) => current.map((item) => item.id === updated.id ? toSupportShipment(updated) : item));
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load shipments (${response.status})`);
        return response.json();
      })
      .then((data) => setShipments(data.map(toSupportShipment)))
      .catch(() => setShipments([]));
  }, []);

  const filteredShipments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return shipments;
    }

    return shipments.filter((shipment) =>
      [
        shipment.tracking,
        shipment.order,
        shipment.customer,
        shipment.destination,
        shipment.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [search, shipments]);

  return (
    <div className="support-page">
      {error && <div className="support-error">{error}</div>}
      {mobileOpen && (
        <div
          className="support-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside className={`support-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="support-logo">
          <div className="support-logo-mark">
            <Package size={21} />
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>

          <button
            className="support-close"
            onClick={() => setMobileOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        {/* Role */}
        <div className="support-profile">
          <div className="support-avatar">SA</div>

          <div>
            <strong>Support Agent</strong>
            <span>Customer Operations</span>
          </div>
        </div>

        <nav className="support-navigation">
          <p className="support-nav-title">SUPPORT WORKSPACE</p>

          <Link
            to="/dashboard/support"
            className="support-nav-link active"
            onClick={() => setMobileOpen(false)}
          >
            <LayoutDashboard size={17} />
            <span>Overview</span>
          </Link>

          <Link
            to="/tracking"
            className="support-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <Search size={17} />
            <span>Shipment Lookup</span>
          </Link>

          <Link
            to="/shipments/active"
            className="support-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <Package size={17} />
            <span>Active Shipments</span>
          </Link>

          <Link
            to="/shipments/history"
            className="support-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <Clock3 size={17} />
            <span>Shipment History</span>
          </Link>

          <Link
            to="/notifications"
            className="support-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <Bell size={17} />
            <span>Notifications</span>
            <b>4</b>
          </Link>

          <p className="support-nav-title support-nav-second">
            INFORMATION
          </p>

          <Link
            to="/tracking-insights"
            className="support-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <ClipboardCheck size={17} />
            <span>Tracking Insights</span>
          </Link>
        </nav>

        {/* Sidebar bottom */}
        <div className="support-sidebar-bottom">
          <div className="support-info-box">
            <div className="support-info-icon">
              <MessageCircle size={17} />
            </div>

            <div>
              <strong>Customer Assistance</strong>
              <p>
                Quickly access shipment and delivery information.
              </p>
            </div>
          </div>

          <Link to="/login" className="support-logout">
            <LogOut size={17} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="support-main">

        {/* Header */}

        <header className="support-header">
          <div className="support-header-left">
            <button
              className="support-mobile-menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>

            <div>
              <span className="support-eyebrow">
                CUSTOMER OPERATIONS
              </span>

              <h1>Support Center</h1>

              <p>
                Help customers with shipment and delivery information.
              </p>
            </div>
          </div>

          <div className="support-header-right">
            <div className="support-online">
              <span />
              Agent Online
            </div>

            <button className="support-notification">
              <Bell size={18} />
              <i />
            </button>

            <div className="support-header-profile">
              <div>SA</div>

              <section>
                <strong>Support Agent</strong>
                <span>Online</span>
              </section>
            </div>
          </div>
        </header>

        <div className="support-content">

          {/* ================= STATS ================= */}

          <section className="support-stats">

            <div className="support-stat">
              <div className="support-stat-icon orange">
                <Package size={20} />
              </div>

              <div className="support-stat-content">
                <span>Active Shipments</span>
                <strong>{activeCount}</strong>
                <small>Currently in transit</small>
              </div>
            </div>

            <div className="support-stat">
              <div className="support-stat-icon purple">
                <Users size={20} />
              </div>

              <div className="support-stat-content">
                <span>Customers</span>
                <strong>{new Set(shipments.map((shipment) => shipment.customer)).size}</strong>
                <small>Shipment receivers</small>
              </div>
            </div>

            <div className="support-stat">
              <div className="support-stat-icon cyan">
                <CheckCircle2 size={20} />
              </div>

              <div className="support-stat-content">
                <span>Delivered Today</span>
                <strong>{deliveredCount}</strong>
                <small>Successful deliveries</small>
              </div>
            </div>

            <div className="support-stat">
              <div className="support-stat-icon red">
                <AlertTriangle size={20} />
              </div>

              <div className="support-stat-content">
                <span>Attention Needed</span>
                <strong>{attentionCount}</strong>
                <small>Delivery exceptions</small>
              </div>
            </div>

          </section>

          {/* ================= SEARCH ================= */}

          <section className="support-search-card">

            <div className="support-search-title">
              <div className="support-search-icon">
                <Search size={22} />
              </div>

              <div>
                <span>FAST LOOKUP</span>
                <h2>Find Shipment Information</h2>
                <p>
                  Search using tracking number, order ID or customer name.
                </p>
              </div>
            </div>

            <div className="support-search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="TRK-2026-101, ORD-88421 or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button onClick={() => setSearch("")}>
                  Clear
                </button>
              )}
            </div>

          </section>

          {/* ================= TOP GRID ================= */}

          <section className="support-top-grid">

            {/* Shipment Results */}

            <div className="support-card shipment-card">

              <div className="support-card-header">
                <div>
                  <span>SHIPMENT VISIBILITY</span>
                  <h2>Shipment Information</h2>
                </div>

                <Link to="/tracking">
                  Open Tracking
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="support-shipment-list">

                {filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => (
                    <div
                      className="support-shipment"
                      key={shipment.tracking}
                    >
                      <div className="shipment-symbol">
                        <Package size={17} />
                      </div>

                      <div className="shipment-details">
                        <strong>{shipment.tracking}</strong>

                        <span>
                          {shipment.customer}
                        </span>

                        <small>
                          <MapPin size={11} />
                          {shipment.destination}
                        </small>
                      </div>

                      <div className="shipment-state">
                        <span
                          className={`support-status ${shipment.status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {shipment.status}
                        </span>

                        <small>
                          ETA {shipment.eta}
                        </small>
                      </div>

                      <Link
                        to={`/tracking?trackingNumber=${shipment.tracking}`}
                        className="shipment-eye"
                        title="View shipment"
                      >
                        <Eye size={16} />
                      </Link>
                      <button type="button" onClick={() => updateShipment(shipment.id, "DELETE")} disabled={shipment.rawStatus === "DELIVERED" || shipment.rawStatus === "CANCELLED"}>
                        Cancel
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="support-no-results">
                    <Search size={27} />
                    <strong>No shipment found</strong>
                    <span>Try another tracking number or customer.</span>
                  </div>
                )}

              </div>
            </div>

            {/* Customer Activity */}

            <div className="support-card customer-card">

              <div className="support-card-header">
                <div>
                  <span>CUSTOMER INFORMATION</span>
                  <h2>Recent Activity</h2>
                </div>

                <Users size={18} />
              </div>

              <div className="customer-list">

                {customers.map((customer, index) => (
                  <div className="customer-item" key={index}>

                    <div className="customer-avatar">
                      {customer.name.charAt(0)}
                    </div>

                    <div className="customer-data">
                      <strong>{customer.name}</strong>

                      <span>{customer.activity}</span>

                      <small>
                        {customer.shipment} · {customer.time}
                      </small>
                    </div>

                    <ChevronRight size={15} />

                  </div>
                ))}

              </div>

              <div className="customer-footer">
                <UserRound size={15} />
                <span>Customer information is read-only</span>
              </div>

            </div>

          </section>

          {/* ================= BOTTOM GRID ================= */}

          <section className="support-bottom-grid">

            {/* Delivery exceptions */}

            <div className="support-card exceptions-card">

              <div className="support-card-header">
                <div>
                  <span>DELIVERY MONITORING</span>
                  <h2>Exceptions Requiring Attention</h2>
                </div>

                <div className="exception-count">{attentionCount}</div>
              </div>

              <div className="exception-summary">

                <div className="exception-box danger">
                  <AlertTriangle size={18} />

                  <div>
                    <strong>{attentionCount}</strong>
                    <span>Delayed shipments</span>
                  </div>
                </div>

                <div className="exception-box warning">
                  <Clock3 size={18} />

                  <div>
                    <strong>0</strong>
                    <span>ETA changes</span>
                  </div>
                </div>

                <div className="exception-box success">
                  <CheckCircle2 size={18} />

                  <div>
                    <strong>0</strong>
                    <span>Recently resolved</span>
                  </div>
                </div>

              </div>

              <div className="exception-message">
                <CircleAlert size={16} />

                <span>
                  Review shipment details before providing delivery
                  information to customers.
                </span>
              </div>

            </div>

            {/* Notifications */}

            <div className="support-card notifications-card">

              <div className="support-card-header">
                <div>
                  <span>IMPORTANT UPDATES</span>
                  <h2>Notifications</h2>
                </div>

                <Link to="/notifications">
                  View all
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="support-alert-list">

                {alerts.map((alert, index) => (
                  <div className="support-alert" key={index}>

                    <div className={`support-alert-icon ${alert.type}`}>
                      {alert.type === "danger" && (
                        <AlertTriangle size={16} />
                      )}

                      {alert.type === "warning" && (
                        <Clock3 size={16} />
                      )}

                      {alert.type === "success" && (
                        <CheckCircle2 size={16} />
                      )}
                    </div>

                    <div>
                      <strong>{alert.title}</strong>
                      <p>{alert.description}</p>
                      <small>{alert.time}</small>
                    </div>

                  </div>
                ))}

              </div>

            </div>

          </section>

          {/* ================= QUICK ACTIONS ================= */}

          <section className="support-card quick-card">

            <div className="support-card-header">
              <div>
                <span>SUPPORT TOOLS</span>
                <h2>Quick Actions</h2>
              </div>
            </div>

            <div className="support-quick-actions">

              <Link to="/tracking">
                <div className="quick-icon orange">
                  <Search size={19} />
                </div>

                <div>
                  <strong>Lookup Shipment</strong>
                  <span>Search tracking information</span>
                </div>

                <ArrowRight size={15} />
              </Link>

              <Link to="/shipments/active">
                <div className="quick-icon cyan">
                  <Package size={19} />
                </div>

                <div>
                  <strong>Active Shipments</strong>
                  <span>View current deliveries</span>
                </div>

                <ArrowRight size={15} />
              </Link>

              <Link to="/shipments/history">
                <div className="quick-icon purple">
                  <Clock3 size={19} />
                </div>

                <div>
                  <strong>Shipment History</strong>
                  <span>Review previous deliveries</span>
                </div>

                <ArrowRight size={15} />
              </Link>

              <Link to="/notifications">
                <div className="quick-icon red">
                  <Bell size={19} />
                </div>

                <div>
                  <strong>Notifications</strong>
                  <span>Check important updates</span>
                </div>

                <ArrowRight size={15} />
              </Link>

            </div>

          </section>

          {/* ================= FOOTER ================= */}

          <div className="support-footer-status">

            <div>
              <span className="support-green-dot" />
              <strong>Support workspace operational</strong>
              <small>Information synchronized recently</small>
            </div>

            <div className="support-footer-right">
              <span>Shipment Data</span>
              <b>Available</b>

              <span>Tracking Data</span>
              <b>Available</b>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default SupportDashboard;