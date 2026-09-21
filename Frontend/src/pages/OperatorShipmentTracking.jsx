import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api";

import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Package,
  Radio,
  RefreshCw,
  Search,
  Truck,
  UserRound,
  AlertTriangle,
  Route as RouteIcon,
  X,
} from "lucide-react";

import "./OperatorShipmentTracking.css";

const STATUS_OPTIONS = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED_DELIVERY",
  "CANCELLED",
];

function OperatorShipmentTracking() {
  /* =========================================================
     STATE
     ========================================================= */

  const [shipments, setShipments] = useState([]);

  const [selectedShipment, setSelectedShipment] =
    useState(null);

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [selectedTracking, setSelectedTracking] =
    useState(null);

  const [locationHistory, setLocationHistory] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [statusModalOpen, setStatusModalOpen] =
    useState(false);

  const [locationModalOpen, setLocationModalOpen] =
    useState(false);

  const [statusForm, setStatusForm] =
    useState({
      status: "",
      remarks: "",
    });

  const [locationForm, setLocationForm] =
    useState({
      latitude: "",
      longitude: "",
    });

  const [savingStatus, setSavingStatus] =
    useState(false);

  const [savingLocation, setSavingLocation] =
    useState(false);

  /* =========================================================
     HELPERS
     ========================================================= */

  const normalizeStatus = (status) =>
    String(status || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

  const getDisplayStatus = (status) => {
    switch (normalizeStatus(status)) {
      case "CREATED":
        return "Created";

      case "PICKED_UP":
        return "Picked Up";

      case "IN_TRANSIT":
        return "In Transit";

      case "OUT_FOR_DELIVERY":
        return "Out for Delivery";

      case "DELIVERED":
        return "Delivered";

      case "FAILED_DELIVERY":
        return "Failed Delivery";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status || "Unknown";
    }
  };

  const getStatusClass = (status) => {
    switch (normalizeStatus(status)) {
      case "DELIVERED":
        return "status-delivered";

      case "CANCELLED":
      case "FAILED_DELIVERY":
        return "status-delay";

      case "IN_TRANSIT":
      case "PICKED_UP":
      case "OUT_FOR_DELIVERY":
        return "status-in-transit";

      case "CREATED":
      default:
        return "status-in-transit";
    }
  };

  const getProgress = (status) => {
    switch (normalizeStatus(status)) {
      case "CREATED":
        return 10;

      case "PICKED_UP":
        return 35;

      case "IN_TRANSIT":
        return 65;

      case "OUT_FOR_DELIVERY":
        return 85;

      case "DELIVERED":
        return 100;

      case "FAILED_DELIVERY":
        return 65;

      case "CANCELLED":
        return 0;

      default:
        return 0;
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLocationText = (location) => {
    if (!location) {
      return "Location unavailable";
    }

    const currentLocation =
      location.currentLocation || location;

    const latitude =
      currentLocation.latitude ??
      currentLocation.lat;

    const longitude =
      currentLocation.longitude ??
      currentLocation.lng;

    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
    ) {
      return "Location unavailable";
    }

    return `${Number(latitude).toFixed(5)}, ${Number(
      longitude
    ).toFixed(5)}`;
  };

  const getCustomerName = (shipment) => {
    if (shipment?.customerName) {
      return shipment.customerName;
    }

    if (shipment?.customerFullName) {
      return shipment.customerFullName;
    }

    if (shipment?.customer) {
      if (
        typeof shipment.customer === "string"
      ) {
        return shipment.customer;
      }

      const fullName = [
        shipment.customer.firstName,
        shipment.customer.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      return (
        fullName ||
        shipment.customer.name ||
        shipment.customer.fullName ||
        shipment.customer.email ||
        "Not assigned"
      );
    }

    return "Not assigned";
  };

  const getRouteText = (shipment) => {
    const sender =
      shipment?.senderAddress ||
      shipment?.senderCity ||
      shipment?.senderLocation ||
      "Origin unavailable";

    const receiver =
      shipment?.receiverAddress ||
      shipment?.receiverCity ||
      shipment?.receiverLocation ||
      "Destination unavailable";

    return `${sender} → ${receiver}`;
  };

  /* =========================================================
     LOAD SHIPMENTS
     ========================================================= */

  const loadShipments = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await apiRequest(
        "/api/shipments"
      );

      const data = Array.isArray(response)
        ? response
        : response?.content ||
          response?.data ||
          response?.shipments ||
          [];

      setShipments(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Unable to load shipments:",
        err
      );

      setError(
        err?.message ||
          "Unable to load shipments."
      );

      setShipments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     LOAD SELECTED SHIPMENT DETAILS
     ========================================================= */

  const loadShipmentDetails = async (
    shipment
  ) => {
    if (!shipment?.id) {
      return;
    }

    setSelectedShipment(shipment);
    setSelectedLocation(null);
    setSelectedTracking(null);
    setLocationHistory([]);

    try {
      const location = await apiRequest(
        "/api/shipments/" +
          shipment.id +
          "/location"
      );

      setSelectedLocation(location);
    } catch (err) {
      console.log(
        "Location information unavailable:",
        err?.message
      );
    }

    try {
      const tracking = await apiRequest(
        "/api/shipments/" +
          shipment.id +
          "/tracking"
      );

      setSelectedTracking(tracking);
    } catch (err) {
      console.log(
        "Tracking information unavailable:",
        err?.message
      );
    }

    try {
      const history = await apiRequest(
        "/api/shipments/" +
          shipment.id +
          "/location-history"
      );

      const historyData = Array.isArray(history)
        ? history
        : history?.content ||
          history?.data ||
          history?.locationHistory ||
          [];

      setLocationHistory(
        Array.isArray(historyData)
          ? historyData
          : []
      );
    } catch (err) {
      console.log(
        "Location history unavailable:",
        err?.message
      );
    }
  };

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    loadShipments(false);
  }, []);

  /* =========================================================
     REFRESH
     ========================================================= */

  const refreshAll = async () => {
    const previousSelectedId =
      selectedShipment?.id;

    await loadShipments(true);

    if (previousSelectedId) {
      try {
        const refreshedShipment =
          await apiRequest(
            "/api/shipments/" +
              previousSelectedId
          );

        await loadShipmentDetails(
          refreshedShipment
        );
      } catch (err) {
        console.log(
          "Could not refresh selected shipment:",
          err?.message
        );
      }
    }
  };

  /* =========================================================
     STATUS MODAL
     ========================================================= */

  const openStatusModal = (shipment) => {
    if (!shipment?.id) {
      return;
    }

    setSelectedShipment(shipment);

    setStatusForm({
      status:
        normalizeStatus(shipment?.status) ||
        "CREATED",
      remarks: "",
    });

    setError("");
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    if (savingStatus) {
      return;
    }

    setStatusModalOpen(false);

    setStatusForm({
      status: "",
      remarks: "",
    });
  };

  /* =========================================================
     UPDATE STATUS
     ========================================================= */

  const updateStatus = async (event) => {
    event.preventDefault();

    if (!selectedShipment?.id) {
      return;
    }

    try {
      setSavingStatus(true);
      setError("");

      await apiRequest(
        "/api/shipments/" +
          selectedShipment.id +
          "/status",
        {
          method: "PATCH",
          body: JSON.stringify({
            status: statusForm.status,
            remarks:
              statusForm.remarks.trim() ||
              `Status updated to ${statusForm.status}`,
          }),
        }
      );

      setStatusModalOpen(false);

      setStatusForm({
        status: "",
        remarks: "",
      });

      await loadShipments(true);

      try {
        const updatedShipment =
          await apiRequest(
            "/api/shipments/" +
              selectedShipment.id
          );

        await loadShipmentDetails(
          updatedShipment
        );
      } catch (err) {
        console.log(
          "Could not reload shipment:",
          err?.message
        );
      }
    } catch (err) {
      console.error(
        "Status update failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to update shipment status."
      );
    } finally {
      setSavingStatus(false);
    }
  };

  /* =========================================================
     LOCATION MODAL
     ========================================================= */

  const openLocationModal = async (
    shipment
  ) => {
    if (!shipment?.id) {
      return;
    }

    setSelectedShipment(shipment);
    setError("");

    /*
     * First load the latest location for
     * the selected shipment.
     */
    try {
      const response = await apiRequest(
        "/api/shipments/" +
          shipment.id +
          "/location"
      );

      const current =
        response?.currentLocation ||
        null;

      const latitude =
        current?.latitude ??
        current?.lat;

      const longitude =
        current?.longitude ??
        current?.lng;

      setLocationForm({
        latitude:
          latitude !== undefined &&
          latitude !== null
            ? String(latitude)
            : "",

        longitude:
          longitude !== undefined &&
          longitude !== null
            ? String(longitude)
            : "",
      });
    } catch (err) {
      console.log(
        "No existing location:",
        err?.message
      );

      setLocationForm({
        latitude: "",
        longitude: "",
      });
    }

    setLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    if (savingLocation) {
      return;
    }

    setLocationModalOpen(false);

    setLocationForm({
      latitude: "",
      longitude: "",
    });
  };

  /* =========================================================
     UPDATE LOCATION
     ========================================================= */

  const updateLocation = async (event) => {
    event.preventDefault();

    if (!selectedShipment?.id) {
      return;
    }

    const latitude = Number(
      locationForm.latitude
    );

    const longitude = Number(
      locationForm.longitude
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setError(
        "Latitude and longitude must be valid numbers."
      );

      return;
    }

    if (
      latitude < -90 ||
      latitude > 90
    ) {
      setError(
        "Latitude must be between -90 and 90."
      );

      return;
    }

    if (
      longitude < -180 ||
      longitude > 180
    ) {
      setError(
        "Longitude must be between -180 and 180."
      );

      return;
    }

    try {
      setSavingLocation(true);
      setError("");

      await apiRequest(
        "/api/shipments/" +
          selectedShipment.id +
          "/location",
        {
          method: "PATCH",
          body: JSON.stringify({
            latitude,
            longitude,
          }),
        }
      );

      /*
       * Close modal only after successful
       * backend update.
       */
      setLocationModalOpen(false);

      setLocationForm({
        latitude: "",
        longitude: "",
      });

      /*
       * Refresh shipment list.
       */
      await loadShipments(true);

      /*
       * Reload selected shipment location
       * and tracking information.
       */
      try {
        const updatedShipment =
          await apiRequest(
            "/api/shipments/" +
              selectedShipment.id
          );

        await loadShipmentDetails(
          updatedShipment
        );
      } catch (err) {
        console.log(
          "Could not reload updated shipment:",
          err?.message
        );

        /*
         * Even if the shipment detail endpoint
         * is unavailable, load the location again.
         */
        try {
          const updatedLocation =
            await apiRequest(
              "/api/shipments/" +
                selectedShipment.id +
                "/location"
            );

          setSelectedLocation(
            updatedLocation
          );
        } catch (locationErr) {
          console.log(
            "Could not reload location:",
            locationErr?.message
          );
        }
      }
    } catch (err) {
      console.error(
        "Location update failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to update shipment location."
      );
    } finally {
      setSavingLocation(false);
    }
  };

  /* =========================================================
     DERIVED DATA
     ========================================================= */

  const activeShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const status = normalizeStatus(
        shipment?.status
      );

      return (
        status !== "DELIVERED" &&
        status !== "CANCELLED"
      );
    });
  }, [shipments]);

  const inTransitShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const status = normalizeStatus(
        shipment?.status
      );

      return (
        status === "PICKED_UP" ||
        status === "IN_TRANSIT" ||
        status === "OUT_FOR_DELIVERY"
      );
    });
  }, [shipments]);

  const deliveredShipments = useMemo(() => {
    return shipments.filter(
      (shipment) =>
        normalizeStatus(
          shipment?.status
        ) === "DELIVERED"
    );
  }, [shipments]);

  const cancelledShipments = useMemo(() => {
    return shipments.filter(
      (shipment) =>
        normalizeStatus(
          shipment?.status
        ) === "CANCELLED"
    );
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    const query =
      searchTerm.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const status = normalizeStatus(
        shipment?.status
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      const searchableText = [
        shipment?.trackingNumber,
        shipment?.referenceId,
        shipment?.customerName,
        shipment?.customerFullName,
        shipment?.businessClientName,
        shipment?.senderName,
        shipment?.senderAddress,
        shipment?.receiverName,
        shipment?.receiverAddress,
        shipment?.assignedOperatorName,
        shipment?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const customer =
        getCustomerName(
          shipment
        ).toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query) ||
        customer.includes(query);

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    shipments,
    searchTerm,
    statusFilter,
  ]);

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="operator-shipment-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="operator-shipment-sidebar">

        <div className="shipment-brand">

          <div className="shipment-brand-icon">
            <Truck size={22} />
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>

        </div>

        <div className="shipment-role">
          <span></span>
          Logistics Operator
        </div>

        <nav className="shipment-nav">

          <Link to="/dashboard/operator">
            <Navigation size={18} />
            Dashboard
          </Link>

          <Link
            to="/operator/shipment-tracking"
            className="active"
          >
            <Package size={18} />
            Shipment Tracking
          </Link>

          <Link to="/operator/live-delivery">
            <Radio size={18} />
            Live Deliveries

            {inTransitShipments.length > 0 && (
              <b>
                {inTransitShipments.length}
              </b>
            )}
          </Link>

          <Link to="/operator/driver-tracking">
            <UserRound size={18} />
            Driver Tracking
          </Link>

          <Link to="/operator/routes">
            <RouteIcon size={18} />
            Route Management
          </Link>

          <Link to="/operator/eta-delay">
            <Clock3 size={18} />
            ETA & Delays
          </Link>

          <Link to="/operator/pod">
            <CheckCircle2 size={18} />
            Proof of Delivery
          </Link>

        </nav>

        <div className="shipment-sidebar-bottom">

          <div className="shipment-user">

            <div className="shipment-avatar">
              OP
            </div>

            <div>
              <strong>Operator</strong>
              <span>Operations Team</span>
            </div>

          </div>

          <Link
            to="/dashboard/operator"
            className="shipment-back"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="operator-shipment-main">

        {/* ================= HEADER ================= */}

        <header className="shipment-header">

          <div>

            <div className="shipment-breadcrumb">
              Operations / Shipment Tracking
            </div>

            <div className="shipment-title-row">

              <div>

                <h1>
                  Shipment Tracking
                </h1>

                <p>
                  Monitor and update your assigned shipments.
                </p>

              </div>

              <div className="shipment-live">
                <span></span>
                LIVE
              </div>

            </div>

          </div>

          <div className="shipment-header-actions">

            <button
              type="button"
              className="shipment-refresh"
              onClick={refreshAll}
              disabled={refreshing}
            >

              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "shipment-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>

            <button
              type="button"
              className="shipment-icon-button"
              title="Notifications"
            >
              <Bell size={18} />
            </button>

          </div>

        </header>

        {/* ================= ERROR ================= */}

        {error && (

          <div className="shipment-error">

            <AlertTriangle size={17} />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <X size={15} />
            </button>

          </div>

        )}

        {/* ================= STATS ================= */}

        <section className="shipment-stats">

          <div className="shipment-stat-card">

            <div className="shipment-stat-icon orange">
              <Package size={21} />
            </div>

            <div>

              <span>
                Active Shipments
              </span>

              <strong>
                {loading
                  ? "..."
                  : activeShipments.length}
              </strong>

              <small>
                Currently active shipments
              </small>

            </div>

          </div>

          <div className="shipment-stat-card">

            <div className="shipment-stat-icon green">
              <Truck size={21} />
            </div>

            <div>

              <span>
                In Transit
              </span>

              <strong>
                {loading
                  ? "..."
                  : inTransitShipments.length}
              </strong>

              <small>
                Currently in delivery
              </small>

            </div>

          </div>

          <div className="shipment-stat-card">

            <div className="shipment-stat-icon purple">
              <CheckCircle2 size={21} />
            </div>

            <div>

              <span>
                Delivered
              </span>

              <strong>
                {loading
                  ? "..."
                  : deliveredShipments.length}
              </strong>

              <small>
                Successfully delivered
              </small>

            </div>

          </div>

          <div className="shipment-stat-card">

            <div className="shipment-stat-icon red">
              <AlertTriangle size={21} />
            </div>

            <div>

              <span>
                Cancelled
              </span>

              <strong>
                {loading
                  ? "..."
                  : cancelledShipments.length}
              </strong>

              <small>
                Cancelled shipments
              </small>

            </div>

          </div>

        </section>

        {/* ================= SHIPMENT TABLE ================= */}

        <section className="shipment-table-card">

          <div className="shipment-table-header">

            <div>

              <h2>
                Assigned Shipments
              </h2>

              <p>
                Shipments currently available for your operations.
              </p>

            </div>

            <div className="shipment-tools">

              <div className="shipment-search">

                <Search size={15} />

                <input
                  type="text"
                  placeholder="Search shipment..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

              </div>

              <select
                className="shipment-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All Statuses
                </option>

                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {getDisplayStatus(
                        status
                      )}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          <div className="shipment-table-wrapper">

            <table className="shipment-table">

              <thead>

                <tr>
                  <th>SHIPMENT</th>
                  <th>CUSTOMER</th>
                  <th>ROUTE</th>
                  <th>CURRENT LOCATION</th>
                  <th>PROGRESS</th>
                  <th>UPDATED</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "35px",
                        color: "#73798a",
                      }}
                    >
                      Loading shipments...
                    </td>

                  </tr>

                ) : filteredShipments.length === 0 ? (

                  <tr>

                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "35px",
                        color: "#73798a",
                      }}
                    >
                      No shipments found.
                    </td>

                  </tr>

                ) : (

                  filteredShipments.map(
                    (shipment) => {

                      const progress =
                        getProgress(
                          shipment?.status
                        );

                      const isSelected =
                        selectedShipment?.id ===
                        shipment?.id;

                      return (

                        <tr
                          key={shipment.id}
                          style={
                            isSelected
                              ? {
                                  background:
                                    "rgba(255,255,255,0.025)",
                                }
                              : undefined
                          }
                        >

                          {/* SHIPMENT */}

                          <td>

                            <div className="shipment-id-cell">

                              <div className="shipment-id-icon">
                                <Package size={16} />
                              </div>

                              <div>

                                <strong>
                                  {shipment?.trackingNumber ||
                                    `Shipment #${shipment?.id}`}
                                </strong>

                                <span>
                                  {shipment?.referenceId ||
                                    `ID ${shipment?.id}`}
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* CUSTOMER */}

                          <td>

                            <span className="shipment-customer">
                              {getCustomerName(
                                shipment
                              )}
                            </span>

                          </td>

                          {/* ROUTE */}

                          <td>

                            <span className="shipment-route">
                              {getRouteText(
                                shipment
                              )}
                            </span>

                          </td>

                          {/* LOCATION */}

                          <td>

                            <div className="shipment-location">

                              <MapPin size={14} />

                              {isSelected
                                ? getLocationText(
                                    selectedLocation
                                  )
                                : "Click View"}

                            </div>

                          </td>

                          {/* PROGRESS */}

                          <td>

                            <div className="shipment-progress">

                              <div className="shipment-progress-top">
                                {progress}%
                              </div>

                              <div className="shipment-progress-bar">

                                <span
                                  style={{
                                    width: `${progress}%`,
                                  }}
                                ></span>

                              </div>

                            </div>

                          </td>

                          {/* UPDATED */}

                          <td>

                            <div className="shipment-eta">

                              <Clock3 size={13} />

                              {formatDate(
                                shipment?.updatedAt
                              )}

                            </div>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`shipment-status ${getStatusClass(
                                shipment?.status
                              )}`}
                            >

                              <i></i>

                              {getDisplayStatus(
                                shipment?.status
                              )}

                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td>

                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                              }}
                            >

                              {/* VIEW */}

                              <button
                                type="button"
                                className="shipment-icon-button"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                }}
                                title="View tracking"
                                onClick={() =>
                                  loadShipmentDetails(
                                    shipment
                                  )
                                }
                              >
                                <Navigation
                                  size={14}
                                />
                              </button>

                              {/* STATUS */}

                              <button
                                type="button"
                                className="shipment-icon-button"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                }}
                                title="Update status"
                                onClick={() =>
                                  openStatusModal(
                                    shipment
                                  )
                                }
                              >
                                <CheckCircle2
                                  size={14}
                                />
                              </button>

                              {/* LOCATION */}

                              <button
                                type="button"
                                className="shipment-icon-button"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                }}
                                title="Update location"
                                onClick={() =>
                                  openLocationModal(
                                    shipment
                                  )
                                }
                              >
                                <MapPin size={14} />
                              </button>

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

          <div className="shipment-table-footer">

            <span>

              Showing{" "}

              <strong>
                {filteredShipments.length}
              </strong>{" "}

              of{" "}

              <strong>
                {shipments.length}
              </strong>{" "}

              shipments

            </span>

            <span>
              Current shipment records
            </span>

          </div>

        </section>

        {/* ================= BOTTOM SUMMARY ================= */}

        <section className="shipment-bottom-grid">

          <div className="shipment-bottom-card">

            <div className="bottom-icon orange-bottom">
              <Package size={19} />
            </div>

            <div>

              <span>
                Assigned Shipments
              </span>

              <strong>
                {shipments.length}
              </strong>

              <p>
                Current shipment records
              </p>

            </div>

          </div>

          <div className="shipment-bottom-card">

            <div className="bottom-icon purple-bottom">
              <MapPin size={19} />
            </div>

            <div>

              <span>
                Location Records
              </span>

              <strong>
                {locationHistory.length}
              </strong>

              <p>
                Selected shipment history
              </p>

            </div>

          </div>

        </section>

        {/* ================= STATUS MODAL ================= */}

        {statusModalOpen &&
          selectedShipment && (

            <div
              className="shipment-modal-backdrop"
              style={{
                position: "fixed",
                inset: 0,
                background:
                  "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
              }}
            >

              <div
                style={{
                  width: "min(480px, 92vw)",
                  background: "#11151f",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "15px",
                  padding: "22px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                  }}
                >

                  <div>

                    <span
                      style={{
                        color: "#ff8757",
                        fontSize: "9px",
                        fontWeight: 800,
                      }}
                    >
                      UPDATE SHIPMENT
                    </span>

                    <h2
                      style={{
                        margin:
                          "6px 0 4px",
                        fontSize: "19px",
                      }}
                    >
                      Update Status
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#6e7585",
                        fontSize: "11px",
                      }}
                    >
                      {selectedShipment.trackingNumber ||
                        `Shipment #${selectedShipment.id}`}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      closeStatusModal
                    }
                    disabled={savingStatus}
                    style={{
                      border: 0,
                      background:
                        "transparent",
                      color: "#8d94a4",
                      cursor: "pointer",
                    }}
                  >
                    <X size={18} />
                  </button>

                </div>

                <form
                  onSubmit={updateStatus}
                >

                  <label
                    style={{
                      display: "block",
                      color: "#9ca3b1",
                      fontSize: "11px",
                      marginBottom: "16px",
                    }}
                  >

                    Shipment Status

                    <select
                      value={
                        statusForm.status
                      }
                      onChange={(event) =>
                        setStatusForm(
                          (current) => ({
                            ...current,
                            status:
                              event.target
                                .value,
                          })
                        )
                      }
                      required
                      style={{
                        display: "block",
                        width: "100%",
                        marginTop: "7px",
                        padding: "11px",
                        borderRadius: "8px",
                        background:
                          "#0b0e17",
                        color: "#fff",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                      }}
                    >

                      {STATUS_OPTIONS.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {getDisplayStatus(
                              status
                            )}
                          </option>
                        )
                      )}

                    </select>

                  </label>

                  <label
                    style={{
                      display: "block",
                      color: "#9ca3b1",
                      fontSize: "11px",
                    }}
                  >

                    Remarks

                    <textarea
                      rows="4"
                      value={
                        statusForm.remarks
                      }
                      onChange={(event) =>
                        setStatusForm(
                          (current) => ({
                            ...current,
                            remarks:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder="Optional remarks"
                      style={{
                        display: "block",
                        width: "100%",
                        marginTop: "7px",
                        padding: "11px",
                        resize: "vertical",
                        borderRadius: "8px",
                        background:
                          "#0b0e17",
                        color: "#fff",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                      }}
                    />

                  </label>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "flex-end",
                      gap: "8px",
                      marginTop: "18px",
                    }}
                  >

                    <button
                      type="button"
                      onClick={
                        closeStatusModal
                      }
                      disabled={savingStatus}
                      className="shipment-map-button"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={savingStatus}
                      className="shipment-map-button"
                    >
                      {savingStatus
                        ? "Updating..."
                        : "Update Status"}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

        {/* ================= LOCATION MODAL ================= */}

        {locationModalOpen &&
          selectedShipment && (

            <div
              className="shipment-modal-backdrop"
              style={{
                position: "fixed",
                inset: 0,
                background:
                  "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
              }}
            >

              <div
                style={{
                  width: "min(480px, 92vw)",
                  background: "#11151f",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "15px",
                  padding: "22px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                  }}
                >

                  <div>

                    <span
                      style={{
                        color: "#3cddb0",
                        fontSize: "9px",
                        fontWeight: 800,
                      }}
                    >
                      SHIPMENT LOCATION
                    </span>

                    <h2
                      style={{
                        margin:
                          "6px 0 4px",
                        fontSize: "19px",
                      }}
                    >
                      Update Location
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#6e7585",
                        fontSize: "11px",
                      }}
                    >
                      {selectedShipment.trackingNumber ||
                        `Shipment #${selectedShipment.id}`}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      closeLocationModal
                    }
                    disabled={
                      savingLocation
                    }
                    style={{
                      border: 0,
                      background:
                        "transparent",
                      color: "#8d94a4",
                      cursor: "pointer",
                    }}
                  >
                    <X size={18} />
                  </button>

                </div>

                <form
                  onSubmit={updateLocation}
                >

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: "10px",
                    }}
                  >

                    <label
                      style={{
                        color: "#9ca3b1",
                        fontSize: "11px",
                      }}
                    >

                      Latitude

                      <input
                        type="number"
                        step="any"
                        min="-90"
                        max="90"
                        required
                        value={
                          locationForm.latitude
                        }
                        onChange={(event) =>
                          setLocationForm(
                            (current) => ({
                              ...current,
                              latitude:
                                event.target
                                  .value,
                            })
                          )
                        }
                        placeholder="17.4065"
                        style={{
                          display: "block",
                          width: "100%",
                          marginTop: "7px",
                          padding: "11px",
                          borderRadius: "8px",
                          background:
                            "#0b0e17",
                          color: "#fff",
                          border:
                            "1px solid rgba(255,255,255,0.08)",
                          boxSizing:
                            "border-box",
                        }}
                      />

                    </label>

                    <label
                      style={{
                        color: "#9ca3b1",
                        fontSize: "11px",
                      }}
                    >

                      Longitude

                      <input
                        type="number"
                        step="any"
                        min="-180"
                        max="180"
                        required
                        value={
                          locationForm.longitude
                        }
                        onChange={(event) =>
                          setLocationForm(
                            (current) => ({
                              ...current,
                              longitude:
                                event.target
                                  .value,
                            })
                          )
                        }
                        placeholder="78.4772"
                        style={{
                          display: "block",
                          width: "100%",
                          marginTop: "7px",
                          padding: "11px",
                          borderRadius: "8px",
                          background:
                            "#0b0e17",
                          color: "#fff",
                          border:
                            "1px solid rgba(255,255,255,0.08)",
                          boxSizing:
                            "border-box",
                        }}
                      />

                    </label>

                  </div>

                  <div
                    style={{
                      marginTop: "15px",
                      padding: "11px",
                      borderRadius: "8px",
                      background:
                        "rgba(60,221,176,0.05)",
                      color: "#7f8797",
                      fontSize: "10px",
                      lineHeight: 1.5,
                    }}
                  >
                    Enter the latitude and longitude
                    for the shipment's current location.
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "flex-end",
                      gap: "8px",
                      marginTop: "18px",
                    }}
                  >

                    <button
                      type="button"
                      onClick={
                        closeLocationModal
                      }
                      disabled={
                        savingLocation
                      }
                      className="shipment-map-button"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        savingLocation
                      }
                      className="shipment-map-button"
                    >
                      {savingLocation
                        ? "Updating..."
                        : "Update Location"}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

      </main>

    </div>
  );
}

export default OperatorShipmentTracking;