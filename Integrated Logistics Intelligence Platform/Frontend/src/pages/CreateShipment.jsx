import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CreateShipment.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api/shipments";

function CreateShipment() {
  const navigate = useNavigate();

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
    length: "",
    width: "",
    height: "",
    quantity: "1",

    pickupDate: "",
    expectedDelivery: "",
    priority: "Standard",
    transportMode: "Road",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      senderName: formData.senderName,
      receiverName: formData.receiverName,
      senderAddress: [formData.senderAddress, formData.senderCity, formData.senderState, formData.senderPincode]
        .filter(Boolean)
        .join(", "),
      receiverAddress: [formData.receiverAddress, formData.receiverCity, formData.receiverState, formData.receiverPincode]
        .filter(Boolean)
        .join(", "),
      packageDescription: `${formData.quantity} x ${formData.packageType}${formData.length && formData.width && formData.height
        ? ` (${formData.length} x ${formData.width} x ${formData.height})`
        : ""}`,
      packageWeight: Number(formData.weight),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Shipment creation failed (${response.status})`);
      }

      const shipment = await response.json();
      setMessage(`Shipment created successfully! Tracking ID: ${shipment.trackingNumber}`);
      setTimeout(() => navigate("/business/shipment-management"), 1500);
    } catch (error) {
      setMessage(error.message || "Unable to create shipment. Please try again.");
    }
  };

  return (
    <div className="create-shipment-page">

      {/* =================================
          SIDEBAR
      ================================= */}

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


      {/* =================================
          MAIN
      ================================= */}

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


          <div className="create-profile">

            <div className="create-avatar">
              R
            </div>

            <div>
              <strong>Rekha Patil</strong>
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


        {/* =================================
            FORM
        ================================= */}

        <form
          className="shipment-form"
          onSubmit={handleSubmit}
        >

          {/* =================================
              SHIPMENT DETAILS
          ================================= */}

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


          {/* =================================
              SENDER
          ================================= */}

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


              <div className="form-field">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  placeholder="sender@example.com"
                />

              </div>


              <div className="form-field">

                <label>
                  Pincode
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="senderPincode"
                  value={formData.senderPincode}
                  onChange={handleChange}
                  placeholder="500001"
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


              <div className="form-field">

                <label>
                  City
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="senderCity"
                  value={formData.senderCity}
                  onChange={handleChange}
                  placeholder="Hyderabad"
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  State
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="senderState"
                  value={formData.senderState}
                  onChange={handleChange}
                  placeholder="Telangana"
                  required
                />

              </div>

            </div>

          </section>


          {/* =================================
              RECEIVER
          ================================= */}

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


              <div className="form-field">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="receiverEmail"
                  value={formData.receiverEmail}
                  onChange={handleChange}
                  placeholder="receiver@example.com"
                />

              </div>


              <div className="form-field">

                <label>
                  Pincode
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="receiverPincode"
                  value={formData.receiverPincode}
                  onChange={handleChange}
                  placeholder="560001"
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


              <div className="form-field">

                <label>
                  City
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="receiverCity"
                  value={formData.receiverCity}
                  onChange={handleChange}
                  placeholder="Bangalore"
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  State
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="receiverState"
                  value={formData.receiverState}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  required
                />

              </div>

            </div>

          </section>


          {/* =================================
              PACKAGE
          ================================= */}

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
                  Enter package dimensions and weight.
                </p>
              </div>

            </div>


            <div className="form-grid">

              <div className="form-field">

                <label>
                  Package Type
                </label>

                <select
                  name="packageType"
                  value={formData.packageType}
                  onChange={handleChange}
                >
                  <option value="Box">Box</option>
                  <option value="Envelope">Envelope</option>
                  <option value="Pallet">Pallet</option>
                  <option value="Crate">Crate</option>
                </select>

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
                  <span>*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 5.5"
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  Length (cm)
                </label>

                <input
                  type="number"
                  min="0"
                  name="length"
                  value={formData.length}
                  onChange={handleChange}
                  placeholder="40"
                />

              </div>


              <div className="form-field">

                <label>
                  Width (cm)
                </label>

                <input
                  type="number"
                  min="0"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  placeholder="30"
                />

              </div>


              <div className="form-field">

                <label>
                  Height (cm)
                </label>

                <input
                  type="number"
                  min="0"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="20"
                />

              </div>

            </div>

          </section>


          {/* =================================
              DELIVERY
          ================================= */}

          <section className="form-section">

            <div className="form-section-header">

              <div className="section-number">
                05
              </div>

              <div>
                <span>DELIVERY</span>

                <h2>
                  Delivery Details
                </h2>

                <p>
                  Select delivery preferences and schedule.
                </p>
              </div>

            </div>


            <div className="form-grid">

              <div className="form-field">

                <label>
                  Pickup Date
                  <span>*</span>
                </label>

                <input
                  type="date"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  Expected Delivery
                  <span>*</span>
                </label>

                <input
                  type="date"
                  name="expectedDelivery"
                  value={formData.expectedDelivery}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  Delivery Priority
                </label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Standard">
                    Standard
                  </option>

                  <option value="Express">
                    Express
                  </option>

                  <option value="Urgent">
                    Urgent
                  </option>
                </select>

              </div>


              <div className="form-field">

                <label>
                  Transport Mode
                </label>

                <select
                  name="transportMode"
                  value={formData.transportMode}
                  onChange={handleChange}
                >
                  <option value="Road">
                    Road
                  </option>

                  <option value="Rail">
                    Rail
                  </option>

                  <option value="Air">
                    Air
                  </option>

                  <option value="Sea">
                    Sea
                  </option>
                </select>

              </div>

            </div>

          </section>


          {/* =================================
              ACTIONS
          ================================= */}

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
            >
              Create Shipment →
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