import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./CreateShipment.css";
import { apiRequest } from "../api";

function CreateShipment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get("edit");
  const [user, setUser] = useState(null);
  const [operators, setOperators] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [operatorLoadError, setOperatorLoadError] = useState("");
  const [customerLoadError, setCustomerLoadError] = useState("");
  const [shipmentLoading, setShipmentLoading] = useState(Boolean(editingId));

  const userName =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    "Business Client";

  const userInitial = userName.charAt(0).toUpperCase();

  const [formData, setFormData] = useState({
    referenceId: "",
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    senderAddress: "",
    senderCity: "",
    senderState: "",
    senderPincode: "",

    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverAddress: "",
    receiverCity: "",
    receiverState: "",
    receiverPincode: "",

    packageType: "Box",
    weight: "",
    quantity: "1",
    customerId: "",
    assignedOperatorId: "",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadFormData() {
      const [userResult, operatorsResult, customersResult] =
        await Promise.allSettled([
          apiRequest("/api/users/me"),
          apiRequest("/api/users/operators"),
          apiRequest("/api/users/customers"),
        ]);
      if (!active) return;

      if (userResult.status === "fulfilled") {
        setUser(userResult.value);
      } else {
        console.error("Load business profile error:", userResult.reason);
        setOperatorLoadError(
          `Unable to load business profile: ${userResult.reason.message}`
        );
      }

      if (operatorsResult.status === "fulfilled") {
        setOperators(
          Array.isArray(operatorsResult.value) ? operatorsResult.value : []
        );
      } else {
        console.error("Load logistics operators error:", operatorsResult.reason);
        setOperatorLoadError(
          `Unable to load logistics operators: ${operatorsResult.reason.message}`
        );
      }

      if (customersResult.status === "fulfilled") {
        if (!Array.isArray(customersResult.value)) {
          console.error(
            "Unexpected response while loading customer accounts:",
            customersResult.value
          );
          setCustomerLoadError(
            "Unable to load customer accounts: unexpected API response."
          );
        } else {
          setCustomers(
            customersResult.value.filter(
              (customer) =>
                customer?.id != null && customer?.role === "CUSTOMER"
            )
          );
        }
      } else {
        console.error(
          "Load customer accounts error:",
          customersResult.reason
        );
        setCustomerLoadError(
          `Unable to load customer accounts: ${customersResult.reason.message}`
        );
      }
      setCustomersLoading(false);
    }

    loadFormData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!editingId) return undefined;
    let active = true;

    async function loadShipment() {
      try {
        const shipment = await apiRequest(`/api/shipments/${editingId}`);
        if (!active) return;

        setFormData((previous) => ({
          ...previous,
          referenceId: shipment.referenceId || "",
          senderName: shipment.senderName || "",
          senderPhone: shipment.senderPhone || "",
          senderAddress: shipment.senderAddress || "",
          receiverName: shipment.receiverName || "",
          receiverPhone: shipment.receiverPhone || "",
          receiverAddress: shipment.receiverAddress || "",
          packageType: shipment.packageDescription || "",
          weight: shipment.packageWeightKg ?? "",
          quantity: "",
          customerId: shipment.customerId ?? "",
          assignedOperatorId: shipment.assignedOperatorId || "",
        }));
      } catch (error) {
        console.error("Failed to load shipment for editing:", error);
        if (active) setMessage(`Error: ${error.message}`);
      } finally {
        if (active) setShipmentLoading(false);
      }
    }

    loadShipment();
    return () => {
      active = false;
    };
  }, [editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!user?.id || user.role !== "BUSINESS_CLIENT") {
        alert(
          "Please login as a Business Client before creating a shipment."
        );
        navigate("/login");
        return;
      }

      if (
        !formData.senderName.trim() ||
        !formData.senderPhone.trim() ||
        !formData.senderAddress.trim() ||
        !formData.receiverName.trim() ||
        !formData.receiverPhone.trim() ||
        !formData.receiverAddress.trim()
      ) {
        setMessage("Error: Complete all required sender and receiver fields.");
        return;
      }

      if (
        formData.weight !== "" &&
        (!Number.isFinite(Number(formData.weight)) ||
          Number(formData.weight) <= 0)
      ) {
        setMessage("Error: Package weight must be greater than zero.");
        return;
      }

      const selectedCustomer = customers.find(
        (customer) => String(customer.id) === String(formData.customerId)
      );
      if (!selectedCustomer) {
        setMessage("Error: Select a Customer account.");
        return;
      }

      setIsSubmitting(true);

      const payload = {
        assignedOperatorId: formData.assignedOperatorId
          ? Number(formData.assignedOperatorId)
          : null,
        referenceId: formData.referenceId.trim() || null,

        senderName: formData.senderName.trim(),
        senderPhone: formData.senderPhone.trim(),
        senderAddress: formData.senderAddress.trim(),

        receiverName: formData.receiverName.trim(),
        receiverPhone: formData.receiverPhone.trim(),
        receiverAddress: formData.receiverAddress.trim(),

        packageDescription:
          editingId || !formData.quantity
          ? formData.packageType.trim()
          : `${formData.packageType.trim()} x${formData.quantity}`,
        packageWeightKg:
          formData.weight === "" ? null : Number(formData.weight),
        customerId: Number(selectedCustomer.id),
      };

      const data = await apiRequest(
        editingId ? `/api/shipments/${editingId}` : "/api/shipments",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      setMessage(
        `${editingId ? "Shipment updated" : "Shipment created"} successfully! Tracking number: ${data.trackingNumber}`
      );

      setTimeout(() => {
        navigate("/business/shipment-management");
      }, 1200);
    } catch (error) {
      console.error("Create shipment error:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-shipment-page">

      {/* SIDEBAR */}

      <aside className="create-sidebar">

        <div className="create-logo">

          <div className="create-logo-icon">
            S
          </div>

          <div>
            <h2>ShipTrack Pro</h2>
            <span>LOGISTICS INTELLIGENCE</span>
          </div>

        </div>

        <div className="create-menu-title">
          BUSINESS CLIENT
        </div>

        <nav className="create-navigation">

          <Link
            to="/dashboard/business"
            className="create-nav-link"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="create-nav-link active"
          >
            <span>＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="create-nav-link"
          >
            <span>▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="create-nav-link"
          >
            <span>◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="create-nav-link"
          >
            <span>□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="create-nav-link"
          >
            <span>⌖</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="create-nav-link"
          >
            <span>↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="create-nav-link"
          >
            <span>!</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="create-nav-link"
          >
            <span>◎</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="create-nav-link"
          >
            <span>♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="create-nav-link"
          >
            <span>▥</span>
            Reports & Export
          </Link>

        </nav>

        <Link
          to="/login"
          className="create-logout"
        >
          ⇥ Logout
        </Link>

      </aside>


      {/* MAIN */}

      <main className="create-main">

        {/* HEADER */}

        <header className="create-header">

          <div>

            <div className="create-breadcrumb">
              BUSINESS CLIENT / CREATE SHIPMENT
            </div>

            <h1>
              Create Shipment
            </h1>

            <p>
              Enter shipment details to create and schedule a new delivery.
            </p>

          </div>


          {/* DYNAMIC USER PROFILE */}

          <div className="create-profile">

            <div className="create-avatar">
              {userInitial}
            </div>

            <div>
              <strong>{userName}</strong>
              <span>Business Client</span>
            </div>

          </div>

        </header>


        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="create-success">
            <span>✓</span>
            {message}
          </div>
        )}

        {operatorLoadError && (
          <div className="create-success">
            {operatorLoadError}
          </div>
        )}

        {customerLoadError && (
          <div className="create-success">
            {customerLoadError}
          </div>
        )}


        {/* FORM */}

        <form
          className="shipment-form"
          onSubmit={handleSubmit}
        >

          {/* SHIPMENT DETAILS */}

          <section className="form-section">

            <div className="form-section-header">

              <div className="section-number">
                01
              </div>

              <div>
                <span>SHIPMENT</span>

                <h2>
                  Shipment Details
                </h2>

                <p>
                  Add a reference number for this shipment.
                </p>
              </div>

            </div>

            <div className="form-grid one-column">

              <div className="form-field">

                <label>
                  Reference / Order ID
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="referenceId"
                  value={formData.referenceId}
                  onChange={handleChange}
                  placeholder="e.g. ORD-2026-001"
                  required
                />

              </div>

            </div>

          </section>


          {/* SENDER */}

          <section className="form-section">

            <div className="form-section-header">

              <div className="section-number">
                02
              </div>

              <div>
                <span>SENDER</span>

                <h2>
                  Sender Details
                </h2>

                <p>
                  Provide the pickup location and contact information.
                </p>
              </div>

            </div>

            <div className="form-grid">

              <div className="form-field">

                <label>
                  Sender Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="Enter sender name"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Phone Number
                  <span>*</span>
                </label>

                <input
                  type="tel"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                />

              </div>

              <div className="form-field full-width">

                <label>
                  Address
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  placeholder="Enter complete pickup address"
                  required
                />

              </div>

            </div>

          </section>


          {/* RECEIVER */}

          <section className="form-section">

            <div className="form-section-header">

              <div className="section-number">
                03
              </div>

              <div>
                <span>RECEIVER</span>

                <h2>
                  Receiver Details
                </h2>

                <p>
                  Provide the destination and recipient information.
                </p>
              </div>

            </div>

            <div className="form-grid">

              <div className="form-field">

                <label>
                  Receiver Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  placeholder="Enter receiver name"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Phone Number
                  <span>*</span>
                </label>

                <input
                  type="tel"
                  name="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                />

              </div>

              <div className="form-field full-width">

                <label>
                  Address
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="receiverAddress"
                  value={formData.receiverAddress}
                  onChange={handleChange}
                  placeholder="Enter complete delivery address"
                  required
                />

              </div>

            </div>

          </section>


          {/* PACKAGE */}

          <section className="form-section">

            <div className="form-section-header">

              <div className="section-number">
                04
              </div>

              <div>
                <span>PACKAGE</span>

                <h2>
                  Package Information
                </h2>

                <p>
                  Enter the package description and weight.
                </p>
              </div>

            </div>

            <div className="form-grid">

              <div className="form-field">

                <label>
                  Package Description
                </label>

                <input
                  type="text"
                  name="packageType"
                  value={formData.packageType}
                  onChange={handleChange}
                  placeholder="Describe the package"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                />

              </div>

              <div className="form-field">

                <label>
                  Weight (kg)
                </label>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 5.5"
                />

              </div>

            </div>

          </section>

          {/* LOGISTICS OPERATOR */}

          <section className="form-section">

            <div className="form-section-header">

              <div className="section-number">
                05
              </div>

              <div>
                <span>ASSIGNMENT</span>

                <h2>
                  Logistics Operator
                </h2>

                <p>Assign a customer account and an operator to this shipment.</p>
              </div>

            </div>

            <div className="form-grid one-column">

              <div className="form-field">
                <label htmlFor="customerId">
                  Assign Customer Account
                  <span>*</span>
                </label>

                <select
                  id="customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  required
                  disabled={
                    customersLoading ||
                    customerLoadError !== "" ||
                    customers.length === 0
                  }
                >
                  <option value="">
                    {customersLoading
                      ? "Loading customer accounts..."
                      : customerLoadError
                        ? "Customer accounts unavailable"
                        : customers.length === 0
                          ? "No customer accounts available"
                          : "Select a customer"}
                  </option>
                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.fullName}
                      {customer.email ? ` (${customer.email})` : ""}
                    </option>
                  ))}
                </select>

              </div>

              <div className="form-field">

                <label htmlFor="assignedOperatorId">
                  Assign Logistics Operator
                </label>

                <select
                  id="assignedOperatorId"
                  name="assignedOperatorId"
                  value={formData.assignedOperatorId}
                  onChange={handleChange}
                  disabled={operatorLoadError !== "" || operators.length === 0}
                >
                  <option value="">
                    {operatorLoadError
                      ? "Operators unavailable"
                      : operators.length === 0
                        ? "No operators available"
                        : "Select an operator"}
                  </option>

                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.fullName}
                      {operator.email ? ` (${operator.email})` : ""}
                    </option>
                  ))}
                </select>

              </div>

            </div>

          </section>


          {/* ACTIONS */}

          <div className="form-actions">

            <Link
              to="/dashboard/business"
              className="cancel-btn"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="submit-shipment-btn"
              disabled={isSubmitting || shipmentLoading || !user}
              style={
                isSubmitting || shipmentLoading || !user
                  ? {
                      opacity: 0.7,
                      cursor: "not-allowed",
                    }
                  : {}
              }
            >
              {isSubmitting
                ? (editingId ? "Updating Shipment..." : "Creating Shipment...")
                : (editingId ? "Update Shipment →" : "Create Shipment →")}
            </button>

          </div>

        </form>


        <footer className="create-footer">
          © 2026 ShipTrack Pro · Integrated Logistics Intelligence Platform
        </footer>

      </main>

    </div>
  );
}

export default CreateShipment;