import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import "./BusinessShipmentHistory.css";

const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);

  const labels = {
    DELIVERED: "Delivered",
    FAILED_DELIVERY: "Failed Delivery",
    CANCELLED: "Cancelled",
  };

  return labels[normalized] || normalized.replaceAll("_", " ");
};

const getStatusClass = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === "DELIVERED") {
    return "delivered";
  }

  if (normalized === "FAILED_DELIVERY") {
    return "returned";
  }

  if (normalized === "CANCELLED") {
    return "cancelled";
  }

  return "";
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-GB");
};

const getCustomerName = (shipment) =>
  shipment?.customerName || "Not assigned";

const getRoute = (shipment) => {
  return [shipment?.senderAddress, shipment?.receiverAddress]
    .filter(Boolean)
    .join(" → ");
};

function BusinessShipmentHistory() {
  const [shipments, setShipments] = useState([]);
  const [podRecords, setPodRecords] = useState([]);
  const [user, setUser] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [podError, setPodError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const [userResponse, shipmentResponse] =
          await Promise.all([
            apiRequest("/api/users/me"),
            apiRequest("/api/shipments"),
          ]);

        if (!mounted) {
          return;
        }

        const shipmentList = Array.isArray(
          shipmentResponse
        )
          ? shipmentResponse
          : Array.isArray(
                shipmentResponse?.content
              )
            ? shipmentResponse.content
            : Array.isArray(
                  shipmentResponse?.data
                )
              ? shipmentResponse.data
              : [];

        setUser(userResponse);

        /*
         * Shipment History should contain previous /
         * completed shipments only.
         *
         * Active statuses such as CREATED,
         * PICKED_UP, IN_TRANSIT and OUT_FOR_DELIVERY
         * remain outside this page.
         */
        const historicalShipments =
          shipmentList.filter((shipment) => {
            const shipmentStatus =
              normalizeStatus(
                shipment?.status
              );

            return [
              "DELIVERED",
              "FAILED_DELIVERY",
              "CANCELLED",
            ].includes(shipmentStatus);
          });

        setShipments(historicalShipments);
        const deliveredShipments = historicalShipments.filter(
          (shipment) => normalizeStatus(shipment.status) === "DELIVERED"
        );
        const podResults = await Promise.allSettled(
          deliveredShipments
            .filter((shipment) => shipment.id)
            .map((shipment) =>
              apiRequest(`/api/shipments/${shipment.id}/pod`)
            )
        );
        if (mounted) {
          const failedPodRequests = podResults.filter(
            (result) =>
              result.status === "rejected" &&
              result.reason?.status !== 404
          );
          setPodRecords(
            podResults
              .filter((result) => result.status === "fulfilled" && result.value)
              .map((result) => result.value)
          );
          if (failedPodRequests.length > 0) {
            console.error(
              "Failed to load proof of delivery records:",
              failedPodRequests.map((result) => result.reason)
            );
            setPodError(
              "Some proof of delivery records could not be loaded."
            );
          }
        }
      } catch (err) {
        console.error(
          "Failed to load shipment history:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err?.message ||
            "Unable to load shipment history."
        );

        setShipments([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ==========================================
   * SUMMARY COUNTS
   * ==========================================
   */

  const deliveredCount = useMemo(
    () =>
      shipments.filter(
        (shipment) =>
          normalizeStatus(
            shipment?.status
          ) === "DELIVERED"
      ).length,
    [shipments]
  );

  const failedCount = useMemo(
    () =>
      shipments.filter(
        (shipment) =>
          normalizeStatus(
            shipment?.status
          ) === "FAILED_DELIVERY"
      ).length,
    [shipments]
  );

  const cancelledCount = useMemo(
    () =>
      shipments.filter(
        (shipment) =>
          normalizeStatus(
            shipment?.status
          ) === "CANCELLED"
      ).length,
    [shipments]
  );

  /*
   * ==========================================
   * SEARCH + STATUS FILTER
   * ==========================================
   */

  const filteredHistory = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const trackingNumber =
        shipment?.trackingNumber || "";

      const referenceId =
        shipment?.referenceId || "";

      const customer =
        getCustomerName(shipment);

      const route =
        getRoute(shipment);

      const shipmentStatus =
        getStatusLabel(shipment?.status);

      const matchesSearch =
        !searchValue ||
        trackingNumber
          .toLowerCase()
          .includes(searchValue) ||
        referenceId
          .toLowerCase()
          .includes(searchValue) ||
        customer
          .toLowerCase()
          .includes(searchValue) ||
        route
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        status === "All" ||
        shipmentStatus === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [shipments, search, status]);

  /*
   * ==========================================
   * USER
   * ==========================================
   */

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email ||
    "Business Client";

  const userInitial =
    userName
      .trim()
      .charAt(0)
      .toUpperCase() || "B";

  return (
    <div className="business-history-page">

      {/* =====================================
          SIDEBAR
          ===================================== */}

      <aside className="business-history-sidebar">

        <div className="business-history-logo">

          <div className="business-history-logo-icon">
            S
          </div>

          <div>
            <h2>
              ShipTrack Pro
            </h2>

            <span>
              LOGISTICS INTELLIGENCE
            </span>
          </div>

        </div>

        <div className="business-history-menu-title">
          BUSINESS CLIENT
        </div>

        <nav>

          <Link
            to="/dashboard/business"
            className="business-history-nav"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="business-history-nav"
          >
            <span>＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="business-history-nav"
          >
            <span>▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="business-history-nav active"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="business-history-nav"
          >
            <span>□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="business-history-nav"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="business-history-nav"
          >
            <span>↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-history-nav"
          >
            <span>!</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-history-nav"
          >
            <span>◎</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="business-history-nav"
          >
            <span>♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="business-history-nav"
          >
            <span>▥</span>
            Reports & Export
          </Link>

        </nav>

        <Link
          to="/login"
          className="business-history-logout"
        >
          ⇥ Logout
        </Link>

      </aside>

      {/* =====================================
          MAIN
          ===================================== */}

      <main className="business-history-main">

        {/* HEADER */}

        <header className="business-history-header">

          <div>

            <div className="business-history-breadcrumb">
              BUSINESS CLIENT / SHIPMENT HISTORY
            </div>

            <h1>
              Shipment History
            </h1>

            <p>
              Review completed and previous
              business shipments.
            </p>

          </div>

          <div className="business-history-profile">

            <div className="business-history-avatar">
              {userInitial}
            </div>

            <div>
              <strong>
                {userName}
              </strong>

              <span>
                Business Client
              </span>
            </div>

          </div>

        </header>

        {/* =====================================
            SUMMARY
            ===================================== */}

        {!error && (
        <section className="business-history-summary">

          <div className="history-summary-card">

            <span>
              Historical Shipments
            </span>

            <strong>
              {loading
                ? "..."
                : shipments.length}
            </strong>

            <small>
              Previous shipments
            </small>

          </div>

          <div className="history-summary-card">

            <span>
              Delivered
            </span>

            <strong>
              {loading
                ? "..."
                : deliveredCount}
            </strong>

            <small>
              Successfully delivered
            </small>

          </div>

          <div className="history-summary-card">

            <span>
              Failed Delivery
            </span>

            <strong>
              {loading
                ? "..."
                : failedCount}
            </strong>

            <small>
              Failed delivery shipments
            </small>

          </div>

          <div className="history-summary-card">

            <span>
              Cancelled
            </span>

            <strong>
              {loading
                ? "..."
                : cancelledCount}
            </strong>

            <small>
              Cancelled shipments
            </small>

          </div>

        </section>
        )}

        {/* =====================================
            HISTORY PANEL
            ===================================== */}

        <section className="business-history-panel">

          <div className="business-history-panel-header">

            <div>

              <span>
                SHIPMENT RECORDS
              </span>

              <h2>
                Previous Shipments
              </h2>

            </div>

            <Link
              to="/business/create-shipment"
              className="history-create-btn"
            >
              + Create Shipment
            </Link>

          </div>

          {/* SEARCH */}

          <div className="history-tools">

            <div className="history-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search tracking ID, order, customer or route..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="history-filter"
            >

              <option value="All">
                All Status
              </option>

              <option value="Delivered">
                Delivered
              </option>

              <option value="Failed Delivery">
                Failed Delivery
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

            </select>

          </div>

          {/* =================================
              TABLE
              ================================= */}

          <div className="history-table-wrapper">

            <table className="history-table">

              <thead>

                <tr>
                  <th>TRACKING ID</th>
                  <th>CUSTOMER</th>
                  <th>ROUTE</th>
                  <th>SHIPMENT DATE</th>
                  <th>DELIVERED</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>

              </thead>

              <tbody>

                {error ? (
                  <tr>
                    <td colSpan="7" role="alert">
                      {error}
                    </td>
                  </tr>
                ) : loading ? (

                  <tr>

                    <td colSpan="7">

                      <div
                        style={{
                          padding: "30px",
                          textAlign: "center",
                          color: "#626a7c",
                        }}
                      >
                        Loading shipment history...
                      </div>

                    </td>

                  </tr>

                ) : filteredHistory.length === 0 ? (

                  <tr>

                    <td colSpan="7">

                      <div className="history-empty">

                        <div>
                          ⌕
                        </div>

                        <h3>
                          No shipment history found
                        </h3>

                        <p>
                          Try changing your search
                          or status filter.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredHistory.map(
                    (shipment) => {

                      const statusLabel =
                        getStatusLabel(
                          shipment?.status
                        );

                      const statusClass =
                        getStatusClass(
                          shipment?.status
                        );

                      return (
                        <tr
                          key={shipment.id}
                        >

                          {/* TRACKING */}

                          <td>

                            <strong>
                              {shipment?.trackingNumber ||
                                `Shipment #${shipment?.id}`}
                            </strong>

                            <small>
                              {shipment?.referenceId ||
                                "No reference ID"}
                            </small>

                          </td>

                          {/* CUSTOMER */}

                          <td>

                            <strong className="history-customer">
                              {getCustomerName(
                                shipment
                              )}
                            </strong>

                          </td>

                          {/* ROUTE */}

                          <td>
                            {getRoute(
                              shipment
                            )}
                          </td>

                          {/* SHIPMENT DATE */}

                          <td>
                            {formatDate(
                              shipment?.createdAt
                            )}
                          </td>

                          {/* COMPLETION DATE */}

                          <td>
                            {normalizeStatus(
                              shipment?.status
                            ) === "DELIVERED"
                              ? formatDate(
                                  shipment?.updatedAt
                                )
                              : "—"}
                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`history-status ${statusClass}`}
                            >
                              ● {statusLabel}
                            </span>

                          </td>

                          {/* ACTION */}

                          <td>

                            <Link
                              to={`/business/tracking?trackingNumber=${encodeURIComponent(
                                shipment?.trackingNumber ||
                                  ""
                              )}`}
                              className="history-view-btn"
                            >
                              View
                            </Link>

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

          {/* FOOTER */}

          {!error && !loading && (
          <div className="history-footer">

            <span>
              Showing{" "}
              <strong>
                {filteredHistory.length}
              </strong>{" "}
              historical shipments
            </span>

          </div>
          )}

        </section>

        <section className="business-history-panel">
          <div className="business-history-panel-header">
            <div>
              <span>DELIVERY CONFIRMATION</span>
              <h2>Proof of Delivery</h2>
            </div>
          </div>
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>SHIPMENT</th>
                  <th>RECEIVER</th>
                  <th>DELIVERED AT</th>
                  <th>REMARKS</th>
                  <th>SIGNATURE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {podRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      role={error || podError ? "alert" : undefined}
                    >
                      {error || podError
                        ? error || podError
                        : loading
                        ? "Loading proof of delivery..."
                        : "No proof of delivery records available."}
                    </td>
                  </tr>
                ) : (
                  <>
                    {podError && (
                      <tr>
                        <td colSpan="6" role="alert">{podError}</td>
                      </tr>
                    )}
                    {podRecords.map((pod) => (
                      <tr key={pod.id}>
                        <td>{pod.trackingNumber || pod.shipmentId}</td>
                        <td>{pod.receiverName || ""}</td>
                        <td>{formatDateTime(pod.deliveredAt)}</td>
                        <td>{pod.remarks || ""}</td>
                        <td>
                          {pod.signature?.startsWith("data:image/") ? (
                            <img
                              src={pod.signature}
                              alt={`Signature for ${pod.receiverName || pod.trackingNumber}`}
                              style={{ maxWidth: "120px", maxHeight: "48px" }}
                            />
                          ) : (
                            pod.signature || ""
                          )}
                        </td>
                        <td>{getStatusLabel(pod.deliveryStatus)}</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="business-history-bottom">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default BusinessShipmentHistory;