import React, { useState } from 'react';
import './AgreementForm.css';

const calculateExpiryDate = (dateString, validityMonths) => {
  if (!dateString || !validityMonths) return '';
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + parseInt(validityMonths));
  return date.toISOString().split('T')[0];
};

const AgreementForm = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    address: '',
    signedBy: '',
    designation: '',
    
    // Agreement Details
    agreementType: 'MOU', // Default value
    
    // Updated Partners structure
    partnerType: '', // New field for partner type
    partnerName: '', // New field for partner name
    partners: {      // Object to store partners by type
      industry: [],
      academe: [],
      localGov: []
    },
    
    // Dates
    dateSigned: '',
    validity: '',
    dateExpired: '',
    forRenewal: false,
    
    // Additional Info
    status: '',
    description: '',
    links: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add automatic expiry date calculation
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

  // Add new partner
  const handleAddPartner = (e) => {
    e.preventDefault();
    if (formData.partnerType && formData.partnerName) {
      setFormData(prevState => ({
        ...prevState,
        partners: {
          ...prevState.partners,
          [formData.partnerType]: [...prevState.partners[formData.partnerType], formData.partnerName]
        },
        partnerType: '', // Reset selection
        partnerName: ''  // Reset input
      }));
    }
  };

  // Remove partner
  const handleRemovePartner = (type, index) => {
    setFormData(prevState => ({
      ...prevState,
      partners: {
        ...prevState.partners,
        [type]: prevState.partners[type].filter((_, i) => i !== index)
      }
    }));
  };

  // Modify handleSubmit to include form validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if there are any partners added
    if (Object.values(formData.partners).every(arr => arr.length === 0)) {
      alert('Please add at least one partner before submitting.');
      return;
    }

    console.log('Form Data:', formData);
    // Add your form submission logic here
  };

  return (
    <div className="agreement-form-container">
      <div className="form-header">
        <h2>Linkages Partnership Agreement Form</h2>
        <p className="form-subtitle">Enter agreement details below</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information Section - Keep existing code but add tooltips */}
        <section className="form-section">
          <div className="section-header">
            <h3>Personal Information</h3>
            <span className="section-indicator">1/5</span>
          </div>
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

        {/* Agreement Type Section - Add icon */}
        <section className="form-section">
          <div className="section-header">
            <h3>Agreement Type</h3>
            <span className="section-indicator">2/5</span>
          </div>
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

        {/* Partners Section - Update with counter */}
        <section className="form-section">
          <div className="section-header">
            <h3>Partners</h3>
            <span className="section-indicator">3/5</span>
          </div>
          <div className="partner-input-group">
            <div className="form-group">
              <label htmlFor="partnerType">Partner Type:</label>
              <select
                id="partnerType"
                name="partnerType"
                value={formData.partnerType}
                onChange={handleChange}
                required
              >
                <option value="">Select Partner Type</option>
                <option value="industry">Industry</option>
                <option value="academe">Academe</option>
                <option value="localGov">Local Government</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="partnerName">Partner Name:</label>
              <div className="partner-add-group">
                <input
                  type="text"
                  id="partnerName"
                  name="partnerName"
                  value={formData.partnerName}
                  onChange={handleChange}
                  placeholder="Enter partner name"
                />
                <button 
                  type="button" 
                  onClick={handleAddPartner}
                  className="add-partner-btn"
                  disabled={!formData.partnerType || !formData.partnerName}
                >
                  Add Partner
                </button>
              </div>
            </div>
          </div>

          <div className="partners-summary">
            <h4>Partners Summary</h4>
            <div className="partners-count">
              <span>Industry: {formData.partners.industry.length}</span>
              <span>Academe: {formData.partners.academe.length}</span>
              <span>Local Gov't: {formData.partners.localGov.length}</span>
            </div>
          </div>

          <div className="partners-lists">
            {Object.entries(formData.partners).map(([type, partners]) => (
              partners.length > 0 && (
                <div key={type} className="partner-list">
                  <h4>{type.charAt(0).toUpperCase() + type.slice(1)} Partners</h4>
                  <ul>
                    {partners.map((partner, index) => (
                      <li key={index}>
                        {partner}
                        <button
                          type="button"
                          onClick={() => handleRemovePartner(type, index)}
                          className="remove-partner-btn"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>
        </section>

        {/* Dates Section - Add automatic expiry calculation */}
        <section className="form-section">
          <div className="section-header">
            <h3>Agreement Dates</h3>
            <span className="section-indicator">4/5</span>
          </div>
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
              Validity (in months):
              <span className="validity-helper">Duration of the agreement</span>
            </label>
            <input
              type="number"
              id="validity"
              name="validity"
              value={formData.validity}
              onChange={handleDateOrValidityChange}
              min="1"
              max="120"
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
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="forRenewal"
              name="forRenewal"
              checked={formData.forRenewal}
              onChange={handleChange}
            />
            <label htmlFor="forRenewal">Mark for Renewal</label>
          </div>
        </section>

        {/* Additional Information Section */}
        <section className="form-section">
          <div className="section-header">
            <h3>Additional Information</h3>
            <span className="section-indicator">5/5</span>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
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
          <button type="button" className="reset-button" onClick={() => window.location.reload()}>
            Reset Form
          </button>
          <button type="submit" className="submit-button">
            Submit Agreement
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgreementForm; 