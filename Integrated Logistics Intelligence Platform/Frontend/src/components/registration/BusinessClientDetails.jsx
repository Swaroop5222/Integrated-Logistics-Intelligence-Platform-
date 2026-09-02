import React from "react";

function BusinessClientDetails({ handleChange, registerFormData, errors }) {
  return (
    <div className="role-details-section">
      <h3 className="section-title">Business Client Information</h3>
      <div className="form-grid">
        <div className="form-group span-2">
          <label htmlFor="companyName">Company/Business Name</label>
          <input
            id="companyName"
            type="text"
            name="companyName"
            placeholder="Company/Business Name"
            value={registerFormData.companyName || ""}
            onChange={handleChange}
            className={errors?.companyName ? "error-input" : ""}
          />
          {errors?.companyName && <span className="error-text">{errors.companyName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="registrationNumber">Registration Number</label>
          <input
            id="registrationNumber"
            type="text"
            name="registrationNumber"
            placeholder="Registration Number"
            value={registerFormData.registrationNumber || ""}
            onChange={handleChange}
            className={errors?.registrationNumber ? "error-input" : ""}
          />
          {errors?.registrationNumber && <span className="error-text">{errors.registrationNumber}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="gstTaxId">GST/Tax ID</label>
          <input
            id="gstTaxId"
            type="text"
            name="gstTaxId"
            placeholder="GST/Tax ID"
            value={registerFormData.gstTaxId || ""}
            onChange={handleChange}
            className={errors?.gstTaxId ? "error-input" : ""}
          />
          {errors?.gstTaxId && <span className="error-text">{errors.gstTaxId}</span>}
        </div>

        <div className="form-group span-2">
          <label htmlFor="contactPersonName">Contact Person Name</label>
          <input
            id="contactPersonName"
            type="text"
            name="contactPersonName"
            placeholder="Contact Person Name"
            value={registerFormData.contactPersonName || ""}
            onChange={handleChange}
            className={errors?.contactPersonName ? "error-input" : ""}
          />
          {errors?.contactPersonName && <span className="error-text">{errors.contactPersonName}</span>}
        </div>
      </div>
    </div>
  );
}

export default BusinessClientDetails;