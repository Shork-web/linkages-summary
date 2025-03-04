import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import './EditAgreementForm.css';

const EditAgreementForm = ({ agreement, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    ...agreement,
    status: agreement.status || 'pending'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (agreement) {
      setFormData({
        ...agreement,
        dateSigned: agreement.dateSigned?.split('T')[0] || '',
        dateExpired: agreement.dateExpired?.split('T')[0] || '',
        status: agreement.status || 'pending'
      });
    }
  }, [agreement]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateExpiryDate = (dateSigned, validity) => {
    if (!dateSigned || !validity) return '';
    const date = new Date(dateSigned);
    date.setFullYear(date.getFullYear() + parseInt(validity));
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const agreementRef = doc(db, 'agreementform', agreement.id);
      
      // Calculate new expiry date if date signed or validity changes
      const newExpiryDate = calculateExpiryDate(formData.dateSigned, formData.validity);
      
      // Prepare update data
      let status = formData.status.toLowerCase();
      // If the agreement is marked as renewed, set it to active
      if (status === 'renewed') {
        status = 'active';
      }

      const updateData = {
        ...formData,
        dateExpired: newExpiryDate,
        updatedAt: new Date().toISOString(),
        validity: parseInt(formData.validity),
        status: status,
        forRenewal: formData.forRenewal
      };

      // Update in Firestore
      await updateDoc(agreementRef, updateData);
      
      // Call the onUpdate callback with the updated data
      onUpdate(updateData);
    } catch (error) {
      console.error('Error updating agreement:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="edit-agreement-modal">
        <div className="modal-header">
          <h2>Edit Agreement</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-agreement-form">
          <div className="form-group">
            <label htmlFor="name">Partner Name:</label>
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

          <div className="form-row">
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="agreementType">Agreement Type:</label>
              <select
                id="agreementType"
                name="agreementType"
                value={formData.agreementType}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="MOA">MOA</option>
                <option value="MOU">MOU</option>
              </select>
            </div>

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

          <div className="form-row">
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
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="validity">Validity (years):</label>
              <input
                type="number"
                id="validity"
                name="validity"
                value={formData.validity}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateExpired">Date Expired:</label>
              <input
                type="date"
                id="dateExpired"
                name="dateExpired"
                value={formData.dateExpired}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="remarks">Remarks:</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="links">Document Link:</label>
            <input
              type="text"
              id="links"
              name="links"
              value={formData.links || ''}
              onChange={handleChange}
              placeholder="Enter document URL (e.g., SharePoint, Google Drive)"
            />
          </div>

          <div className="renewal-section">
            <div className="renewal-checkbox">
              <input
                type="checkbox"
                id="forRenewal"
                name="forRenewal"
                checked={formData.forRenewal}
                onChange={handleChange}
              />
              <label htmlFor="forRenewal">
                <i className="fas fa-sync-alt"></i>
                Mark for Renewal
              </label>
            </div>
            <div className="renewal-description">
              Marking this agreement for renewal will flag it for follow-up before expiration
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

export default EditAgreementForm;