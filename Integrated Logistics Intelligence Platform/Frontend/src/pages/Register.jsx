import React, { useState } from "react";
import CommonDetails from "../components/registration/CustomerDetails";
import CustomerDetails from "../components/registration/CustomerDetails";
import BusinessClientDetails from "../components/registration/BusinessClientDetails";
import "./Register.css";

function Register() {
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
  });

  function handleSubmit(e) {
    e.preventDefault();
    console.log(registerFormData);
  }

  function handleChange(e) {
    setRegisterFormData({
      ...registerFormData,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create an Account</h2>
         
        </div>
        <form onSubmit={(e) => handleSubmit(e)} className="register-form">
        <CustomerDetails
          handleChange={handleChange}
          registerFormData={registerFormData}
        />

        {registerFormData.role === "role2" && (
          <BusinessClientDetails
            handleChange={handleChange}
            registerFormData={registerFormData}
          />
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary">Register</button>
        </div>
        <p className="register-footer">
          Already a member? <a href="#" className="login-link">Login here</a>
        </p>
      </form>
    </div>
  </div>
);
}

export default Register;
