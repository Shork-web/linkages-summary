import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import Notification from '../Notification/Notification';
import './CompanyMOAForm.css';

const CompanyMOAForm = () => {
  console.log('CompanyMOAForm component rendering');

  useEffect(() => {
    console.log('CompanyMOAForm mounted');
    return () => console.log('CompanyMOAForm unmounted');
  }, []);

  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyLongitude: '',
    companyLatitude: '',
    moaYear: new Date().getFullYear().toString(),
    moaStatus: 'Active',
    companyType: '',
    withExpiration: false,
    moaValidity: '',
    moaExpirationDate: '',
    moaRemarks: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

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

    // Calculate expiration date when validity changes
    if (name === 'moaValidity' && value && formData.withExpiration) {
      try {
        const validityYears = parseInt(value);
        if (!isNaN(validityYears)) {
          const today = new Date();
          const expirationDate = new Date(today);
          expirationDate.setFullYear(today.getFullYear() + validityYears);
          
          // Format date to YYYY-MM-DD
          const formattedDate = expirationDate.toISOString().split('T')[0];
          
          setFormData(prev => ({
            ...prev,
            [name]: value,
            moaExpirationDate: formattedDate
          }));
        }
      } catch (error) {
        console.error('Error calculating expiration date:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.companyName || !formData.companyAddress || !formData.companyType) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.withExpiration && (!formData.moaValidity || !formData.moaExpirationDate)) {
        throw new Error('Please fill in validity and expiration date');
      }

      // Add document to Firestore
      await addDoc(collection(db, 'companyMOA'), {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Reset form after successful submission
      setFormData({
        companyName: '',
        companyAddress: '',
        companyLongitude: '',
        companyLatitude: '',
        moaYear: new Date().getFullYear().toString(),
        moaStatus: 'Active',
        companyType: '',
        withExpiration: false,
        moaValidity: '',
        moaExpirationDate: '',
        moaRemarks: ''
      });

      setNotification({
        message: 'Company MOA successfully added!',
        type: 'success'
      });

      // Auto-dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);

    } catch (err) {
      console.error('Error adding company MOA:', err);
      setNotification({
        message: err.message,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="company-moa-form-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <h2>Company MOA Form</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="company-moa-form">
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
              className="readonly-input"
              readOnly
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

        <div className="form-actions">
          <button type="button" onClick={() => window.location.reload()} className="reset-button">
            Reset Form
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit MOA'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyMOAForm; 