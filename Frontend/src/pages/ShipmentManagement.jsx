import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ShipmentManagement.css";
import { apiRequest } from "../api";

function ShipmentManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [shipmentData, setShipmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Logged-in user
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get currently logged-in user from localStorage
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("shiptrackUser") || "null"
      );

      setUser(storedUser);
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadShipments() {
      try {
        const data = await apiRequest("/api/shipments");

        if (active) {
          setShipmentData(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load shipments.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadShipments();

    return () => {
      active = false;
    };
  }, []);

  const handleCancel = async (id, trackingNumber) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel shipment ${
          trackingNumber || id
        }?`
      )
    ) {
      return;
    }

    try {
      await apiRequest(`/api/shipments/${id}/cancel`, {
        method: "PATCH",
      });

      setShipmentData((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "CANCELLED" } : s
        )
      );

      alert("Shipment cancelled successfully.");
    } catch (err) {
      alert(`Error cancelling shipment: ${err.message}`);
    }
  };

  const filteredShipments = shipmentData.filter((shipment) => {
    const searchValue = search.toLowerCase();

    const id = shipment.trackingNumber || "";
    const customer = shipment.customerName || "";

    const route = `${shipment.senderAddress || ""} ${
      shipment.receiverAddress || ""
    }`;

    const matchesSearch =
      id.toLowerCase().includes(searchValue) ||
      customer.toLowerCase().includes(searchValue) ||
      route.toLowerCase().includes(searchValue);

    const normalizedStatus = String(
      shipment.status || ""
    ).replaceAll("_", " ");

    const matchesStatus =
      statusFilter === "All" ||
      normalizedStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Logged-in user's name
  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Business Client";

  // First letter for avatar
  const userInitial = userName
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="shipment-management-page">

      {/* =================================
          SIDEBAR
      ================================= */}

      <aside className="management-sidebar">

        <div className="management-logo">

          <div className="management-logo-icon">
            S
          </div>

          <div>
            <h2>ShipTrack Pro</h2>
            <span>LOGISTICS INTELLIGENCE</span>
          </div>

        </div>


        <div className="management-menu-title">
          BUSINESS CLIENT
        </div>


        <nav className="management-navigation">

          <Link
            to="/dashboard/business"
            className="management-nav-link"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="management-nav-link"
          >
            <span>＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="management-nav-link active"
          >
            <span>▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="management-nav-link"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="management-nav-link"
          >
            <span>□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="management-nav-link"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="management-nav-link"
          >
            <span>↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="management-nav-link"
          >
            <span>!</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="management-nav-link"
          >
            <span>◎</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="management-nav-link"
          >
            <span>♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="management-nav-link"
          >
            <span>▥</span>
            Reports & Export
          </Link>

        </nav>


        <Link
          to="/login"
          className="management-logout"
        >
          ⇥ Logout
        </Link>

      </aside>


      {/* =================================
          MAIN
      ================================= */}

      <main className="management-main">

        {/* HEADER */}

        <header className="management-header">

          <div>

            <div className="management-breadcrumb">
              BUSINESS CLIENT / SHIPMENT MANAGEMENT
            </div>

            <h1>
              Shipment Management
            </h1>

            <p>
              View, search and manage all your business shipments.
            </p>

          </div>


          {/* =============================
              LOGGED-IN USER PROFILE
          ============================= */}

          <div className="management-profile">

            <div className="management-avatar">
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


        {/* =================================
            SUMMARY
        ================================= */}

        <section className="management-summary">

          <div className="summary-card">

            <span>Total Shipments</span>

            <strong>
              {shipmentData.length}
            </strong>

            <small>
              All shipments
            </small>

          </div>


          <div className="summary-card">

            <span>In Transit</span>

            <strong>
              {
                shipmentData.filter(
                  (s) => s.status === "IN_TRANSIT"
                ).length
              }
            </strong>

            <small>
              Currently moving
            </small>

          </div>


          <div className="summary-card">

            <span>Delivered</span>

            <strong>
              {
                shipmentData.filter(
                  (s) => s.status === "DELIVERED"
                ).length
              }
            </strong>

            <small>
              Successfully delivered
            </small>

          </div>


          <div className="summary-card">

            <span>Delayed</span>

            <strong>
              {
                shipmentData.filter(
                  (s) => s.status === "FAILED_DELIVERY"
                ).length
              }
            </strong>

            <small>
              Needs attention
            </small>

          </div>

        </section>


        {/* =================================
            TABLE PANEL
        ================================= */}

        <section className="management-panel">

          <div className="management-panel-header">

            <div>

              <span>
                SHIPMENT DATABASE
              </span>

              <h2>
                All Shipments
              </h2>

            </div>


            <Link
              to="/business/create-shipment"
              className="management-create-btn"
            >
              + Create Shipment
            </Link>

          </div>


          {/* SEARCH / FILTER */}

          <div className="management-tools">

            <div className="management-search">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search tracking ID, order, customer or route..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>


            <select
              className="management-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >

              <option value="All">
                All Status
              </option>

              <option value="IN TRANSIT">
                In Transit
              </option>

              <option value="DELIVERED">
                Delivered
              </option>

              <option value="PICKED UP">
                Picked Up
              </option>

              <option value="FAILED DELIVERY">
                Failed Delivery
              </option>

            </select>

          </div>


          {/* LOADING */}

          {loading && (
            <div className="no-results">
              Loading shipments...
            </div>
          )}


          {/* ERROR */}

          {error && (
            <div className="no-results">
              Error: {error}
            </div>
          )}


          {/* TABLE */}

          <div className="management-table-wrapper">

            <table className="management-table">

              <thead>

                <tr>

                  <th>
                    TRACKING ID
                  </th>

                  <th>
                    CUSTOMER
                  </th>

                  <th>
                    ROUTE
                  </th>

                  <th>
                    CREATED
                  </th>

                  <th>
                    PRIORITY
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    ETA
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredShipments.map(
                  (shipment) => (

                    <tr
                      key={
                        shipment.trackingNumber ||
                        `SHIP-${shipment.id}`
                      }
                    >

                      <td>

                        <strong>
                          {
                            shipment.trackingNumber ||
                            `SHIP-${shipment.id}`
                          }
                        </strong>

                        <small>
                          {
                            shipment.id
                              ? `Shipment #${shipment.id}`
                              : ""
                          }
                        </small>

                      </td>


                      <td>

                        <strong className="customer-name">
                          {
                            shipment.customerName ||
                            "Unassigned"
                          }
                        </strong>

                      </td>


                      <td>

                        <span className="route-text">

                          {`${
                            shipment.senderAddress ||
                            "—"
                          } → ${
                            shipment.receiverAddress ||
                            "—"
                          }`}

                        </span>

                      </td>


                      <td>

                        <span className="date-text">

                          {
                            shipment.createdAt
                              ? new Date(
                                  shipment.createdAt
                                ).toLocaleDateString()
                              : "—"
                          }

                        </span>

                      </td>


                      <td>

                        <span
                          className={`priority ${String(
                            shipment.priority ||
                              "standard"
                          )
                            .toLowerCase()
                            .replaceAll(
                              " ",
                              "-"
                            )}`}
                        >

                          {
                            shipment.priority ||
                            "Standard"
                          }

                        </span>

                      </td>


                      <td>

                        <span
                          className={`management-status ${String(
                            shipment.status ||
                              "unknown"
                          )
                            .toLowerCase()
                            .replaceAll(
                              "_",
                              "-"
                            )
                            .replaceAll(
                              " ",
                              "-"
                            )}`}
                        >

                          ●{" "}
                          {String(
                            shipment.status ||
                              "UNKNOWN"
                          ).replaceAll(
                            "_",
                            " "
                          )}

                        </span>

                      </td>


                      <td>

                        <span className="eta-text">

                          {
                            shipment.updatedAt
                              ? new Date(
                                  shipment.updatedAt
                                ).toLocaleDateString()
                              : "—"
                          }

                        </span>

                      </td>


                      <td
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >

                        <Link
                          to={`/business/tracking?trackingNumber=${
                            shipment.trackingNumber ||
                            `SHIP-${shipment.id}`
                          }`}
                          className="manage-action"
                        >
                          Track
                        </Link>


                        {shipment.id &&
                          shipment.status !==
                            "CANCELLED" &&
                          shipment.status !==
                            "DELIVERED" && (

                            <button
                              type="button"
                              onClick={() =>
                                handleCancel(
                                  shipment.id,
                                  shipment.trackingNumber
                                )
                              }
                              className="manage-action"
                              style={{
                                background:
                                  "rgba(239, 68, 68, 0.1)",
                                color:
                                  "#ef4444",
                                border:
                                  "1px solid rgba(239, 68, 68, 0.3)",
                                cursor:
                                  "pointer",
                                padding:
                                  "4px 8px",
                                borderRadius:
                                  "4px",
                              }}
                            >
                              Cancel
                            </button>

                          )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>


            {/* NO RESULTS */}

            {filteredShipments.length ===
              0 &&
              !loading && (

                <div className="no-results">

                  <div>
                    ⌕
                  </div>

                  <h3>
                    No shipments found
                  </h3>

                  <p>
                    Try changing your search
                    or status filter.
                  </p>

                </div>

              )}

          </div>


          {/* FOOTER */}

          <div className="management-table-footer">

            <span>
              Showing{" "}
              {filteredShipments.length} of{" "}
              {shipmentData.length} shipments
            </span>

            <div className="pagination">

              <button>
                ‹
              </button>

              <button className="current-page">
                1
              </button>

              <button>
                2
              </button>

              <button>
                3
              </button>

              <button>
                …
              </button>

              <button>
                13
              </button>

              <button>
                ›
              </button>

            </div>

          </div>

        </section>


        <footer className="management-footer">
          © 2026 ShipTrack Pro · Integrated Logistics Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default ShipmentManagement;