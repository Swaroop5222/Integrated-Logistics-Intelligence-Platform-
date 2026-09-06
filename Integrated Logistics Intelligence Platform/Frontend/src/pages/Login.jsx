import {
  ArrowRight,
  Box,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Login.css";
import { apiRequest } from "../api";


function Login() {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
  // LOGIN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const selectedRole = formData.role;

    if (!selectedRole) {
      alert("Please select your role.");
      return;
    }

    const roleMap = {
      customer: "CUSTOMER",
      business: "BUSINESS_CLIENT",
      operator: "LOGISTICS_OPERATOR",
      support: "SUPPORT_AGENT",
      admin: "ADMINISTRATOR",
    };

    const backendRole = roleMap[selectedRole];

    setIsSubmitting(true);
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (data.role !== backendRole) {
        alert(`This account belongs to ${data.role}, not ${backendRole}.`);
        return;
      }

      localStorage.setItem("shiptrackToken", data.token);

      localStorage.setItem(
        "shiptrackUser",
        JSON.stringify({
          id: data.id || data.userId,
          email: data.email,
          role: data.role,
        })
      );

      const routes = {
        CUSTOMER: "/dashboard/customer",
        BUSINESS_CLIENT: "/dashboard/business",
        LOGISTICS_OPERATOR: "/dashboard/operator",
        SUPPORT_AGENT: "/dashboard/support",
        ADMINISTRATOR: "/dashboard/admin",
      };

      navigate(routes[data.role] || "/");
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Unable to connect to backend.");
    } finally {
      setIsSubmitting(false);
    }
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

            LOGISTICS CONTROL CENTER

          </div>


          <h1>

            Welcome

            <br />

            <span>back.</span>

          </h1>


          <p>

            Sign in to manage shipments, track deliveries
            and stay connected with your logistics operations.

          </p>


          <div className="auth-features">


            <div className="auth-feature">

              <div className="auth-feature-icon orange">

                <Truck size={17} />

              </div>


              <div>

                <strong>
                  Live Shipment Tracking
                </strong>

                <small>
                  Follow every shipment in real time.
                </small>

              </div>

            </div>


            <div className="auth-feature">

              <div className="auth-feature-icon purple">

                <ShieldCheck size={17} />

              </div>


              <div>

                <strong>
                  Secure Access
                </strong>

                <small>
                  Role-based access for every team.
                </small>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            LOGIN CARD
        =================================================== */}

        <section className="auth-card">


          <div className="auth-card-header">

            <div className="auth-card-icon">

              <LockKeyhole size={20} />

            </div>


            <div>

              <h2>
                Sign in
              </h2>

              <p>
                Access your ShipTrack Pro account
              </p>

            </div>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>


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
                  placeholder="Enter your password"
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


            {/* ROLE */}

            <div className="auth-field">

              <label>
                Login As
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


            {/* OPTIONS */}

            <div className="auth-options">

              <label className="remember">

                <input
                  type="checkbox"
                />

                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
              style={isSubmitting ? { opacity: 0.7, cursor: "not-allowed" } : {}}
            >

              {isSubmitting ? "Signing In..." : "Sign In"}

              <ArrowRight size={18} />

            </button>

          </form>


          {/* =================================================
              REGISTER
          ================================================= */}

          <div className="auth-divider">

            <span>
              NEW TO SHIPTRACK PRO?
            </span>

          </div>


          <p className="auth-switch">

            Don't have an account?

            <Link to="/register">
              Create account
            </Link>

          </p>

        </section>

      </main>

    </div>

  );

}


export default Login;