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

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.role) {
      alert("Please select your role.");
      return;
    }

    const routes = {
      customer: "/dashboard/customer",
      business: "/dashboard/business",
      operator: "/dashboard/operator",
      support: "/dashboard/support",
      admin: "/dashboard/admin",
    };

    navigate(routes[formData.role]);
  };

  return (
    <div className="auth-page">

      {/* Background */}

      <div className="auth-background"></div>

      <div className="auth-overlay"></div>


      {/* Navbar */}

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


      {/* Main */}

      <main className="auth-container">

        {/* Left Information */}

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
                <strong>Live Shipment Tracking</strong>
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
                <strong>Secure Access</strong>
                <small>
                  Role-based access for every team.
                </small>
              </div>

            </div>

          </div>

        </section>


        {/* Login Card */}

        <section className="auth-card">

          <div className="auth-card-header">

            <div className="auth-card-icon">
              <LockKeyhole size={20} />
            </div>

            <div>
              <h2>Sign in</h2>

              <p>
                Access your ShipTrack Pro account
              </p>
            </div>

          </div>


          <form onSubmit={handleSubmit}>

            {/* Email */}

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


            {/* Password */}

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


            {/* Role */}

            <div className="auth-field">

              <label>Login As</label>

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


            {/* Remember */}

            <div className="auth-options">

              <label className="remember">

                <input type="checkbox" />

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


            {/* Submit */}

            <button
              type="submit"
              className="auth-submit"
            >
              Sign In

              <ArrowRight size={18} />

            </button>

          </form>


          <div className="auth-divider">
            <span>NEW TO SHIPTRACK PRO?</span>
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