import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Package,
  Search,
  Truck,
} from "lucide-react";

import { apiRequest } from "../api";
import "./ShipmentManagement.css";

const ACTIVE_STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
];

function getShipments(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.shipments)) return data.shipments;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getStatus(shipment) {
  return String(shipment?.status || "UNKNOWN").toUpperCase();
}

function getTrackingNumber(shipment) {
  return shipment?.trackingNumber || "Data unavailable";
}

function getCustomerName(shipment) {
  return shipment?.receiverName || "Data unavailable";
}

function getCustomerPhone(shipment) {
  return shipment?.receiverPhone || "Data unavailable";
}

function getOrigin(shipment) {
  const senderName = shipment?.senderName || "Data unavailable";
  const senderAddress = shipment?.senderAddress || "Data unavailable";

  return `${senderName} · ${senderAddress}`;
}

function getDestination(shipment) {
  const receiverName = shipment?.receiverName || "Data unavailable";
  const receiverAddress = shipment?.receiverAddress || "Data unavailable";

  return `${receiverName} · ${receiverAddress}`;
}

function getStatusClass(status) {
  switch (status) {
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
      return "in-transit";

    case "PICKED_UP":
      return "picked-up";

    case "DELIVERED":
      return "delivered";

    case "FAILED_DELIVERY":
    case "CANCELLED":
      return "delayed";

    default:
      return "";
  }
}

function formatStatus(status) {
  return String(status || "UNKNOWN")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) {
    return "Data unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name) {
  if (!name) {
    return "?";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function ShipmentManagement() {
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [userData, shipmentData] = await Promise.all([
        apiRequest("/api/users/me"),
        apiRequest("/api/shipments"),
      ]);

      setUser(userData);
      setShipments(getShipments(shipmentData));
    } catch (err) {
      console.error("Failed to load shipment data:", err);

      setError(
        err?.message ||
          "Unable to load shipment data from the backend."
      );

      setShipments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /*
   * Only shipments that are actually active according
   * to the existing backend shipment status are displayed.
   */
  const activeShipments = useMemo(() => {
    return shipments.filter((shipment) =>
      ACTIVE_STATUSES.includes(getStatus(shipment))
    );
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return activeShipments.filter((shipment) => {
      const status = getStatus(shipment);

      if (
        statusFilter !== "ALL" &&
        status !== statusFilter
      ) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchableText = [
        getTrackingNumber(shipment),
        shipment?.referenceId,
        getCustomerName(shipment),
        getCustomerPhone(shipment),
        getOrigin(shipment),
        getDestination(shipment),
        shipment?.packageDescription,
        shipment?.packageWeightKg,
        shipment?.assignedOperatorName,
        status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [activeShipments, searchTerm, statusFilter]);

  const inTransitCount = activeShipments.filter((shipment) =>
    ["IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(
      getStatus(shipment)
    )
  ).length;

  const pickedUpCount = activeShipments.filter(
    (shipment) => getStatus(shipment) === "PICKED_UP"
  ).length;

  const createdCount = activeShipments.filter(
    (shipment) => getStatus(shipment) === "CREATED"
  ).length;

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email ||
    "Customer";

  const initials = getInitials(userName);

  function handleLogout() {
    localStorage.removeItem("shiptrackToken");
    localStorage.removeItem("shiptrackUser");

    window.location.href = "/login";
  }

  return (
    <div className="shipment-management-page">
      {/* SIDEBAR */}
      <aside className="management-sidebar">
        <div className="management-logo">
          <div className="management-logo-icon">
            <Package size={21} />
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="management-menu-title">
          CUSTOMER PORTAL
        </div>

        <nav className="management-navigation">
          <Link
            to="/dashboard/customer"
            className="management-nav-link"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/shipments/active"
            className="management-nav-link active"
          >
            <span>▣</span>
            Active Shipments
          </Link>

          <Link
            to="/shipments/history"
            className="management-nav-link"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/tracking"
            className="management-nav-link"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/notifications"
            className="management-nav-link"
          >
            <span>◉</span>
            Notifications
          </Link>

          <Link
            to="/tracking-insights"
            className="management-nav-link"
          >
            <span>◈</span>
            Tracking Insights
          </Link>
        </nav>

        <div className="management-logout">
          <button
            type="button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="management-main">
        {/* HEADER */}
        <header className="management-header">
          <div>
            <div className="management-breadcrumb">
              Customer Portal
              <span>/</span>
              Shipment Management
            </div>

            <h1>Active Shipments</h1>

            <p>
              Monitor all your shipments that are currently in
              progress.
            </p>
          </div>

          <div className="management-profile">
            <div className="management-avatar">
              {initials}
            </div>

            <div>
              <strong>{userName}</strong>
              <span>Customer</span>
            </div>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="management-summary">
          <div className="summary-card">
            <Package size={20} />

            <div>
              <strong>{activeShipments.length}</strong>
              <span>Active Shipments</span>
            </div>
          </div>

          <div className="summary-card">
            <Truck size={20} />

            <div>
              <strong>{inTransitCount}</strong>
              <span>In Transit</span>
            </div>
          </div>

          <div className="summary-card">
            <MapPin size={20} />

            <div>
              <strong>{pickedUpCount}</strong>
              <span>Picked Up</span>
            </div>
          </div>

          <div className="summary-card">
            <Clock3 size={20} />

            <div>
              <strong>{createdCount}</strong>
              <span>Created</span>
            </div>
          </div>
        </section>

        {/* SHIPMENT PANEL */}
        <section className="management-panel">
          <div className="management-panel-header">
            <div>
              <h2>Shipment Management</h2>

              <p>
                {loading
                  ? "Loading shipment data..."
                  : `${filteredShipments.length} active shipment${
                      filteredShipments.length === 1
                        ? ""
                        : "s"
                    } found`}
              </p>
            </div>
          </div>

          {/* SEARCH + FILTER */}
          <div className="management-tools">
            <div className="management-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search shipment, customer or route..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <select
              className="management-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">
                All Active
              </option>

              <option value="CREATED">
                Created
              </option>

              <option value="PICKED_UP">
                Picked Up
              </option>

              <option value="IN_TRANSIT">
                In Transit
              </option>

              <option value="OUT_FOR_DELIVERY">
                Out for Delivery
              </option>
            </select>
          </div>

          {/* ERROR */}
          {error && (
            <div className="no-results">
              <strong>
                Unable to load shipment data
              </strong>

              <p>{error}</p>

              <button
                type="button"
                onClick={loadData}
              >
                Try Again
              </button>
            </div>
          )}

          {/* TABLE */}
          {!error && (
            <div className="management-table-wrapper">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>TRACKING NUMBER</th>
                    <th>REFERENCE / ORDER ID</th>
                    <th>SENDER</th>
                    <th>SENDER PHONE</th>
                    <th>RECEIVER</th>
                    <th>RECEIVER PHONE</th>
                    <th>PACKAGE</th>
                    <th>WEIGHT</th>
                    <th>STATUS</th>
                    <th>ASSIGNED LOGISTICS OPERATOR</th>
                    <th>CREATED DATE</th>
                    <th>UPDATED DATE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="13">
                        <div className="no-results">
                          Loading shipments...
                        </div>
                      </td>
                    </tr>
                  ) : filteredShipments.length === 0 ? (
                    <tr>
                      <td colSpan="13">
                        <div className="no-results">
                          <Package size={28} />

                          <h3>
                            No active shipments found
                          </h3>

                          <p>
                            No active shipment from the backend
                            matches the current filter.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredShipments.map((shipment) => {
                      const status = getStatus(shipment);
                      const trackingNumber =
                        getTrackingNumber(shipment);

                      return (
                        <tr
                          key={
                            shipment?.id ??
                            shipment?.trackingNumber
                          }
                        >
                          {/* TRACKING NUMBER */}
                          <td>
                            {trackingNumber}
                          </td>

                          {/* REFERENCE / ORDER ID */}
                          <td>
                            {shipment?.referenceId ||
                              "Data unavailable"}
                          </td>

                          {/* SENDER */}
                          <td>
                            {getOrigin(shipment)}
                          </td>

                          {/* SENDER PHONE */}
                          <td>
                            {shipment?.senderPhone ||
                              "Data unavailable"}
                          </td>

                          {/* RECEIVER */}
                          <td>
                            {getDestination(shipment)}
                          </td>

                          {/* RECEIVER PHONE */}
                          <td>
                            {getCustomerPhone(shipment)}
                          </td>

                          {/* PACKAGE */}
                          <td>
                            {shipment?.packageDescription ||
                              "Data unavailable"}
                          </td>

                          {/* WEIGHT */}
                          <td>
                            {shipment?.packageWeightKg != null
                              ? shipment.packageWeightKg
                              : "Data unavailable"}
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={`management-status ${getStatusClass(
                                status
                              )}`}
                            >
                              <i></i>
                              {formatStatus(status)}
                            </span>
                          </td>

                          {/* ASSIGNED LOGISTICS OPERATOR */}
                          <td>
                            {shipment?.assignedOperatorName ||
                              "Data unavailable"}
                          </td>

                          {/* CREATED DATE */}
                          <td>
                            {formatDate(shipment?.createdAt)}
                          </td>

                          {/* UPDATED DATE */}
                          <td>
                            {formatDate(shipment?.updatedAt)}
                          </td>

                          {/* ACTION */}
                          <td>
                            {trackingNumber !==
                              "Data unavailable" ? (
                              <Link
                                className="manage-action"
                                to={`/tracking?trackingNumber=${shipment.trackingNumber}`}
                              >
                                Track Shipment
                                <ArrowRight size={14} />
                              </Link>
                            ) : (
                              <span>
                                Data unavailable
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* FOOTER */}
          {!error && !loading && (
            <div className="management-table-footer">
              <span>
                Showing{" "}
                <strong>
                  {filteredShipments.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {activeShipments.length}
                </strong>{" "}
                active shipments
              </span>

              <div className="pagination">
                <span>Page 1</span>
              </div>
            </div>
          )}
        </section>

        <footer className="management-footer">
          © 2026 ShipTrack
        </footer>
      </main>
    </div>
  );
}

export default ShipmentManagement;