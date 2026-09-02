import React from "react";

function SupportAgentDetails({ handleChange, registerFormData, errors }) {
  return (
    <div className="role-details-section">
      <h3 className="section-title">Support Agent Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="employeeId">Employee ID</label>
          <input
            id="employeeId"
            type="text"
            name="employeeId"
            placeholder="Employee ID"
            value={registerFormData.employeeId || ""}
            onChange={handleChange}
            className={errors?.employeeId ? "error-input" : ""}
          />
          {errors?.employeeId && <span className="error-text">{errors.employeeId}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="department">Department</label>
          <input
            id="department"
            type="text"
            name="department"
            placeholder="Department"
            value={registerFormData.department || ""}
            onChange={handleChange}
            className={errors?.department ? "error-input" : ""}
          />
          {errors?.department && <span className="error-text">{errors.department}</span>}
        </div>
      </div>
    </div>
  );
}

export default SupportAgentDetails;
