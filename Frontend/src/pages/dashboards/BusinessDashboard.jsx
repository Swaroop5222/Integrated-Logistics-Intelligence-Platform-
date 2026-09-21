import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Package,
  Truck,
  AlertTriangle,
  FileText,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api";
import "./BusinessDashboard.css";

const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED"];

const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);

  const labels = {
    CREATED: "Created",
    PICKED_UP: "Picked Up",
    IN_TRANSIT: "In Transit",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    FAILED_DELIVERY: "Delayed",
    CANCELLED: "Cancelled",
  };

  return labels[normalized] || status || "Unknown";
};

const getStatusClass = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === "IN_TRANSIT") {
    return "in-transit";
  }

  if (normalized === "DELIVERED") {
    return "delivered";
  }

  if (normalized === "PICKED_UP") {
    return "picked-up";
  }

  if (
    normalized === "FAILED_DELIVERY" ||
    normalized === "DELAYED"
  ) {
    return "delayed";
  }

  return "";
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name) => {
  if (!name) {
    return "B";
  }

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getUserName = (user) =>
  user?.name ||
  user?.fullName ||
  user?.username ||
  "Business";

const getTrackingNumber = (shipment) =>
  shipment?.trackingNumber ||
  shipment?.trackingId ||
  `Shipment #${shipment?.id || ""}`;

const getRouteText = (shipment) => {
  const sender =
    shipment?.senderAddress ||
    shipment?.senderCity ||
    shipment?.origin ||
    shipment?.pickupLocation;

  const receiver =
    shipment?.receiverAddress ||
    shipment?.receiverCity ||
    shipment?.destination ||
    shipment?.deliveryLocation;

  if (sender && receiver) {
    return `${sender} → ${receiver}`;
  }

  return "Route information unavailable";
};

const getCustomerName = (shipment) => {
  return (
    shipment?.customer?.name ||
    shipment?.customer?.fullName ||
    shipment?.customerName ||
    shipment?.businessClient?.name ||
    shipment?.businessClient?.fullName ||
    "Customer"
  );
};

function BusinessDashboard() {
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [routes, setRoutes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
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

        const shipmentList = Array.isArray(shipmentResponse)
          ? shipmentResponse
          : Array.isArray(shipmentResponse?.content)
            ? shipmentResponse.content
            : Array.isArray(shipmentResponse?.data)
              ? shipmentResponse.data
              : [];

        setUser(userResponse);
        setShipments(shipmentList);

        /*
         * Read existing route information from the backend.
         * No route is created or modified here.
         */
        const routeResults = await Promise.allSettled(
          shipmentList
            .filter((shipment) => shipment?.id)
            .map((shipment) =>
              apiRequest(
                `/api/routes/shipment/${shipment.id}`
              )
            )
        );

        if (!mounted) {
          return;
        }

        const routeList = routeResults
          .filter(
            (result) =>
              result.status === "fulfilled"
          )
          .map((result) => result.value)
          .filter(Boolean);

        setRoutes(routeList);
      } catch (err) {
        console.error(
          "Business dashboard loading error:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err?.message ||
            "Unable to load dashboard data."
        );

        setShipments([]);
        setRoutes([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ==========================================
   * SHIPMENT COUNTS
   * ==========================================
   */

  const totalShipments = shipments.length;

  const inTransitShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const status = normalizeStatus(
        shipment?.status
      );

      return (
        status === "IN_TRANSIT" ||
        status === "OUT_FOR_DELIVERY"
      );
    });
  }, [shipments]);

  const deliveredShipments = useMemo(() => {
    return shipments.filter(
      (shipment) =>
        normalizeStatus(shipment?.status) ===
        "DELIVERED"
    );
  }, [shipments]);

  const delayedShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const status = normalizeStatus(
        shipment?.status
      );

      return (
        status === "FAILED_DELIVERY" ||
        status === "DELAYED"
      );
    });
  }, [shipments]);

  const activeShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const status = normalizeStatus(
        shipment?.status
      );

      return !TERMINAL_STATUSES.includes(status);
    });
  }, [shipments]);

  /*
   * ==========================================
   * ACTIVE ROUTES
   * ==========================================
   */

  const activeRoutes = useMemo(() => {
    return routes.filter((route) => {
      const shipment = shipments.find(
        (item) =>
          Number(item?.id) ===
          Number(route?.shipmentId)
      );

      if (!shipment) {
        return true;
      }

      return !TERMINAL_STATUSES.includes(
        normalizeStatus(shipment?.status)
      );
    });
  }, [routes, shipments]);

  /*
   * ==========================================
   * ACTIVE DRIVERS
   * ==========================================
   */

  const activeDriverIds = useMemo(() => {
    const ids = new Set();

    activeRoutes.forEach((route) => {
      if (route?.assignedOperatorId) {
        ids.add(
          String(route.assignedOperatorId)
        );
      }
    });

    activeShipments.forEach((shipment) => {
      const operatorId =
        shipment?.assignedOperatorId ||
        shipment?.assignedOperator?.id;

      if (operatorId) {
        ids.add(String(operatorId));
      }
    });

    return ids;
  }, [activeRoutes, activeShipments]);

  /*
   * ==========================================
   * TOTAL ROUTE DISTANCE
   * ==========================================
   */

  const totalDistance = useMemo(() => {
    let total = 0;

    activeRoutes.forEach((route) => {
      const distance = Number(
        route?.distanceKm
      );

      if (Number.isFinite(distance)) {
        total += distance;
      }
    });

    return total;
  }, [activeRoutes]);

  /*
   * ==========================================
   * DELIVERY PERCENTAGE
   * ==========================================
   */

  const deliveryPercentage =
    totalShipments > 0
      ? Math.round(
          (deliveredShipments.length /
            totalShipments) *
            100
        )
      : 0;

  /*
   * ==========================================
   * RECENT SHIPMENTS
   * ==========================================
   */

  const recentShipments = useMemo(() => {
    return [...shipments]
      .sort((a, b) => {
        const dateA = new Date(
          a?.updatedAt ||
            a?.createdAt ||
            0
        ).getTime();

        const dateB = new Date(
          b?.updatedAt ||
            b?.createdAt ||
            0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 4);
  }, [shipments]);

  /*
   * ==========================================
   * CUSTOMER ACTIVITY
   * ==========================================
   */

  const customers = useMemo(() => {
    const customerMap = new Map();

    shipments.forEach((shipment) => {
      const name = getCustomerName(
        shipment
      );

      if (
        !name ||
        name === "Customer"
      ) {
        return;
      }

      if (!customerMap.has(name)) {
        customerMap.set(name, {
          name,
          shipments: 0,
        });
      }

      const customer =
        customerMap.get(name);

      customer.shipments += 1;
    });

    return [...customerMap.values()]
      .sort(
        (a, b) =>
          b.shipments - a.shipments
      )
      .slice(0, 3);
  }, [shipments]);

  /*
   * ==========================================
   * CUSTOMER AVATAR COLORS
   * ==========================================
   */

  const customerAvatarClasses = [
    "orange-avatar",
    "purple-avatar",
    "pink-avatar",
  ];

  const userName = getUserName(user);

  return (
    <div className="business-dashboard">

      {/* ========================================
          SIDEBAR
          ======================================== */}

      <aside className="business-sidebar">

        <div className="business-logo">

          <div className="business-logo-icon">
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

        <div className="business-menu-title">
          MAIN MENU
        </div>

        <nav className="business-navigation">

          <Link
            to="/dashboard/business"
            className="business-nav-link active"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="business-nav-link"
          >
            <span>＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="business-nav-link"
          >
            <span>▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="business-nav-link"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="business-nav-link"
          >
            <span>□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="business-nav-link"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="business-nav-link"
          >
            <span>↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-nav-link"
          >
            <span>!</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-nav-link"
          >
            <span>◎</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="business-nav-link"
          >
            <span>♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="business-nav-link"
          >
            <span>▥</span>
            Reports & Export
          </Link>

        </nav>

        <div className="business-sidebar-bottom">

          <Link
            to="/login"
            className="business-logout"
          >
            ⇥ Logout
          </Link>

        </div>

      </aside>

      {/* ========================================
          MAIN
          ======================================== */}

      <main className="business-main">

        {/* ======================================
            HEADER
            ====================================== */}

        <header className="business-header">

          <div>

            <div className="business-breadcrumb">
              BUSINESS CLIENT / OVERVIEW
            </div>

            <h1>
              Good afternoon, {userName}
            </h1>

            <p>
              Here's your business shipment
              overview for today.
            </p>

          </div>

          <div className="business-header-right">

            <Link
              to="/business/notifications"
              className="business-notification"
            >
              <Bell size={17} />

              <span />
            </Link>

            <div className="business-profile">

              <div className="business-avatar">
                {getInitials(userName)}
              </div>

              <div className="business-profile-info">

                <strong>
                  {userName}
                </strong>

                <small>
                  Business Client
                </small>

              </div>

              <div className="business-profile-arrow">
                V
              </div>

            </div>

          </div>

        </header>

        {/* ======================================
            ERROR
            ====================================== */}

        {error && (
          <div
            style={{
              color: "#ff8a8a",
              fontSize: "11px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}

        {/* ======================================
            QUICK ACTION
            ====================================== */}

        <section className="business-quick-action">

          <div>

            <div className="quick-label">
              BUSINESS OPERATIONS
            </div>

            <h2>
              Manage your shipments from one place
            </h2>

            <p>
              Create shipments, monitor deliveries
              and analyze logistics performance.
            </p>

          </div>

          <Link
            to="/business/create-shipment"
            className="create-shipment-btn"
          >
            <Plus
              size={14}
              style={{
                verticalAlign: "middle",
                marginRight: "5px",
              }}
            />

            Create Shipment
          </Link>

        </section>

        {/* ======================================
            STAT CARDS
            ====================================== */}

        <div className="business-stats">

          {/* TOTAL */}

          <Link
            to="/business/shipment-management"
            className="business-stat-card"
          >

            <div className="business-stat-top">

              <span>
                TOTAL SHIPMENTS
              </span>

              <div className="stat-icon orange">
                <Package size={14} />
              </div>

            </div>

            <strong>
              {loading
                ? "..."
                : totalShipments}
            </strong>

            <small>
              Actual shipments
            </small>

          </Link>

          {/* IN TRANSIT */}

          <Link
            to="/business/tracking"
            className="business-stat-card"
          >

            <div className="business-stat-top">

              <span>
                IN TRANSIT
              </span>

              <div className="stat-icon purple">
                <Truck size={14} />
              </div>

            </div>

            <strong>
              {loading
                ? "..."
                : inTransitShipments.length}
            </strong>

            <small>
              Currently moving
            </small>

          </Link>

          {/* DELIVERED */}

          <Link
            to="/business/delivery-performance"
            className="business-stat-card"
          >

            <div className="business-stat-top">

              <span>
                DELIVERED
              </span>

              <div className="stat-icon green">
                <CheckCircle2 size={14} />
              </div>

            </div>

            <strong>
              {loading
                ? "..."
                : deliveredShipments.length}
            </strong>

            <small>
              Completed shipments
            </small>

          </Link>

          {/* DELAYED */}

          <Link
            to="/business/delay-analysis"
            className="business-stat-card"
          >

            <div className="business-stat-top">

              <span>
                DELAYED
              </span>

              <div className="stat-icon pink">
                <AlertTriangle size={14} />
              </div>

            </div>

            <strong>
              {loading
                ? "..."
                : delayedShipments.length}
            </strong>

            <small>
              Failed / delayed shipments
            </small>

          </Link>

        </div>

        {/* ======================================
            SHIPMENTS + PERFORMANCE
            ====================================== */}

        <div className="business-content-grid">

          {/* ====================================
              RECENT SHIPMENTS
              ==================================== */}

          <section className="business-panel">

            <div className="business-panel-header">

              <div>

                <span>
                  SHIPMENT ACTIVITY
                </span>

                <h2>
                  Recent Shipments
                </h2>

              </div>

              <Link
                to="/business/shipment-management"
                className="view-all-link"
              >
                View all →
              </Link>

            </div>

            <div className="business-shipment-list">

              {loading ? (
                <div
                  style={{
                    padding: "25px 20px",
                    color: "#697185",
                    fontSize: "10px",
                  }}
                >
                  Loading shipments...
                </div>
              ) : recentShipments.length === 0 ? (
                <div
                  style={{
                    padding: "25px 20px",
                    color: "#697185",
                    fontSize: "10px",
                  }}
                >
                  No shipments available.
                </div>
              ) : (
                recentShipments.map(
                  (shipment) => {

                    const status =
                      normalizeStatus(
                        shipment?.status
                      );

                    const trackingNumber =
                      getTrackingNumber(
                        shipment
                      );

                    return (
                      <div
                        className="business-shipment-row"
                        key={
                          shipment?.id ||
                          trackingNumber
                        }
                      >

                        <div className="shipment-company-icon">
                          <Package size={15} />
                        </div>

                        <div className="shipment-main-info">

                          <strong>
                            {trackingNumber}
                          </strong>

                          <span>
                            {shipment?.referenceId ||
                              "Reference unavailable"}
                          </span>

                          <small>
                            {getRouteText(
                              shipment
                            )}
                          </small>

                        </div>

                        <div className="shipment-date">

                          <span>
                            Updated
                          </span>

                          <strong>
                            {formatDate(
                              shipment?.updatedAt ||
                                shipment?.createdAt
                            )}
                          </strong>

                        </div>

                        <div className="shipment-status-area">

                          <span
                            className={`business-status ${getStatusClass(
                              status
                            )}`}
                          >
                            ●{" "}
                            {getStatusLabel(
                              status
                            )}
                          </span>

                          <small>
                            {status === "DELIVERED"
                              ? "Completed"
                              : status ===
                                  "FAILED_DELIVERY"
                                ? "Attention required"
                                : "Current status"}
                          </small>

                        </div>

                        <Link
                          to={`/business/tracking?trackingNumber=${encodeURIComponent(
                            trackingNumber
                          )}`}
                          className="shipment-arrow"
                        >
                          <ArrowRight size={15} />
                        </Link>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </section>

          {/* ====================================
              DELIVERY PERFORMANCE
              ==================================== */}

          <section className="business-panel">

            <div className="business-panel-header">

              <div>

                <span>
                  PERFORMANCE
                </span>

                <h2>
                  Delivery Performance
                </h2>

              </div>

              <Link
                to="/business/delivery-performance"
                className="small-view-link"
              >
                Details
              </Link>

            </div>

            <div className="performance-score">

              <div
                className="score-circle"
                style={{
                  background: `conic-gradient(
                    #42d8a1 0deg,
                    #42d8a1 ${
                      deliveryPercentage * 3.6
                    }deg,
                    #242a38 ${
                      deliveryPercentage * 3.6
                    }deg,
                    #242a38 360deg
                  )`,
                }}
              >

                <div>

                  <strong>
                    {loading
                      ? "..."
                      : `${deliveryPercentage}%`}
                  </strong>

                  <span>
                    Delivered
                  </span>

                </div>

              </div>

              <div className="performance-summary">

                <div>

                  <span>
                    Delivered shipments
                  </span>

                  <strong>
                    {deliveredShipments.length}
                  </strong>

                </div>

                <div>

                  <span>
                    Delayed shipments
                  </span>

                  <strong>
                    {delayedShipments.length}
                  </strong>

                </div>

                <div>

                  <span>
                    Avg. delivery time
                  </span>

                  <strong>
                    Data unavailable
                  </strong>

                </div>

              </div>

            </div>

            <div className="performance-progress">

              <div className="progress-header">

                <span>
                  Delivered / Total
                </span>

                <strong>
                  {deliveryPercentage}%
                </strong>

              </div>

              <div className="progress-track">

                <div
                  className="progress-value"
                  style={{
                    width: `${deliveryPercentage}%`,
                  }}
                />

              </div>

            </div>

          </section>

        </div>

        {/* ======================================
            ANALYTICS
            ====================================== */}

        <div className="business-analytics-grid">

          {/* ====================================
              DELAY ANALYSIS
              ==================================== */}

          <section className="business-panel analytics-panel">

            <div className="business-panel-header">

              <div>

                <span>
                  ANALYTICS
                </span>

                <h2>
                  Delay Analysis
                </h2>

              </div>

              <Link
                to="/business/delay-analysis"
                className="small-view-link"
              >
                View analysis
              </Link>

            </div>

            <div className="delay-content">

              <div className="delay-main-number">

                <strong>
                  {delayedShipments.length}
                </strong>

                <span>
                  Delayed shipments
                </span>

              </div>

              <div className="delay-bars">

                <div className="delay-bar-row">

                  <span>
                    Traffic
                  </span>

                  <div className="delay-track">
                    <div
                      className="delay-value"
                      style={{
                        width: "0%",
                      }}
                    />
                  </div>

                  <strong>
                    —
                  </strong>

                </div>

                <div className="delay-bar-row">

                  <span>
                    Weather
                  </span>

                  <div className="delay-track">
                    <div
                      className="delay-value"
                      style={{
                        width: "0%",
                      }}
                    />
                  </div>

                  <strong>
                    —
                  </strong>

                </div>

                <div className="delay-bar-row">

                  <span>
                    Operations
                  </span>

                  <div className="delay-track">
                    <div
                      className="delay-value"
                      style={{
                        width: "0%",
                      }}
                    />
                  </div>

                  <strong>
                    —
                  </strong>

                </div>

              </div>

            </div>

          </section>

          {/* ====================================
              LOGISTICS
              ==================================== */}

          <section className="business-panel analytics-panel">

            <div className="business-panel-header">

              <div>

                <span>
                  LOGISTICS
                </span>

                <h2>
                  Logistics Overview
                </h2>

              </div>

              <Link
                to="/business/logistics-overview"
                className="small-view-link"
              >
                Details
              </Link>

            </div>

            <div className="logistics-grid">

              <div className="logistics-item">

                <span>
                  ACTIVE ROUTES
                </span>

                <strong>
                  {activeRoutes.length}
                </strong>

              </div>

              <div className="logistics-item">

                <span>
                  ACTIVE DRIVERS
                </span>

                <strong>
                  {activeDriverIds.size}
                </strong>

              </div>

              <div className="logistics-item">

                <span>
                  TOTAL DISTANCE
                </span>

                <strong>
                  {totalDistance > 0
                    ? `${totalDistance.toFixed(
                        1
                      )} km`
                    : "Data unavailable"}
                </strong>

              </div>

              <div className="logistics-item">

                <span>
                  ROUTE EFFICIENCY
                </span>

                <strong>
                  Data unavailable
                </strong>

              </div>

            </div>

          </section>

          {/* ====================================
              CUSTOMER ACTIVITY
              ==================================== */}

          <section className="business-panel analytics-panel customer-activity-panel">

            <div className="business-panel-header">

              <div>

                <span>
                  CUSTOMERS
                </span>

                <h2>
                  Customer Activity
                </h2>

              </div>

              <Link
                to="/business/customer-activity"
                className="small-view-link"
              >
                View customers
              </Link>

            </div>

            <div className="customer-activity">

              {customers.length === 0 ? (

                <div
                  style={{
                    padding: "20px 0",
                    color: "#626a7c",
                    fontSize: "9px",
                  }}
                >
                  Customer data unavailable.
                </div>

              ) : (

                customers.map(
                  (customer, index) => (

                    <div
                      className="customer-row"
                      key={customer.name}
                    >

                      <div
                        className={`customer-avatar ${
                          customerAvatarClasses[
                            index %
                              customerAvatarClasses.length
                          ]
                        }`}
                      >
                        {getInitials(
                          customer.name
                        )}
                      </div>

                      <div>

                        <strong>
                          {customer.name}
                        </strong>

                        <span>
                          {customer.shipments} shipment
                          {customer.shipments !==
                          1
                            ? "s"
                            : ""}
                        </span>

                      </div>

                      <b>
                        —
                      </b>

                    </div>

                  )
                )

              )}

            </div>

          </section>

        </div>

        {/* ======================================
            REPORT BANNER
            ====================================== */}

        <section className="business-report-banner">

          <div>

            <span>
              REPORTS & EXPORT
            </span>

            <h2>
              Need a detailed logistics report?
            </h2>

            <p>
              Generate shipment, delivery, route
              and delay reports for your business.
            </p>

          </div>

          <Link
            to="/business/reports"
            className="report-btn"
          >
            Open Reports
            <ArrowRight
              size={13}
              style={{
                verticalAlign: "middle",
                marginLeft: "5px",
              }}
            />
          </Link>

        </section>

        {/* ======================================
            FOOTER
            ====================================== */}

        <footer className="business-footer">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default BusinessDashboard;