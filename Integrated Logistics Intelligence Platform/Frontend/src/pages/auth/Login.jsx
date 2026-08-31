import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await API.post("/auth/login", {
        username: email,
        password,
      });
      const token = response.data?.token;
      const role = response.data?.role;
      if (token) {
        localStorage.setItem("token", token);
        if (role) {
          localStorage.setItem("role", role);
        }
        setSuccess("Login successful!");
        setIsSubmitting(false);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setError("Token was not returned by the server.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setIsSubmitting(false);
      let errMsg = err.response?.data?.error || err.response?.data || "Invalid credentials.";
      if (typeof errMsg === "object" && errMsg !== null) {
        errMsg = errMsg.error || errMsg.message || JSON.stringify(errMsg);
      }
      if (errMsg === "Invalid username or password") {
        errMsg = "Invalid email or password.";
      }
      setError(errMsg);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Login</h2>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </div>

          <p className="login-footer">
            Not a member?{" "}
            <Link to="/register" className="register-link">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
