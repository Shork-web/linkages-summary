import React, { useState } from 'react';
import '../AgreementForm/AgreementForm.css';
import './EditAgreementForm.css';

const EditAgreementForm = ({ agreement, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    name: agreement.name,
    address: agreement.address,
    signedBy: agreement.signedBy,
    designation: agreement.designation,
    
    // Agreement Details
    agreementType: agreement.agreementType,
    
    // Partner Type only
    partnerType: agreement.partnerType,
    
    // Dates
    dateSigned: agreement.dateSigned,
    validity: agreement.validity,
    dateExpired: agreement.dateExpired,
    forRenewal: agreement.forRenewal,
    
    // Additional Info
    status: agreement.status,
    description: agreement.description,
    links: agreement.links
  });

  const calculateExpiryDate = (dateSigned, validityYears) => {
    if (!dateSigned || !validityYears) return '';
    
    const date = new Date(dateSigned);
    date.setFullYear(date.getFullYear() + parseInt(validityYears));
    
    // Format date to YYYY-MM-DD
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateOrValidityChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => {
      const newState = {
        ...prevState,
        [name]: value
      };
      
      if ((name === 'dateSigned' && prevState.validity) || 
          (name === 'validity' && prevState.dateSigned)) {
        newState.dateExpired = calculateExpiryDate(
          name === 'dateSigned' ? value : prevState.dateSigned,
          name === 'validity' ? value : prevState.validity
        );
      }
      
      return newState;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <section className="form-section">
        <h3>Personal Information</h3>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="signedBy">Signed By:</label>
          <input
            type="text"
            id="signedBy"
            name="signedBy"
            value={formData.signedBy}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="designation">Designation:</label>
          <input
            type="text"
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
          />
        </div>
      </section>

      <section className="form-section">
        <h3>Agreement Type</h3>
        <div className="form-group">
          <select
            name="agreementType"
            value={formData.agreementType}
            onChange={handleChange}
            required
            className="agreement-type-select"
          >
            <option value="MOU">Memorandum of Understanding (MOU)</option>
            <option value="MOA">Memorandum of Agreement (MOA)</option>
          </select>
        </div>
      </section>

      <section className="form-section">
        <h3>Partner Information</h3>
        <div className="partner-info-container">
          <div className="form-group">
            <label htmlFor="partnerType">Partner Type:</label>
            <select
              id="partnerType"
              name="partnerType"
              value={formData.partnerType}
              onChange={handleChange}
              required
              className="partner-select"
            >
              <option value="">Select Partner Type</option>
              <option value="academe">Academe</option>
              <option value="industry">Industry</option>
              <option value="government">Government</option>
            </select>
          </div>
        </div>
      </section>

      <section className="form-section">
        <h3>Agreement Dates</h3>
        <div className="form-group">
          <label htmlFor="dateSigned">Date Signed:</label>
          <input
            type="date"
            id="dateSigned"
            name="dateSigned"
            value={formData.dateSigned}
            onChange={handleDateOrValidityChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="validity">
            Validity (in years):
            <span className="validity-helper">Duration of the agreement</span>
          </label>
          <input
            type="number"
            id="validity"
            name="validity"
            value={formData.validity}
            onChange={handleDateOrValidityChange}
            min="1"
            max="10"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="dateExpired">Expiry Date:</label>
          <input
            type="date"
            id="dateExpired"
            name="dateExpired"
            value={formData.dateExpired}
            readOnly
            className="readonly-input"
          />
        </div>
        <div className="renewal-checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              id="forRenewal"
              name="forRenewal"
              checked={formData.forRenewal}
              onChange={handleChange}
            />
            <span>Mark this agreement for renewal</span>
          </label>
        </div>
      </section>

      <section className="form-section">
        <h3>Additional Information</h3>
        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
            <option value="renewed">Renewed</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="links">Links:</label>
          <input
            type="url"
            id="links"
            name="links"
            value={formData.links}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>
      </section>

      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="save-btn">
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditAgreementForm;