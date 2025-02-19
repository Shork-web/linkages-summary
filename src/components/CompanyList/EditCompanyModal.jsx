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
  const [dateError, setDateError] = useState('');

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

    if (name === 'moaExpirationDate') {
      try {
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          setDateError('Please enter a valid date');
          return;
        }
        setDateError('');
      } catch (error) {
        setDateError('Invalid date format');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'moaValidity' && value && formData.withExpiration) {
      try {
        const today = new Date();
        if (!isNaN(parseInt(value))) {
          const expirationDate = new Date(today);
          expirationDate.setFullYear(today.getFullYear() + parseInt(value));
          
          const formattedDate = expirationDate.toISOString().split('T')[0];
          
          setFormData(prev => ({
            ...prev,
            [name]: value,
            moaExpirationDate: formattedDate
          }));
        }
      } catch (error) {
        console.error('Error calculating expiration date:', error);
        setDateError('Error calculating expiration date');
      }
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
          <div className="form-row">
            <div className="form-group required">
              <label htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group required">
              <label htmlFor="companyType">Company Type</label>
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
          </div>

          <div className="form-group full-width address-field required">
            <label htmlFor="companyAddress">Company Address</label>
            <textarea
              id="companyAddress"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group coordinates-field">
            <div>
              <label htmlFor="companyLongitude">Longitude</label>
              <input
                id="companyLongitude"
                name="companyLongitude"
                value={formData.companyLongitude}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="companyLatitude">Latitude</label>
              <input
                id="companyLatitude"
                name="companyLatitude"
                value={formData.companyLatitude}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group required">
              <label htmlFor="moaYear">MOA Year</label>
              <input
                type="number"
                id="moaYear"
                name="moaYear"
                value={formData.moaYear}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group required status-field">
              <label htmlFor="moaStatus">Status</label>
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="moaValidity">
                Validity (years)
                <span className="helper-text"> Duration of the MOA</span>
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
              <label htmlFor="moaExpirationDate">Expiration Date</label>
              <div className="date-input-container">
                <input
                  type="date"
                  id="moaExpirationDate"
                  name="moaExpirationDate"
                  value={formData.moaExpirationDate}
                  className={`readonly-input ${dateError ? 'error' : ''}`}
                  readOnly
                  disabled={!formData.withExpiration}
                />
                {dateError && <div className="date-error-tooltip">{dateError}</div>}
              </div>
            </div>
          </div>

          <div className="form-group full-width remarks-field">
            <label htmlFor="moaRemarks">Remarks</label>
            <textarea
              id="moaRemarks"
              name="moaRemarks"
              value={formData.moaRemarks}
              onChange={handleChange}
            />
          </div>

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