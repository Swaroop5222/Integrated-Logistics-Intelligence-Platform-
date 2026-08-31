import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CommonDetails from "../../components/registration/CommonDetails";
import BusinessClientDetails from "../../components/registration/BusinessClientDetails";
import LogisticOperatorDetails from "../../components/registration/LogisticOperatorDetails";
import SupportAgentDetails from "../../components/registration/SupportAgentDetails";
import API from "../../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [registerFormData, setRegisterFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    role: "",

    companyName: "",
    registrationNumber: "",
    gstTaxId: "",
    contactPersonName: "",

    organizationName: "",
    licenseRegistrationNumber: "",
    transportationMode: "",
    operatingArea: "",

    employeeId: "",
    department: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!registerFormData.firstName?.trim()) newErrors.firstName = "First Name is required";
    if (!registerFormData.lastName?.trim()) newErrors.lastName = "Last Name is required";
    
    if (!registerFormData.email?.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(registerFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!registerFormData.mobileNumber?.trim()) newErrors.mobileNumber = "Mobile Number is required";
    
    if (!registerFormData.password) {
      newErrors.password = "Password is required";
    } else if (registerFormData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    
    if (!registerFormData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (registerFormData.password !== registerFormData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!registerFormData.address?.trim()) newErrors.address = "Address is required";
    if (!registerFormData.city?.trim()) newErrors.city = "City is required";
    if (!registerFormData.state?.trim()) newErrors.state = "State is required";
    if (!registerFormData.country?.trim()) newErrors.country = "Country is required";
    if (!registerFormData.postalCode?.trim()) newErrors.postalCode = "Postal Code is required";
    if (!registerFormData.role) newErrors.role = "Role selection is required";

    if (registerFormData.role === "BUSINESS") {
      if (!registerFormData.companyName?.trim()) newErrors.companyName = "Company Name is required";
      if (!registerFormData.registrationNumber?.trim()) newErrors.registrationNumber = "Registration Number is required";
      if (!registerFormData.gstTaxId?.trim()) newErrors.gstTaxId = "GST/Tax ID is required";
      if (!registerFormData.contactPersonName?.trim()) newErrors.contactPersonName = "Contact Person Name is required";
    } else if (registerFormData.role === "LOGISTIC_OPERATOR") {
      if (!registerFormData.organizationName?.trim()) newErrors.organizationName = "Organization Name is required";
      if (!registerFormData.licenseRegistrationNumber?.trim()) newErrors.licenseRegistrationNumber = "License/Registration Number is required";
      if (!registerFormData.transportationMode) newErrors.transportationMode = "Transportation Mode is required";
      if (!registerFormData.operatingArea?.trim()) newErrors.operatingArea = "Operating Area is required";
    } else if (registerFormData.role === "SUPPORT_AGENT") {
      if (!registerFormData.employeeId?.trim()) newErrors.employeeId = "Employee ID is required";
      if (!registerFormData.department?.trim()) newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      setSubmitError("Please fix the errors below before submitting.");
      setSuccessMessage("");
      return;
    }

    setSubmitError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const payload = {
      firstName: registerFormData.firstName,
      lastName: registerFormData.lastName,
      email: registerFormData.email,
      password: registerFormData.password,
      confirmPassword: registerFormData.confirmPassword,
      mobileNumber: registerFormData.mobileNumber,
      address: registerFormData.address,
      city: registerFormData.city,
      state: registerFormData.state,
      country: registerFormData.country,
      postalCode: registerFormData.postalCode,
      role: registerFormData.role,
    };

    if (registerFormData.role === "BUSINESS") {
      payload.companyName = registerFormData.companyName;
      payload.registrationNumber = registerFormData.registrationNumber;
      payload.gstTaxId = registerFormData.gstTaxId;
      payload.contactPersonName = registerFormData.contactPersonName;
    } else if (registerFormData.role === "LOGISTIC_OPERATOR") {
      payload.organizationName = registerFormData.organizationName;
      payload.licenseRegistrationNumber = registerFormData.licenseRegistrationNumber;
      payload.transportationMode = registerFormData.transportationMode;
      payload.operatingArea = registerFormData.operatingArea;
    } else if (registerFormData.role === "SUPPORT_AGENT") {
      payload.employeeId = registerFormData.employeeId;
      payload.department = registerFormData.department;
    }

    try {
      const response = await API.post("/api/users", payload);
      setSuccessMessage("Registration successful! Redirecting to login...");
      setIsSubmitting(false);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setIsSubmitting(false);
      let msg = err.response?.data;
      if (typeof msg === "object" && msg !== null) {
        msg = msg.error || msg.message || JSON.stringify(msg);
      }
      if (msg === "Email already registered") {
        msg = "This email is already registered. Please use another email or log in.";
      } else if (msg === "Password and Confirm Password do not match") {
        msg = "Passwords do not match.";
      } else if (msg === "Invalid registration role") {
        msg = "Please select a valid role.";
      } else if (msg === "ADMIN registration is not allowed") {
        msg = "Admin registration is not available.";
      } else if (!msg) {
        msg = "Backend registration failed.";
      }
      setSubmitError(msg);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    if (name === "role") {
      setErrors({});
      setSubmitError("");
      setSuccessMessage("");
    }

    setRegisterFormData({
      ...registerFormData,
      [name]: value,
    });
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create an Account</h2>
          <p>Please fill in the details below to register.</p>
        </div>

        {submitError && <div className="alert alert-danger">{submitError}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <CommonDetails
            handleChange={handleChange}
            registerFormData={registerFormData}
            errors={errors}
          />

          {registerFormData.role === "BUSINESS" && (
            <BusinessClientDetails
              handleChange={handleChange}
              registerFormData={registerFormData}
              errors={errors}
            />
          )}

          {registerFormData.role === "LOGISTIC_OPERATOR" && (
            <LogisticOperatorDetails
              handleChange={handleChange}
              registerFormData={registerFormData}
              errors={errors}
            />
          )}

          {registerFormData.role === "SUPPORT_AGENT" && (
            <SupportAgentDetails
              handleChange={handleChange}
              registerFormData={registerFormData}
              errors={errors}
            />
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </div>

          <p className="register-footer">
            Already a member?{" "}
            <Link to="/login" className="login-link">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
