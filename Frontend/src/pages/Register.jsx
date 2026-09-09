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
  Building2,
  MapPin,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Register.css";
import { apiRequest } from "../api";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Common
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "",

    // Address
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",

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
  // ROLE SPECIFIC FIELDS
  // =========================================================

  const renderRoleSpecificFields = () => {

  if (formData.role === "business") {
    return (
      <div className="auth-role-fields">

        <div className="auth-field">
          <label>Company Name</label>

          <div className="auth-input-wrapper">
            <Building2 size={17} />

            <input
              type="text"
              name="companyName"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={handleChange}
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
            />
          </div>
        </div>

      </div>
    );
  }


  if (formData.role === "operator") {
    return (
      <div className="auth-role-fields">

        <div className="auth-field">
          <label>Organization Name</label>

          <div className="auth-input-wrapper">
            <Building2 size={17} />

            <input
              type="text"
              name="organizationName"
              placeholder="Enter organization name"
              value={formData.organizationName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="auth-field">
          <label>License / Registration Number</label>

          <div className="auth-input-wrapper">

            <input
              type="text"
              name="licenseRegistrationNumber"
              placeholder="Enter license / registration number"
              value={formData.licenseRegistrationNumber}
              onChange={handleChange}
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

            <MapPin size={17} />

            <input
              type="text"
              name="operatingArea"
              placeholder="Enter operating area"
              value={formData.operatingArea}
              onChange={handleChange}
            />

          </div>
        </div>

      </div>
    );
  }


  if (formData.role === "support") {
    return (
      <div className="auth-role-fields">

        <div className="auth-field">
          <label>Employee ID</label>

          <div className="auth-input-wrapper">

            <User size={17} />

            <input
              type="text"
              name="employeeId"
              placeholder="Enter employee ID"
              value={formData.employeeId}
              onChange={handleChange}
            />

          </div>
        </div>

        <div className="auth-field">
          <label>Organization Name</label>

          <div className="auth-input-wrapper">

            <Building2 size={17} />

            <input
              type="text"
              name="organizationName"
              placeholder="Enter organization name"
              value={formData.organizationName}
              onChange={handleChange}
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
            />

          </div>
        </div>

      </div>
    );
  }


  return null;
};
  // =========================================================
  // ADDRESS FIELDS
  // =========================================================

  const renderAddressFields = () => {
    if (!formData.role) {
      return null;
    }

    return (
      <div className="auth-role-fields">
        <div className="auth-field">
          <label>Address</label>

          <div className="auth-input-wrapper">
            <MapPin size={17} />

            <input
              type="text"
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="auth-row">
          <div className="auth-field">
            <label>City</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="city"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>State</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="state"
                placeholder="Enter state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="auth-row">
          <div className="auth-field">
            <label>Country</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="country"
                placeholder="Enter country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Postal Code</label>

            <div className="auth-input-wrapper">
              <input
                type="text"
                name="postalCode"
                placeholder="Enter postal code"
                value={formData.postalCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
      </div>
    );
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
    const role = formData.role;

    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------

    if (!firstName || !lastName) {
      alert("Please enter your first name and last name.");
      return;
    }

    if (!email) {
      alert("Please enter your email.");
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

    if (!role) {
      alert("Please select your role.");
      return;
    }

    // -------------------------------------------------------
    // ADDRESS VALIDATION
    // -------------------------------------------------------

    if (
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.country.trim() ||
      !formData.postalCode.trim()
    ) {
      alert("Please complete all address fields.");
      return;
    }

    // -------------------------------------------------------
    // ROLE MAP
    // -------------------------------------------------------

    const roleMap = {
      customer: "CUSTOMER",
      business: "BUSINESS_CLIENT",
      operator: "LOGISTICS_OPERATOR",
      support: "SUPPORT_AGENT",
    };

    const backendRole = roleMap[role];

    if (!backendRole) {
      alert("Please select a valid registration role.");
      return;
    }

    // -------------------------------------------------------
    // ROLE VALIDATION
    // -------------------------------------------------------

    if (role === "business") {
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

    if (role === "operator") {
      if (
        !formData.organizationName.trim() ||
        !formData.licenseRegistrationNumber.trim() ||
        !formData.transportationMode ||
        !formData.operatingArea.trim()
      ) {
        alert("Please complete all Logistics Operator fields.");
        return;
      }
    }

    if (role === "support") {
      if (
        !formData.employeeId.trim() ||
        !formData.organizationName.trim() ||
        !formData.department.trim()
      ) {
        alert("Please complete all Support Agent fields.");
        return;
      }
    }

    // -------------------------------------------------------
    // SEND TO BACKEND
    // -------------------------------------------------------

    setIsSubmitting(true);
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",

        body: JSON.stringify({
          // Common
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          email,
          password,
          confirmPassword,
          role: backendRole,
          phoneNumber: mobile,

          // Address
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
          postalCode: formData.postalCode.trim(),

          // Business Client
          companyName: formData.companyName.trim(),
          registrationNumber:
            formData.registrationNumber.trim(),
          gstTaxId: formData.gstTaxId.trim(),
          contactPersonName:
            formData.contactPersonName.trim(),

          // Logistics Operator
          organizationName:
            formData.organizationName.trim(),
          licenseRegistrationNumber:
            formData.licenseRegistrationNumber.trim(),
          transportationMode:
            formData.transportationMode,
          operatingArea:
            formData.operatingArea.trim(),

          // Support Agent
          employeeId: formData.employeeId.trim(),
          department: formData.department.trim(),
        }),
      });

      // Remove old login session
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
          "Unable to connect to backend."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="auth-page">
      <div className="auth-background"></div>

      <div className="auth-overlay"></div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

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

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="auth-container">
        {/* ===================================================
            LEFT SIDE
        =================================================== */}

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

        {/* ===================================================
            REGISTER CARD
        =================================================== */}

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

          {/* =================================================
              FORM
          ================================================= */}

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

            {/* =================================================
                ROLE SPECIFIC FIELDS
            ================================================= */}

            {renderRoleSpecificFields()}

            {/* =================================================
                ADDRESS FIELDS
            ================================================= */}

            {renderAddressFields()}

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
              disabled={isSubmitting}
              style={isSubmitting ? { opacity: 0.7, cursor: "not-allowed" } : {}}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}

              <ArrowRight size={18} />
            </button>
          </form>

          {/* =================================================
              LOGIN
          ================================================= */}

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