function CommonDetails({ handleChange, registerFormData }) {
  return (
    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          placeholder="First Name"
          value={registerFormData.firstName}
          onChange={(e) => handleChange(e)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={registerFormData.lastName}
          onChange={(e) => handleChange(e)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          value={registerFormData.email}
          onChange={(e) => handleChange(e)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="mobileNumber">Mobile Number</label>
        <input
          id="mobileNumber"
          type="text"
          name="mobileNumber"
          placeholder="Mobile Number"
          value={registerFormData.mobileNumber}
          onChange={(e) => handleChange(e)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Password"
          value={registerFormData.password}
          onChange={(e) => handleChange(e)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={registerFormData.confirmPassword}
          onChange={(e) => handleChange(e)}
        />
      </div>

      <div className="form-group span-2">
        <label htmlFor="address">Address</label>
        <input
          id="address"
          type="text"
          name="address"
          placeholder="Address"
          value={registerFormData.address}
          onChange={(e) => handleChange(e)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="city">City</label>
        <input
          id="city"
          type="text"
          name="city"
          placeholder="City"
          value={registerFormData.city}
          onChange={(e) => handleChange(e)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="state">State</label>
        <input
          id="state"
          type="text"
          name="state"
          placeholder="State"
          value={registerFormData.state}
          onChange={(e) => handleChange(e)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="country">Country</label>
        <input
          id="country"
          type="text"
          name="country"
          placeholder="Country"
          value={registerFormData.country}
          onChange={(e) => handleChange(e)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="postalCode">Postal Code</label>
        <input
          id="postalCode"
          type="text"
          name="postalCode"
          placeholder="Postal Code"
          value={registerFormData.postalCode}
          onChange={(e) => handleChange(e)}
        />
      </div>

      <div className="form-group span-2">
        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={registerFormData.role}
          onChange={(e) => handleChange(e)}
        >
          <option value="">Select Role</option>
          <option value="role1">Customer</option>
          <option value="role2">Business client</option>
          <option value="role3">Logistics operator</option>
          <option value="role4">Support Agent</option>
        </select>
      </div>
    </div>
  );
}

export default CommonDetails;
