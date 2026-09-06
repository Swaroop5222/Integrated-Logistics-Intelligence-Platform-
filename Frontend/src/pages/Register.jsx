import {
  ArrowRight,
  Box,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
  Truck,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Register.css";
import { apiRequest } from "../api";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "",

    // Business Client
    companyName: "",
    registrationNumber: "",
    gstTaxId: "",
    contactPersonName: "",

    // Logistics Operator
    organizationName: "",
    licenseRegistrationNumber: "",
    transportationMode: "",
    operatingArea: "",

    // Support Agent
    employeeId: "",
    department: "",
  });

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // ROLE-SPECIFIC FIELDS
  // =========================================================

  const renderRoleSpecificFields = () => {
    // ---------------------------------------------------------
    // BUSINESS CLIENT
    // ---------------------------------------------------------

    if (formData.role === "business") {
      return (
        <div className="auth-role-fields">
          <div className="auth-field">
            <label>Company Name</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="companyName"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Registration Number</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="registrationNumber"
                placeholder="Enter registration number"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>GST / Tax ID</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="gstTaxId"
                placeholder="Enter GST / Tax ID"
                value={formData.gstTaxId}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Contact Person Name</label>

            <div className="auth-input-wrapper">
              <User size={17} />

              <input
                type="text"
                name="contactPersonName"
                placeholder="Enter contact person name"
                value={formData.contactPersonName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // LOGISTICS OPERATOR
    // ---------------------------------------------------------

    if (formData.role === "operator") {
      return (
        <div className="auth-role-fields">
          <div className="auth-field">
            <label>Organization Name</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="organizationName"
                placeholder="Enter organization name"
                value={formData.organizationName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>License Registration Number</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="licenseRegistrationNumber"
                placeholder="Enter license registration number"
                value={formData.licenseRegistrationNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Transportation Mode</label>

            <div className="auth-select-wrapper">
              <Truck size={17} />

              <select
                name="transportationMode"
                value={formData.transportationMode}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select transportation mode
                </option>

                <option value="road">Road</option>
                <option value="rail">Rail</option>
                <option value="air">Air</option>
                <option value="sea">Sea</option>
                <option value="multimodal">
                  Multimodal
                </option>
              </select>
            </div>
          </div>

          <div className="auth-field">
            <label>Operating Area</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="operatingArea"
                placeholder="Enter operating area"
                value={formData.operatingArea}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------
    // SUPPORT AGENT
    // ---------------------------------------------------------

    if (formData.role === "support") {
      return (
        <div className="auth-role-fields">
          <div className="auth-field">
            <label>Employee ID</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="employeeId"
                placeholder="Enter employee ID"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Department</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="department"
                placeholder="Enter department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();
    const mobile = formData.mobile.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    const selectedRole = formData.role;

    // ---------------------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------------------

    if (!firstName || !lastName) {
      alert("Please enter your first name and last name.");
      return;
    }

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    if (!mobile) {
      alert("Please enter your mobile number.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!selectedRole) {
      alert("Please select your role.");
      return;
    }

    // ---------------------------------------------------------
    // FRONTEND ROLE -> BACKEND ROLE
    // ---------------------------------------------------------

    const roleMap = {
      customer: "CUSTOMER",
      business: "BUSINESS_CLIENT",
      operator: "LOGISTICS_OPERATOR",
      support: "SUPPORT_AGENT",
    };

    const backendRole = roleMap[selectedRole];

    if (!backendRole) {
      alert("Invalid role selected.");
      return;
    }

    // ---------------------------------------------------------
    // BUSINESS VALIDATION
    // ---------------------------------------------------------

    if (selectedRole === "business") {
      if (
        !formData.companyName.trim() ||
        !formData.registrationNumber.trim() ||
        !formData.gstTaxId.trim() ||
        !formData.contactPersonName.trim()
      ) {
        alert("Please complete all Business Client fields.");
        return;
      }
    }

    // ---------------------------------------------------------
    // LOGISTICS OPERATOR VALIDATION
    // ---------------------------------------------------------

    if (selectedRole === "operator") {
      if (
        !formData.organizationName.trim() ||
        !formData.licenseRegistrationNumber.trim() ||
        !formData.transportationMode ||
        !formData.operatingArea.trim()
      ) {
        alert(
          "Please complete all Logistics Operator fields."
        );
        return;
      }
    }

    // ---------------------------------------------------------
    // SUPPORT AGENT VALIDATION
    // ---------------------------------------------------------

    if (selectedRole === "support") {
      if (
        !formData.employeeId.trim() ||
        !formData.department.trim()
      ) {
        alert("Please complete all Support Agent fields.");
        return;
      }
    }

    // ---------------------------------------------------------
    // SEND DATA TO SPRING BOOT
    // ---------------------------------------------------------

    try {
      const response = await apiRequest(
        "/api/auth/register",
        {
          method: "POST",

          body: JSON.stringify({
            fullName: `${firstName} ${lastName}`,
            email: email,
            password: password,
            role: backendRole,
            phoneNumber: mobile,

            // Business fields
            companyName:
              selectedRole === "business"
                ? formData.companyName.trim()
                : null,

            registrationNumber:
              selectedRole === "business"
                ? formData.registrationNumber.trim()
                : null,

            gstTaxId:
              selectedRole === "business"
                ? formData.gstTaxId.trim()
                : null,

            contactPersonName:
              selectedRole === "business"
                ? formData.contactPersonName.trim()
                : null,

            // Operator fields
            organizationName:
              selectedRole === "operator"
                ? formData.organizationName.trim()
                : null,

            licenseRegistrationNumber:
              selectedRole === "operator"
                ? formData.licenseRegistrationNumber.trim()
                : null,

            transportationMode:
              selectedRole === "operator"
                ? formData.transportationMode
                : null,

            operatingArea:
              selectedRole === "operator"
                ? formData.operatingArea.trim()
                : null,

            // Support fields
            employeeId:
              selectedRole === "support"
                ? formData.employeeId.trim()
                : null,

            department:
              selectedRole === "support"
                ? formData.department.trim()
                : null,
          }),
        }
      );

      console.log("Registration response:", response);

      // Registration does NOT automatically login
      localStorage.removeItem("shiptrackToken");
      localStorage.removeItem("shiptrackUser");

      alert(
        "Registration successful! Please login to continue."
      );

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      alert(
        error.message ||
          "Registration failed. Please check the backend."
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="auth-page">
      <div className="auth-background"></div>
      <div className="auth-overlay"></div>

      {/* NAVBAR */}

      <header className="auth-navbar">
        <Link to="/" className="auth-brand">
          <div className="auth-brand-icon">
            <Box size={20} />
          </div>

          <div>
            <strong>
              ShipTrack <span>Pro</span>
            </strong>

            <small>
              LOGISTICS INTELLIGENCE
            </small>
          </div>
        </Link>

        <Link to="/" className="back-home">
          Back to Home
        </Link>
      </header>

      {/* MAIN */}

      <main className="auth-container">

        {/* LEFT SIDE */}

        <section className="auth-info">
          <div className="auth-tag">
            <span></span>
            JOIN THE LOGISTICS NETWORK
          </div>

          <h1>
            Create your
            <br />
            <span>account.</span>
          </h1>

          <p>
            Join ShipTrack Pro to manage shipments,
            monitor deliveries and stay connected
            with your logistics operations.
          </p>

          <div className="auth-features">

            <div className="auth-feature">
              <div className="auth-feature-icon orange">
                <Truck size={17} />
              </div>

              <div>
                <strong>
                  Smart Shipment Management
                </strong>

                <small>
                  Manage your logistics operations
                  from one place.
                </small>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon purple">
                <ShieldCheck size={17} />
              </div>

              <div>
                <strong>
                  Role-Based Access
                </strong>

                <small>
                  Get access to features based
                  on your role.
                </small>
              </div>
            </div>

          </div>
        </section>

        {/* REGISTER CARD */}

        <section className="auth-card">

          <div className="auth-card-header">
            <div className="auth-card-icon">
              <UserPlus size={20} />
            </div>

            <div>
              <h2>Create account</h2>

              <p>
                Register your ShipTrack Pro account
              </p>
            </div>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit}>

            {/* FIRST + LAST NAME */}

            <div
              className="auth-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div className="auth-field">
                <label>First Name</label>

                <div className="auth-input-wrapper">
                  <User size={17} />

                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Last Name</label>

                <div className="auth-input-wrapper">
                  <User size={17} />

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* EMAIL */}

            <div className="auth-field">
              <label>Email Address</label>

              <div className="auth-input-wrapper">
                <Mail size={17} />

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* MOBILE */}

            <div className="auth-field">
              <label>Mobile Number</label>

              <div className="auth-input-wrapper">
                <Phone size={17} />

                <input
                  type="tel"
                  name="mobile"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="auth-field">
              <label>Password</label>

              <div className="auth-input-wrapper">
                <LockKeyhole size={17} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="auth-field">
              <label>Confirm Password</label>

              <div className="auth-input-wrapper">
                <LockKeyhole size={17} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* ROLE */}

            <div className="auth-field">
              <label>Register As</label>

              <div className="auth-select-wrapper">
                <ShieldCheck size={17} />

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select your role
                  </option>

                  <option value="customer">
                    Customer
                  </option>

                  <option value="business">
                    Business Client
                  </option>

                  <option value="operator">
                    Logistics Operator
                  </option>

                  <option value="support">
                    Support Agent
                  </option>
                </select>
              </div>
            </div>

            {/* ROLE-SPECIFIC FIELDS */}

            {renderRoleSpecificFields()}

            {/* TERMS */}

            <label
              className="remember"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "18px",
              }}
            >
              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the terms and conditions
              </span>
            </label>

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
            >
              Create Account

              <ArrowRight size={18} />
            </button>
          </form>

          {/* LOGIN */}

          <div className="auth-divider">
            <span>
              ALREADY HAVE AN ACCOUNT?
            </span>
          </div>

          <p className="auth-switch">
            Already registered?

            <Link to="/login">
              Sign in
            </Link>
          </p>

        </section>
      </main>
    </div>
  );
}

export default Register;