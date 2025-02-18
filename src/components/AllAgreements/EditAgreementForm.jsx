import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import './EditAgreementForm.css';

const EditAgreementForm = ({ agreement, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    signedBy: '',
    designation: '',
    description: '',
    agreementType: '',
    partnerType: '',
    status: '',
    validity: '',
    dateSigned: '',
    dateExpired: '',
    remarks: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (agreement) {
      setFormData({
        name: agreement.name || '',
        address: agreement.address || '',
        signedBy: agreement.signedBy || '',
        designation: agreement.designation || '',
        description: agreement.description || '',
        agreementType: agreement.agreementType || '',
        partnerType: agreement.partnerType || '',
        status: agreement.status || '',
        validity: agreement.validity || '',
        dateSigned: agreement.dateSigned || '',
        dateExpired: agreement.dateExpired || '',
        remarks: agreement.remarks || ''
      });
    }
  }, [agreement]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const agreementRef = doc(db, 'agreements', agreement.id);
      await updateDoc(agreementRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });

      onUpdate('Agreement updated successfully');
      onClose();
    } catch (error) {
      onUpdate('Error updating agreement: ' + error.message, 'error');
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="For Renewal">For Renewal</option>
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