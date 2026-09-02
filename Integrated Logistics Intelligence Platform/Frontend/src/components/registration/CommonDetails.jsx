import React from "react";

function CommonDetails({ handleChange, registerFormData, errors }) {
  return (
    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          placeholder="First Name"
          value={registerFormData.firstName || ""}
          onChange={handleChange}
          className={errors?.firstName ? "error-input" : ""}
        />
        {errors?.firstName && <span className="error-text">{errors.firstName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={registerFormData.lastName || ""}
          onChange={handleChange}
          className={errors?.lastName ? "error-input" : ""}
        />
        {errors?.lastName && <span className="error-text">{errors.lastName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          value={registerFormData.email || ""}
          onChange={handleChange}
          className={errors?.email ? "error-input" : ""}
        />
        {errors?.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="mobileNumber">Mobile Number</label>
        <input
          id="mobileNumber"
          type="text"
          name="mobileNumber"
          placeholder="Mobile Number"
          value={registerFormData.mobileNumber || ""}
          onChange={handleChange}
          className={errors?.mobileNumber ? "error-input" : ""}
        />
        {errors?.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Password"
          value={registerFormData.password || ""}
          onChange={handleChange}
          className={errors?.password ? "error-input" : ""}
        />
        {errors?.password && <span className="error-text">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={registerFormData.confirmPassword || ""}
          onChange={handleChange}
          className={errors?.confirmPassword ? "error-input" : ""}
        />
        {errors?.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
      </div>

      <div className="form-group span-2">
        <label htmlFor="address">Address</label>
        <input
          id="address"
          type="text"
          name="address"
          placeholder="Address"
          value={registerFormData.address || ""}
          onChange={handleChange}
          className={errors?.address ? "error-input" : ""}
        />
        {errors?.address && <span className="error-text">{errors.address}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="city">City</label>
        <input
          id="city"
          type="text"
          name="city"
          placeholder="City"
          value={registerFormData.city || ""}
          onChange={handleChange}
          className={errors?.city ? "error-input" : ""}
        />
        {errors?.city && <span className="error-text">{errors.city}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="state">State</label>
        <input
          id="state"
          type="text"
          name="state"
          placeholder="State"
          value={registerFormData.state || ""}
          onChange={handleChange}
          className={errors?.state ? "error-input" : ""}
        />
        {errors?.state && <span className="error-text">{errors.state}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="country">Country</label>
        <input
          id="country"
          type="text"
          name="country"
          placeholder="Country"
          value={registerFormData.country || ""}
          onChange={handleChange}
          className={errors?.country ? "error-input" : ""}
        />
        {errors?.country && <span className="error-text">{errors.country}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="postalCode">Postal Code</label>
        <input
          id="postalCode"
          type="text"
          name="postalCode"
          placeholder="Postal Code"
          value={registerFormData.postalCode || ""}
          onChange={handleChange}
          className={errors?.postalCode ? "error-input" : ""}
        />
        {errors?.postalCode && <span className="error-text">{errors.postalCode}</span>}
      </div>

      <div className="form-group span-2">
        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={registerFormData.role || ""}
          onChange={handleChange}
          className={errors?.role ? "error-input" : ""}
        >
          <option value="">Select Role</option>
          <option value="CUSTOMER">Customer</option>
          <option value="BUSINESS">Business Client</option>
          <option value="LOGISTIC_OPERATOR">Logistics Operator</option>
          <option value="SUPPORT_AGENT">Support Agent</option>
        </select>
        {errors?.role && <span className="error-text">{errors.role}</span>}
      </div>
    </div>
  );
}

export default CommonDetails;
