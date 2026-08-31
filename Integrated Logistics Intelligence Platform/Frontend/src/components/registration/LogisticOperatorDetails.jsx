import React from "react";

function LogisticOperatorDetails({ handleChange, registerFormData, errors }) {
  return (
    <div className="role-details-section">
      <h3 className="section-title">Logistics Operator Information</h3>
      <div className="form-grid">
        <div className="form-group span-2">
          <label htmlFor="organizationName">Organization Name</label>
          <input
            id="organizationName"
            type="text"
            name="organizationName"
            placeholder="Organization Name"
            value={registerFormData.organizationName || ""}
            onChange={handleChange}
            className={errors?.organizationName ? "error-input" : ""}
          />
          {errors?.organizationName && <span className="error-text">{errors.organizationName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="licenseRegistrationNumber">License/Registration Number</label>
          <input
            id="licenseRegistrationNumber"
            type="text"
            name="licenseRegistrationNumber"
            placeholder="License/Registration Number"
            value={registerFormData.licenseRegistrationNumber || ""}
            onChange={handleChange}
            className={errors?.licenseRegistrationNumber ? "error-input" : ""}
          />
          {errors?.licenseRegistrationNumber && (
            <span className="error-text">{errors.licenseRegistrationNumber}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="transportationMode">Transportation Mode</label>
          <select
            id="transportationMode"
            name="transportationMode"
            value={registerFormData.transportationMode || ""}
            onChange={handleChange}
            className={errors?.transportationMode ? "error-input" : ""}
          >
            <option value="">Select Mode</option>
            <option value="Road">Road</option>
            <option value="Air">Air</option>
            <option value="Sea">Sea</option>
            <option value="Rail">Rail</option>
            <option value="Multi-modal">Multi-modal</option>
          </select>
          {errors?.transportationMode && <span className="error-text">{errors.transportationMode}</span>}
        </div>

        <div className="form-group span-2">
          <label htmlFor="operatingArea">Operating Area</label>
          <input
            id="operatingArea"
            type="text"
            name="operatingArea"
            placeholder="Operating Area"
            value={registerFormData.operatingArea || ""}
            onChange={handleChange}
            className={errors?.operatingArea ? "error-input" : ""}
          />
          {errors?.operatingArea && <span className="error-text">{errors.operatingArea}</span>}
        </div>
      </div>
    </div>
  );
}

export default LogisticOperatorDetails;
