import {
  ArrowRight,
  Box,
  Building2,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!formData.role) {
      alert("Please select a role.");
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
    <div className="register-page">

      <div className="register-background"></div>

      <div className="register-overlay"></div>


      {/* NAVBAR */}

      <header className="register-navbar">

        <Link to="/" className="register-brand">

          <div className="register-brand-icon">
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


        <div className="register-login-link">

          Already have an account?

          <Link to="/login">
            Sign in
          </Link>

        </div>

      </header>


      {/* MAIN */}

      <main className="register-container">

        {/* LEFT */}

        <section className="register-info">

          <div className="register-tag">
            <span></span>
            JOIN THE LOGISTICS NETWORK
          </div>


          <h1>
            Move your
            <br />
            <span>business forward.</span>
          </h1>


          <p>
            Create your ShipTrack Pro account and get
            complete visibility across your shipments,
            deliveries and logistics operations.
          </p>


          <div className="register-benefits">

            <div>

              <CheckCircle2 size={16} />

              <span>
                Real-time shipment visibility
              </span>

            </div>


            <div>

              <CheckCircle2 size={16} />

              <span>
                Role-based logistics dashboard
              </span>

            </div>


            <div>

              <CheckCircle2 size={16} />

              <span>
                Complete delivery lifecycle
              </span>

            </div>

          </div>


          {/* Mini Role Cards */}

          <div className="role-preview">

            <div>
              <UserRound size={15} />
              <span>Customer</span>
            </div>

            <div>
              <Building2 size={15} />
              <span>Business</span>
            </div>

            <div>
              <Truck size={15} />
              <span>Operator</span>
            </div>

            <div>
              <Headphones size={15} />
              <span>Support</span>
            </div>

          </div>

        </section>


        {/* FORM */}

        <section className="register-card">

          <div className="register-card-header">

            <div className="register-card-icon">
              <UserRound size={20} />
            </div>

            <div>

              <h2>Create account</h2>

              <p>
                Start managing your logistics today
              </p>

            </div>

          </div>


          <form onSubmit={handleSubmit}>

            {/* NAME */}

            <div className="register-grid">

              <div className="register-field">

                <label>First Name</label>

                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="register-field">

                <label>Last Name</label>

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


            {/* EMAIL MOBILE */}

            <div className="register-grid">

              <div className="register-field">

                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="register-field">

                <label>Mobile Number</label>

                <input
                  type="tel"
                  name="mobile"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="register-grid">

              <div className="register-field">

                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="register-field">

                <label>Confirm Password</label>

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* ROLE */}

            <div className="register-field">

              <label>Choose Your Role</label>

              <div className="register-role-wrapper">

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

            <label className="register-terms">

              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the platform terms and
                privacy policy.
              </span>

            </label>


            {/* BUTTON */}

            <button
              type="submit"
              className="register-submit"
            >

              Create Account

              <ArrowRight size={18} />

            </button>

          </form>


          <div className="register-divider">
            SECURE ROLE-BASED PLATFORM
          </div>


          <div className="register-security">

            <ShieldCheck size={15} />

            <span>
              Your account is protected with
              secure role-based access.
            </span>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Register;