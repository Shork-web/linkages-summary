import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config'; // Import Firestore
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore functions
import './AgreementForm.css';
import { auth } from '../../firebase-config';
import { useNavigate } from 'react-router-dom';
import Notification from '../Notification/Notification';

const calculateExpiryDate = (dateString, validityYears) => {
  if (!dateString || !validityYears) return '';
  const date = new Date(dateString);
  date.setFullYear(date.getFullYear() + parseInt(validityYears));
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
    
    // Partner Type only
    partnerType: '',
    
    // Dates
    dateSigned: '',
    validity: '',
    dateExpired: '',
    forRenewal: false,
    
    // Additional Info
    status: 'pending',
    description: '',
    links: ''
  });

  const navigate = useNavigate();

  // Add notification state
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevState => {
      const newState = {
        ...prevState,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // If date signed or validity changes, recalculate expiry date
      if ((name === 'dateSigned' && prevState.validity) || 
          (name === 'validity' && prevState.dateSigned)) {
        
        const validityYears = name === 'validity' ? 
          parseInt(value) || 0 : 
          parseInt(prevState.validity) || 0;
        
        const dateToUse = name === 'dateSigned' ? 
          value : 
          prevState.dateSigned;
        
        if (validityYears > 0 && dateToUse) {
          newState.dateExpired = calculateExpiryDate(dateToUse, validityYears);
        }
      }
      
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      setNotification({
        show: true,
        type: 'error',
        message: 'You must be logged in to submit agreements'
      });
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.address || !formData.signedBy || !formData.designation) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    // Validate partner information
    if (!formData.partnerType) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please select a partner type'
      });
      return;
    }

    // Ensure expiry date is calculated
    let submissionData = { ...formData };
    if (formData.dateSigned && formData.validity) {
      submissionData.dateExpired = calculateExpiryDate(formData.dateSigned, formData.validity);
    }

    try {
      const docRef = await addDoc(collection(db, 'agreementform'), {
        ...submissionData,
        createdBy: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });

      console.log('Document written with ID: ', docRef.id);
      setNotification({
        show: true,
        type: 'success',
        message: 'Agreement successfully submitted!'
      });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        address: '',
        signedBy: '',
        designation: '',
        agreementType: 'MOU',
        partnerType: '',
        dateSigned: '',
        validity: '',
        dateExpired: '',
        forRenewal: false,
        status: 'pending',
        description: '',
        links: ''
      });

    } catch (error) {
      console.error('Error adding document: ', error);
      if (error.code === 'permission-denied') {
        alert('You do not have permission to create agreements');
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: 'Error submitting agreement. Please try again.'
        });
      }
    }
  };

  return (
    <div className="agreement-form-container">
      <div className="form-header">
        <h2>Linkages Partnership Agreement Form</h2>
        <p className="form-subtitle">Enter agreement details below</p>
      </div>

      <form onSubmit={handleSubmit}>
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
              >
                <option value="">Select Partner Type</option>
                <option value="Industry">Industry</option>
                <option value="Academe">Academe</option>
                <option value="Local Government">Local Government</option>
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
              onChange={handleChange}
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
              onChange={handleChange}
              placeholder="Enter validity period"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateExpired">Expiry Date:</label>
            <input
              type="text"
              id="dateExpired"
              name="dateExpired"
              value={formData.dateExpired ? new Date(formData.dateExpired).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}
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
          <button type="button" className="reset-button" onClick={() => window.location.reload()}>
            Reset Form
          </button>
          <button type="submit" className="submit-button">
            Submit Agreement
          </button>
        </div>
      </form>
      
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ show: false, type: '', message: '' })}
        />
      )}
    </div>
  );
};

export default AgreementForm; 