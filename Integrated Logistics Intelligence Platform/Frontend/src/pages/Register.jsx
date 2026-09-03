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
  // REGISTER
  // =========================================================

  const handleSubmit = (e) => {

    e.preventDefault();


    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();
    const mobile = formData.mobile.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    const role = formData.role;


    // -----------------------------
    // Validate names
    // -----------------------------

    if (!firstName || !lastName) {

      alert("Please enter your first name and last name.");

      return;
    }


    // -----------------------------
    // Validate password
    // -----------------------------

    if (password.length < 6) {

      alert("Password must contain at least 6 characters.");

      return;
    }


    // -----------------------------
    // Confirm password
    // -----------------------------

    if (password !== confirmPassword) {

      alert("Passwords do not match.");

      return;
    }


    // -----------------------------
    // Validate role
    // -----------------------------

    if (!role) {

      alert("Please select your role.");

      return;
    }


    // -----------------------------
    // Get registered users
    // -----------------------------

    let registeredUsers = [];

    try {

      registeredUsers = JSON.parse(
        localStorage.getItem("shiptrackUsers") || "[]"
      );

      if (!Array.isArray(registeredUsers)) {
        registeredUsers = [];
      }

    } catch (error) {

      console.error(
        "Unable to read registered users:",
        error
      );

      registeredUsers = [];
    }


    // -----------------------------
    // Check duplicate email
    // -----------------------------

    const existingUser = registeredUsers.find(
      (user) =>
        user.email?.toLowerCase() === email
    );


    if (existingUser) {

      alert(
        "An account with this email already exists. Please login."
      );

      navigate("/login");

      return;
    }


    // =========================================================
    // CREATE USER
    // =========================================================

    const newUser = {

      id: Date.now().toString(),

      firstName,

      lastName,

      name: `${firstName} ${lastName}`,

      email,

      mobile,

      password,

      role,

    };


    // -----------------------------
    // Save registered user
    // -----------------------------

    const updatedUsers = [
      ...registeredUsers,
      newUser,
    ];


    localStorage.setItem(
      "shiptrackUsers",
      JSON.stringify(updatedUsers)
    );


    // =========================================================
    // IMPORTANT
    //
    // Registration does NOT mean login.
    //
    // Remove any old logged-in user.
    // =========================================================

    localStorage.removeItem("shiptrackUser");


    // -----------------------------
    // Success
    // -----------------------------

    alert(
      "Registration successful! Please login to continue."
    );


    // -----------------------------
    // Go ONLY to login
    // -----------------------------

    navigate("/login");

  };


  return (

    <div className="auth-page">

      <div className="auth-background"></div>

      <div className="auth-overlay"></div>


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="auth-navbar">

        <Link
          to="/"
          className="auth-brand"
        >

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


        <Link
          to="/"
          className="back-home"
        >
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

              <h2>
                Create account
              </h2>

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

                <label>
                  First Name
                </label>

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

                <label>
                  Last Name
                </label>

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

              <label>
                Email Address
              </label>

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

              <label>
                Mobile Number
              </label>

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

              <label>
                Password
              </label>

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

              <label>
                Confirm Password
              </label>

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

              <label>
                Register As
              </label>

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

                  <option value="admin">
                    Administrator
                  </option>

                </select>

              </div>

            </div>


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