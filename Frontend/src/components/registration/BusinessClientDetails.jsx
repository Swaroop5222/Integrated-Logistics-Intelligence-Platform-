function BusinessClientDetails({ handleChange, registerFormData }) {
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
            onChange={(e) => handleChange(e)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gstNumber">GST Number</label>
          <input
            id="gstNumber"
            type="text"
            name="gstNumber"
            placeholder="GST Number"
            value={registerFormData.gstNumber || ""}
            onChange={(e) => handleChange(e)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="businessType">Business Type</label>
          <input
            id="businessType"
            type="text"
            name="businessType"
            placeholder="Business Type"
            value={registerFormData.businessType || ""}
            onChange={(e) => handleChange(e)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="industry">Industry</label>
          <input
            id="industry"
            type="text"
            name="industry"
            placeholder="Industry"
            value={registerFormData.industry || ""}
            onChange={(e) => handleChange(e)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            name="website"
            placeholder="Website"
            value={registerFormData.website || ""}
            onChange={(e) => handleChange(e)}
          />
        </div>
      </div>
    </div>
  );
}

export default BusinessClientDetails;