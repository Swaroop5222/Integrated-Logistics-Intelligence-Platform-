import {
  ArrowRight,
  CheckCircle2,
  Package,
  Truck,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api";
import "./BusinessDashboard.css";

const TERMINAL_STATUSES = [
  "DELIVERED",
  "FAILED_DELIVERY",
  "CANCELLED",
];

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
    FAILED_DELIVERY: "Failed Delivery",
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

  if (normalized === "FAILED_DELIVERY") {
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
  shipment?.trackingNumber || "";

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

  return "";
};

const getCustomerName = (shipment) => {
  return (
    shipment?.customer?.name ||
    shipment?.customer?.fullName ||
    shipment?.customerName ||
    "Not assigned"
  );
};

function BusinessDashboard() {
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [userResponse, shipmentResponse, analyticsResponse] =
          await Promise.all([
            apiRequest("/api/users/me"),
            apiRequest("/api/shipments"),
            apiRequest("/api/analytics"),
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
        setAnalytics(analyticsResponse);

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

        const failedRouteResults = routeResults.filter(
          (result) =>
            result.status === "rejected" &&
            result.reason?.status !== 404
        );
        if (failedRouteResults.length > 0) {
          throw failedRouteResults[0].reason;
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
        setAnalytics(null);
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

  const totalShipments = analytics?.totalShipments ?? 0;

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

        {!error && (
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
                : analytics?.inTransitShipments ?? 0}
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
                : analytics?.deliveredShipments ?? 0}
            </strong>

            <small>
              Completed shipments
            </small>

          </Link>

          {/* FAILED DELIVERY */}

          <Link
            to="/business/shipment-history"
            className="business-stat-card"
          >

            <div className="business-stat-top">

              <span>
                FAILED DELIVERY
              </span>

              <div className="stat-icon pink">
                <AlertTriangle size={14} />
              </div>

            </div>

            <strong>
              {loading
                ? "..."
                : analytics?.delayedShipments ?? 0}
            </strong>

            <small>
              Failed delivery shipments
            </small>

          </Link>

        </div>
        )}

        {/* ======================================
            SHIPMENTS + PERFORMANCE
            ====================================== */}

        {!error && (
        <>
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

                          {shipment?.referenceId && (
                            <span>{shipment.referenceId}</span>
                          )}

                          {getRouteText(shipment) && (
                            <small>{getRouteText(shipment)}</small>
                          )}

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

        </div>

        {/* ======================================
            ANALYTICS
            ====================================== */}

        <div className="business-analytics-grid">

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
                  No customer shipment records.
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

                    </div>

                  )
                )

              )}

            </div>

          </section>

        </div>
        </>
        )}

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
              Generate a shipment report from your current shipment records.
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