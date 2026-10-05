
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

  const formatStatus = (status) => {
    if (!status) return "";

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
        return "delayed";

      default:
        return "";
    }
  };

  const packageRecords = useMemo(() => {
    return shipments.filter((shipment) =>
      shipment?.trackingNumber || shipment?.packageDescription ||
      shipment?.packageWeightKg != null
    );
  }, [shipments]);

  const filteredPackages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return packageRecords.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.trackingNumber || "").toLowerCase().includes(query) ||
        String(item.packageDescription || "").toLowerCase().includes(query);
      return matchesSearch;
    });
  }, [packageRecords, search]);

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
              View package description and weight returned with your shipments.
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

          </div>

          {/* TABLE */}
          <div className="package-table-wrapper">

            <table className="package-table">

              <thead>
                <tr>
                  <th>TRACKING ID</th>
                  <th>PACKAGE DESCRIPTION</th>
                  <th>WEIGHT</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td colSpan="4">
                      Loading package information...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="4">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  filteredPackages.length === 0 && (
                    <tr>
                      <td colSpan="4">
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
                          <span className="tracking-id">
                            {packageItem.trackingNumber}
                          </span>
                        </td>

                        <td>
                          {packageItem.packageDescription || ""}
                        </td>

                        <td>
                          {packageItem.packageWeightKg != null
                            ? `${packageItem.packageWeightKg} kg`
                            : ""}
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
          {!loading && !error && (
          <div className="package-table-footer">

            <span>
              Showing{" "}
              <strong>
                {filteredPackages.length}
              </strong>{" "}
              packages
            </span>

          </div>
          )}

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
