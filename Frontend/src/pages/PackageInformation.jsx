
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import "./PackageInformation.css";

function PackageInformation() {
  const [shipments, setShipments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    loadPackageData();
  }, []);

  const loadPackageData = async () => {
    try {
      setLoading(true);
      setError("");

      const [currentUser, shipmentData] = await Promise.all([
        apiRequest("/api/users/me"),
        apiRequest("/api/shipments"),
      ]);

      setUser(currentUser);

      const shipmentList = Array.isArray(shipmentData)
        ? shipmentData
        : shipmentData?.content ||
          shipmentData?.shipments ||
          shipmentData?.data ||
          [];

      setShipments(shipmentList);
    } catch (err) {
      console.error("Failed to load package information:", err);
      setError(err.message || "Unable to load package information.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Backend field names can differ depending on the DTO/entity mapping.
   * These helpers read the available backend value without creating
   * dummy package information.
   */
  const getValue = (shipment, fields) => {
    for (const field of fields) {
      const value = shipment?.[field];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return null;
  };

  const getPackageType = (shipment) =>
    getValue(shipment, [
      "packageType",
      "type",
      "package_type",
    ]);

  const getQuantity = (shipment) =>
    getValue(shipment, [
      "quantity",
      "packageQuantity",
      "numberOfPackages",
      "numberOfItems",
      "packageCount",
    ]);

  const getWeight = (shipment) =>
    getValue(shipment, [
      "weight",
      "packageWeight",
      "weightKg",
      "packageWeightKg",
    ]);

  const getDimensions = (shipment) => {
    const directValue = getValue(shipment, [
      "dimensions",
      "dimension",
      "packageDimensions",
    ]);

    if (directValue) {
      if (typeof directValue === "object") {
        const length = directValue.length ?? directValue.l;
        const width = directValue.width ?? directValue.w;
        const height = directValue.height ?? directValue.h;

        if (length && width && height) {
          return `${length} × ${width} × ${height} cm`;
        }
      }

      return String(directValue);
    }

    const length = getValue(shipment, [
      "length",
      "packageLength",
      "lengthCm",
    ]);

    const width = getValue(shipment, [
      "width",
      "packageWidth",
      "widthCm",
    ]);

    const height = getValue(shipment, [
      "height",
      "packageHeight",
      "heightCm",
    ]);

    if (length && width && height) {
      return `${length} × ${width} × ${height} cm`;
    }

    return null;
  };

  const getCategory = (shipment) =>
    getValue(shipment, [
      "category",
      "packageCategory",
      "package_category",
      "productCategory",
    ]);

  const getDeclaredValue = (shipment) =>
    getValue(shipment, [
      "declaredValue",
      "packageValue",
      "declaredAmount",
      "value",
    ]);

  const formatWeight = (value) => {
    if (value === null || value === undefined) {
      return "Data unavailable";
    }

    if (typeof value === "number") {
      return `${value} kg`;
    }

    const text = String(value);

    if (/kg|g$/i.test(text.trim())) {
      return text;
    }

    return `${text} kg`;
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return "Data unavailable";
    }

    if (typeof value === "number") {
      return `₹${value.toLocaleString("en-IN")}`;
    }

    return String(value);
  };

  const formatStatus = (status) => {
    if (!status) return "Data unavailable";

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClass = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "IN_TRANSIT":
        return "in-transit";

      case "DELIVERED":
        return "delivered";

      case "PICKED_UP":
        return "picked-up";

      case "FAILED_DELIVERY":
      case "DELAYED":
        return "delayed";

      default:
        return "";
    }
  };

  const packageRecords = useMemo(() => {
    return shipments.map((shipment) => ({
      ...shipment,

      packageId:
        getValue(shipment, [
          "packageId",
          "packageID",
          "packageNumber",
        ]) || `PKG-${String(shipment.id).padStart(3, "0")}`,

      trackingId:
        getValue(shipment, [
          "trackingNumber",
          "trackingId",
        ]) || "Data unavailable",

      type: getPackageType(shipment),
      quantity: getQuantity(shipment),
      weight: getWeight(shipment),
      dimensions: getDimensions(shipment),
      category: getCategory(shipment),
      declaredValue: getDeclaredValue(shipment),

      status:
        getValue(shipment, ["status"]) || "Data unavailable",
    }));
  }, [shipments]);

  const packageTypes = useMemo(() => {
    return [
      ...new Set(
        packageRecords
          .map((item) => item.type)
          .filter(Boolean)
      ),
    ];
  }, [packageRecords]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        packageRecords
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ];
  }, [packageRecords]);

  const filteredPackages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return packageRecords.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.packageId).toLowerCase().includes(query) ||
        String(item.trackingId).toLowerCase().includes(query) ||
        String(item.type || "").toLowerCase().includes(query) ||
        String(item.category || "").toLowerCase().includes(query);

      const matchesType =
        typeFilter === "ALL" ||
        String(item.type || "") === typeFilter;

      const matchesCategory =
        categoryFilter === "ALL" ||
        String(item.category || "") === categoryFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory
      );
    });
  }, [
    packageRecords,
    search,
    typeFilter,
    categoryFilter,
  ]);

  const totalPackages = packageRecords.length;

  const totalWeight = useMemo(() => {
    const weights = packageRecords
      .map((item) => item.weight)
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== ""
      )
      .map((value) => {
        const number = parseFloat(
          String(value).replace(/,/g, "")
        );

        return Number.isFinite(number) ? number : null;
      })
      .filter((value) => value !== null);

    if (!weights.length) {
      return "Data unavailable";
    }

    const total = weights.reduce(
      (sum, value) => sum + value,
      0
    );

    if (total >= 1000) {
      return `${(total / 1000).toFixed(1)}T`;
    }

    return `${total.toFixed(1)} kg`;
  }, [packageRecords]);

  const electronicsCount = packageRecords.filter(
    (item) =>
      String(item.category || "").toLowerCase() ===
        "electronics" ||
      String(item.category || "")
        .toLowerCase()
        .includes("electronics")
  ).length;

  const highValueCount = packageRecords.filter((item) => {
    if (
      item.declaredValue === null ||
      item.declaredValue === undefined
    ) {
      return false;
    }

    const value = parseFloat(
      String(item.declaredValue)
        .replace(/₹/g, "")
        .replace(/,/g, "")
    );

    return Number.isFinite(value) && value >= 50000;
  }).length;

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Business Client";

  const avatarLetter =
    displayName?.charAt(0)?.toUpperCase() || "B";

  return (
    <div className="package-info-page">

      {/* SIDEBAR */}
      <aside className="package-sidebar">

        <div className="package-logo">
          <div className="package-logo-icon">⌂</div>

          <div>
            <h2>ShipTrack Pro</h2>
            <span>LOGISTICS INTELLIGENCE</span>
          </div>
        </div>

        <div className="package-menu-title">
          BUSINESS CLIENT
        </div>

        <nav>
          <Link
            to="/dashboard/business"
            className="package-nav"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="package-nav"
          >
            <span>＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="package-nav"
          >
            <span>▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="package-nav"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="package-nav active"
          >
            <span>□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="package-nav"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="package-nav"
          >
            <span>↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="package-nav"
          >
            <span>!</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="package-nav"
          >
            <span>◎</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="package-nav"
          >
            <span>♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="package-nav"
          >
            <span>▥</span>
            Reports & Export
          </Link>
        </nav>

        <Link
          to="/login"
          className="package-logout"
          onClick={() => {
            localStorage.removeItem("shiptrackToken");
            localStorage.removeItem("shiptrackUser");
          }}
        >
          ⇥ Logout
        </Link>
      </aside>

      {/* MAIN */}
      <main className="package-main">

        {/* HEADER */}
        <header className="package-header">

          <div>
            <div className="package-breadcrumb">
              BUSINESS CLIENT / PACKAGE INFORMATION
            </div>

            <h1>Package Information</h1>

            <p>
              View package dimensions, weight, category and
              shipment details.
            </p>
          </div>

          <div className="package-profile">

            <div>
              <strong>{displayName}</strong>
              <span>Business Client</span>
            </div>

            <div className="package-avatar">
              {avatarLetter}
            </div>

          </div>
        </header>

        {/* SUMMARY */}
        <section className="package-summary">

          <div className="package-summary-card">
            <span>Total Packages</span>

            <strong>
              {loading ? "..." : totalPackages}
            </strong>

            <small>
              Across all shipments
            </small>
          </div>

          <div className="package-summary-card">
            <span>Total Weight</span>

            <strong>
              {loading ? "..." : totalWeight}
            </strong>

            <small>
              Current shipment volume
            </small>
          </div>

          <div className="package-summary-card">
            <span>Electronics</span>

            <strong>
              {loading ? "..." : electronicsCount}
            </strong>

            <small>
              Package category
            </small>
          </div>

          <div className="package-summary-card">
            <span>High Value</span>

            <strong>
              {loading ? "..." : highValueCount}
            </strong>

            <small>
              Based on declared value
            </small>
          </div>

        </section>

        {/* PACKAGE DATABASE */}
        <section className="package-panel">

          <div className="package-panel-header">

            <div>
              <span>PACKAGE DATABASE</span>

              <h2>Package Records</h2>
            </div>

            <Link
              to="/business/create-shipment"
              className="package-create-btn"
            >
              + Add Package
            </Link>

          </div>

          {/* FILTERS */}
          <div className="package-filter-bar">

            <div className="package-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search package or tracking ID..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              className="package-filter"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="ALL">
                All Package Types
              </option>

              {packageTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              className="package-filter"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="ALL">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

          </div>

          {/* TABLE */}
          <div className="package-table-wrapper">

            <table className="package-table">

              <thead>
                <tr>
                  <th>PACKAGE ID</th>
                  <th>TRACKING ID</th>
                  <th>TYPE</th>
                  <th>QUANTITY</th>
                  <th>WEIGHT</th>
                  <th>DIMENSIONS</th>
                  <th>CATEGORY</th>
                  <th>VALUE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td colSpan="9">
                      Loading package information...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="9">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  filteredPackages.length === 0 && (
                    <tr>
                      <td colSpan="9">
                        No package records found.
                      </td>
                    </tr>
                  )}

                {!loading &&
                  !error &&
                  filteredPackages.map((packageItem) => {

                    const statusClass =
                      getStatusClass(
                        packageItem.status
                      );

                    return (
                      <tr key={packageItem.id}>

                        <td>
                          <strong>
                            {packageItem.packageId}
                          </strong>
                        </td>

                        <td>
                          <span className="tracking-id">
                            {packageItem.trackingId}
                          </span>
                        </td>

                        <td>
                          <span className="package-type">
                            {packageItem.type ||
                              "Data unavailable"}
                          </span>
                        </td>

                        <td>
                          {packageItem.quantity ??
                            "Data unavailable"}
                        </td>

                        <td>
                          <span className="weight">
                            {formatWeight(
                              packageItem.weight
                            )}
                          </span>
                        </td>

                        <td>
                          {packageItem.dimensions ||
                            "Data unavailable"}
                        </td>

                        <td>
                          <span className="category">
                            {packageItem.category ||
                              "Data unavailable"}
                          </span>
                        </td>

                        <td>
                          {formatValue(
                            packageItem.declaredValue
                          )}
                        </td>

                        <td>
                          <span
                            className={`package-status ${statusClass}`}
                          >
                            ●{" "}
                            {formatStatus(
                              packageItem.status
                            )}
                          </span>
                        </td>

                      </tr>
                    );
                  })}

              </tbody>

            </table>

          </div>

          {/* TABLE FOOTER */}
          <div className="package-table-footer">

            <span>
              Showing{" "}
              <strong>
                {filteredPackages.length}
              </strong>{" "}
              packages
            </span>

            <div className="package-pagination">
              <button type="button">
                ‹
              </button>

              <button
                type="button"
                className="selected"
              >
                1
              </button>

              <button type="button">
                2
              </button>

              <button type="button">
                3
              </button>

              <button type="button">
                …
              </button>

              <button type="button">
                ›
              </button>
            </div>

          </div>

        </section>

        <footer className="package-bottom-footer">
          © 2026 ShipTrack Pro · Integrated Logistics
          Intelligence Platform
        </footer>

      </main>
    </div>
  );
}

export default PackageInformation;

