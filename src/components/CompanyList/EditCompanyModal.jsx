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
    companyType: '',
    withExpiration: false,
    moaValidity: '',
    moaExpirationDate: '',
    moaRemarks: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyTypes = [
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
      setFormData(company);
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'withExpiration') {
        setFormData(prev => ({
          ...prev,
          withExpiration: checked,
          moaValidity: checked ? prev.moaValidity : '',
          moaExpirationDate: checked ? prev.moaExpirationDate : ''
        }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'moaValidity' && value && formData.withExpiration) {
      const today = new Date();
      const expirationDate = new Date(today.setFullYear(today.getFullYear() + parseInt(value)));
      setFormData(prev => ({
        ...prev,
        moaExpirationDate: expirationDate.toISOString().split('T')[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const companyRef = doc(db, 'companyMOA', company.id);
      await updateDoc(companyRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });

      onUpdate('Company updated successfully');
      onClose();
    } catch (error) {
      onUpdate('Error updating company: ' + error.message, 'error');
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
          <div className="form-group">
            <label htmlFor="companyName">Company Name: <span className="required">*</span></label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyAddress">Company Address: <span className="required">*</span></label>
            <textarea
              id="companyAddress"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="companyLongitude">Longitude:</label>
              <input
                type="text"
                id="companyLongitude"
                name="companyLongitude"
                value={formData.companyLongitude}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyLatitude">Latitude:</label>
              <input
                type="text"
                id="companyLatitude"
                name="companyLatitude"
                value={formData.companyLatitude}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="moaYear">Year:</label>
              <input
                type="number"
                id="moaYear"
                name="moaYear"
                value={formData.moaYear}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="moaStatus">Status:</label>
              <select
                id="moaStatus"
                name="moaStatus"
                value={formData.moaStatus}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="For-Update">For Update</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="companyType">Company Type: <span className="required">*</span></label>
            <select
              id="companyType"
              name="companyType"
              value={formData.companyType}
              onChange={handleChange}
              required
            >
              <option value="">Select Company Type</option>
              {companyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="expiration-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="withExpiration"
                checked={formData.withExpiration}
                onChange={handleChange}
              />
              <span>With Expiration</span>
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="moaValidity">
                Validity (years):
                <span className="helper-text">Duration of the MOA</span>
              </label>
              <input
                type="number"
                id="moaValidity"
                name="moaValidity"
                value={formData.moaValidity}
                onChange={handleChange}
                min="1"
                required={formData.withExpiration}
                disabled={!formData.withExpiration}
              />
            </div>

            <div className="form-group">
              <label htmlFor="moaExpirationDate">Expiration Date:</label>
              <input
                type="date"
                id="moaExpirationDate"
                name="moaExpirationDate"
                value={formData.moaExpirationDate}
                readOnly
                className="readonly-input"
                disabled={!formData.withExpiration}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="moaRemarks">Remarks:</label>
            <textarea
              id="moaRemarks"
              name="moaRemarks"
              value={formData.moaRemarks}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyModal; 