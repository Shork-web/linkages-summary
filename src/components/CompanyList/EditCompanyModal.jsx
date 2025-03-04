import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import './EditCompanyModal.css';

const EditCompanyModal = ({ company, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyLongitude: '',
    companyLatitude: '',
    moaYear: '',
    moaStatus: '',
    withExpiration: false,
    moaValidity: '',
    moaExpirationDate: '',
    moaRemarks: '',
    validityUnit: 'years',
    collegeEntries: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyTypes = [
    'N/A',
    'SALES/MARKETING',
    'BPO',
    'INSURANCE',
    'ENGINEERING SERVICES',
    'SOCIALWORK/FOUNDATION',
    'BEHAVIORAL ASSESSMENT CENTER',
    'AUTOMOTIVE',
    'MANUFACTURING',
    'SCHOOL',
    'HOSPITAL',
    'CONSTRUCTION',
    'AIRLINES',
    'HOTELS',
    'TRAVEL AGENCY',
    'IT/COMPUTER/SOFTWARE',
    'GOV\'T/LGU',
    'CONSULTANCY',
    'BOOKKEEPING',
    'SHIPPING LINES/TRANSPORT',
    'BANK'
  ];

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        companyAddress: company.companyAddress || '',
        companyLongitude: company.companyLongitude || '',
        companyLatitude: company.companyLatitude || '',
        moaYear: company.moaYear || '',
        moaStatus: company.moaStatus || '',
        withExpiration: company.withExpiration || false,
        moaValidity: company.moaValidity || '',
        moaExpirationDate: company.moaExpirationDate || '',
        moaRemarks: company.moaRemarks || '',
        validityUnit: company.validityUnit || 'years',
        collegeEntries: company.collegeEntries && company.collegeEntries.length > 0 
          ? company.collegeEntries 
          : [{ college: '', department: '', status: 'Active', companyType: '' }]
      });
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'withExpiration') {
        setFormData(prev => ({
          ...prev,
          withExpiration: checked
        }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyTypeChange = (index, e) => {
    const value = e.target.value;
    
    setFormData(prev => {
      const updatedEntries = [...prev.collegeEntries];
      updatedEntries[index] = { 
        ...updatedEntries[index], 
        companyType: value 
      };
      return { ...prev, collegeEntries: updatedEntries };
    });
  };

  const handleAddCompanyType = () => {
    setFormData(prev => ({
      ...prev,
      collegeEntries: [...prev.collegeEntries, { college: '', department: '', status: 'Active', companyType: '' }]
    }));
  };

  const handleRemoveCompanyType = (index) => {
    if (formData.collegeEntries.length <= 1) return;
    
    setFormData(prev => ({
      ...prev,
      collegeEntries: prev.collegeEntries.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedEntries = formData.collegeEntries.map(entry => ({
        ...entry,
        companyType: entry.companyType || 'N/A',
        status: entry.status || 'Active'
      }));

      const companyRef = doc(db, 'companyMOA', company.id);
      await updateDoc(companyRef, {
        ...formData,
        collegeEntries: validatedEntries,
        validityUnit: formData.validityUnit,
        updatedAt: new Date().toISOString()
      });

      onUpdate('Company details updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating document: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="edit-company-modal">
        <div className="modal-header">
          <h2>Edit Company</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-company-form">
          {/* Company Basic Information Section */}
          <div className="form-row">
            <div className="form-group required">
              <label htmlFor="companyName">
                <i className="fas fa-building"></i> Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                required
              />
            </div>
          </div>

          <div className="form-group full-width address-field required">
            <label htmlFor="companyAddress">
              <i className="fas fa-map-marker-alt"></i> Company Address
            </label>
            <textarea
              id="companyAddress"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              placeholder="Enter complete company address"
              required
            />
          </div>

          {/* Location Coordinates Section */}
          <div className="form-group coordinates-field">
            <div>
              <label htmlFor="companyLongitude">
                <i className="fas fa-location-arrow"></i> Longitude
              </label>
              <input
                id="companyLongitude"
                name="companyLongitude"
                value={formData.companyLongitude}
                onChange={handleChange}
                placeholder="e.g. 123.456789"
              />
            </div>
            <div>
              <label htmlFor="companyLatitude">
                <i className="fas fa-location-arrow"></i> Latitude
              </label>
              <input
                id="companyLatitude"
                name="companyLatitude"
                value={formData.companyLatitude}
                onChange={handleChange}
                placeholder="e.g. 12.345678"
              />
            </div>
          </div>

          {/* MOA Details Section */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="moaYear">
                <i className="fas fa-calendar-alt"></i> MOA Year
              </label>
              <input
                type="number"
                id="moaYear"
                name="moaYear"
                value={formData.moaYear}
                onChange={handleChange}
                placeholder="e.g. 2023"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="moaStatus">
                <i className="fas fa-info-circle"></i> MOA Status
              </label>
              <select
                id="moaStatus"
                name="moaStatus"
                value={formData.moaStatus}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="For-Update">For Update</option>
                <option value="Expired">Expired</option>
                <option value="On process">On process</option>
              </select>
            </div>
          </div>

          {/* UPDATED: Company Types Section without status */}
          <div className="company-types-section">
            <div className="section-header">
              <h3><i className="fas fa-tags"></i> Company Types</h3>
              <button 
                type="button" 
                className="add-type-btn"
                onClick={handleAddCompanyType}
              >
                <i className="fas fa-plus"></i> Add Type
              </button>
            </div>
            
            <div className="company-types-container">
              {formData.collegeEntries.map((entry, index) => (
                <div key={index} className="company-type-entry">
                  <div className="entry-header">
                    <span className="entry-number">Type #{index + 1}</span>
                    {formData.collegeEntries.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-type-btn"
                        onClick={() => handleRemoveCompanyType(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                  
                  {/* Simplified type-fields without the status field */}
                  <div className="type-field">
                    <label htmlFor={`companyType-${index}`}>Company Type:</label>
                    <select
                      id={`companyType-${index}`}
                      value={entry.companyType || ''}
                      onChange={(e) => handleCompanyTypeChange(index, e)}
                      required
                    >
                      <option value="">Select Type</option>
                      {companyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validity and Expiration Date Section */}
          <div className="expiration-fields-container">
            <div className="expiration-field">
              <label htmlFor="moaValidity">
                <i className="fas fa-hourglass-half"></i> Validity Period
              </label>
              <div className="validity-input-container">
                <input
                  type="number"
                  id="moaValidity"
                  name="moaValidity"
                  value={formData.moaValidity}
                  onChange={handleChange}
                  min="1"
                  placeholder="Duration"
                  className="duration-input"
                />
                <select
                  id="validityUnit"
                  name="validityUnit"
                  value={formData.validityUnit || 'years'}
                  onChange={handleChange}
                  className="unit-select"
                >
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>

            <div className="expiration-field">
              <label htmlFor="moaExpirationDate">
                <i className="fas fa-calendar"></i> Expiration Date
              </label>
              <input
                type="date"
                id="moaExpirationDate"
                name="moaExpirationDate"
                value={formData.moaExpirationDate}
                onChange={handleChange}
                className="date-input"
                placeholder="mm/dd/yyyy"
              />
            </div>
          </div>

          {/* Expiration Section */}
          <div className="expiration-section">
            <div className="expiration-checkbox">
              <input
                type="checkbox"
                id="withExpiration"
                name="withExpiration"
                checked={formData.withExpiration}
                onChange={handleChange}
              />
              <label htmlFor="withExpiration">
                <i className="fas fa-clock"></i>
                With Expiration
              </label>
            </div>
            <div className="expiration-description">
              Check this if the MOA has an expiration date
            </div>
          </div>

          {/* Remarks Section */}
          <div className="form-group full-width remarks-field">
            <label htmlFor="moaRemarks">
              <i className="fas fa-comment-alt"></i> Remarks
            </label>
            <textarea
              id="moaRemarks"
              name="moaRemarks"
              value={formData.moaRemarks}
              onChange={handleChange}
              placeholder="Additional notes or comments about this company"
            />
          </div>

          {/* Form Actions */}
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              <i className="fas fa-times"></i> Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyModal; 