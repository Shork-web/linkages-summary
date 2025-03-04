import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import Notification from '../Notification/Notification';
import './CompanyMOAForm.css';

const COLLEGES = {
  'COLLEGE OF ENGINEERING AND ARCHITECTURE': [
    'BS Architecture',
    'BS Chemical Engineering',
    'BS Civil Engineering',
    'BS Computer Engineering',
    'BS Electrical Engineering',
    'BS Electronics Engineering',
    'BS Industrial Engineering',
    'BS Mechanical Engineering',
    'BS Mining Engineering'
  ],
  'COLLEGE OF MANAGEMENT, BUSINESS & ACCOUNTANCY': [
    'BS Accountancy',
    'BS Accounting Information Systems',
    'BS Management Accounting',
    'BS Business Administration',
    'BS Hospitality Management',
    'BS Tourism Management',
    'BS Office Administration',
    'Bachelor in Public Administration'
  ],
  'COLLEGE OF ARTS, SCIENCES, & EDUCATION': [
    'AB Communication',
    'AB English with Applied Linguistics',
    'Bachelor of Elementary Education',
    'Bachelor of Secondary Education',
    'Bachelor of Multimedia Arts',
    'BS Biology',
    'BS Math with Applied Industrial Mathematics',
    'BS Psychology'
  ],
  'COLLEGE OF NURSING & ALLIED HEALTH SCIENCES': [
    'BS Nursing',
    'BS Pharmacy'
  ],
  'COLLEGE OF COMPUTER STUDIES': [
    'BS Computer Science',
    'BS Information Technology'
  ],
  'COLLEGE OF CRIMINAL JUSTICE': [
    'BS Criminology'
  ]
};

const getProgramsByCollege = (college) => {
  return COLLEGES[college] || [];
};

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
    collegeEntries: [{ college: '', department: '', status: 'Active', companyType: '' }],
    withExpiration: false,
    moaValidity: '',
    moaExpirationDate: '',
    moaRemarks: '',
    validityUnit: 'years'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

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
  };

  const handleCompanyTypeChange = (index, e) => {
    const value = e.target.value;
    
    // Update the company type for the specific college entry
    setFormData(prev => {
      const updatedEntries = [...prev.collegeEntries];
      updatedEntries[index] = { 
        ...updatedEntries[index], 
        companyType: value 
      };
      return { ...prev, collegeEntries: updatedEntries };
    });
  };

  const handleCollegeChange = (index, e) => {
    const value = e.target.value;
    
    setFormData(prev => {
      const updatedEntries = [...prev.collegeEntries];
      updatedEntries[index] = { 
        ...updatedEntries[index], 
        college: value,
        department: '' // Reset department when college changes
      };
      return { ...prev, collegeEntries: updatedEntries };
    });
  };

  const handleDepartmentChange = (index, e) => {
    const value = e.target.value;
    
    setFormData(prev => {
      const updatedEntries = [...prev.collegeEntries];
      updatedEntries[index] = { 
        ...updatedEntries[index], 
        department: value 
      };
      return { ...prev, collegeEntries: updatedEntries };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setNotification(null);

    try {
      // Ensure all college entries have a company type
      const validatedEntries = formData.collegeEntries.map(entry => ({
        ...entry,
        companyType: entry.companyType || 'N/A',
        status: entry.status || 'Active'
      }));

      const docRef = await addDoc(collection(db, 'companyMOA'), {
        ...formData,
        collegeEntries: validatedEntries,
        validityUnit: formData.validityUnit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('Document written with ID: ', docRef.id);

      // Clear the form
      setFormData({
        companyName: '',
        companyAddress: '',
        companyLongitude: '',
        companyLatitude: '',
        moaYear: new Date().getFullYear().toString(),
        moaStatus: 'Active',
        collegeEntries: [{ college: '', department: '', status: 'Active', companyType: '' }],
        withExpiration: false,
        moaValidity: '',
        moaExpirationDate: '',
        moaRemarks: '',
        validityUnit: 'years'
      });

      setNotification({
        show: true,
        type: 'success',
        message: 'MOA submitted successfully!'
      });
    } catch (error) {
      console.error('Error adding document: ', error);
      setError('Failed to submit MOA');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the add college function to include companyType
  const handleAddCollege = () => {
    setFormData(prev => ({
      ...prev,
      collegeEntries: [...prev.collegeEntries, { college: '', department: '', status: 'Active', companyType: '' }]
    }));
  };

  // Add a function to handle removing a college entry
  const handleRemoveCollege = (index) => {
    if (formData.collegeEntries.length <= 1) return; // Keep at least one entry
    
    setFormData(prev => ({
      ...prev,
      collegeEntries: prev.collegeEntries.filter((_, i) => i !== index)
    }));
  };

  // Add a function to handle status change for a specific college entry
  const handleCollegeStatusChange = (index, e) => {
    const { value } = e.target;
    
    setFormData(prev => {
      const updatedEntries = [...prev.collegeEntries];
      updatedEntries[index] = { 
        ...updatedEntries[index], 
        status: value 
      };
      return { ...prev, collegeEntries: updatedEntries };
    });
  };

  // Add a new function to reset the current college entry
  const handleResetCollegeEntry = (index) => {
    setFormData(prev => {
      const updatedEntries = [...prev.collegeEntries];
      updatedEntries[index] = { 
        college: '', 
        department: '', 
        status: 'Active', 
        companyType: '' 
      };
      return { ...prev, collegeEntries: updatedEntries };
    });
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
            />
          </div>
        </div>

        {/* College and Department section */}
        <div className="college-entries-section">
          <h3>College and Department Information</h3>
          
          {formData.collegeEntries.map((entry, index) => (
            <div key={index} className="college-entry">
              <div className="college-entry-header">
                <h4>Entry #{index + 1}</h4>
                <div className="entry-actions">
                  <button 
                    type="button" 
                    className="reset-entry-btn"
                    onClick={() => handleResetCollegeEntry(index)}
                    title="Reset this entry"
                  >
                    <i className="fas fa-redo-alt"></i>
                  </button>
                  {formData.collegeEntries.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-college-btn"
                      onClick={() => handleRemoveCollege(index)}
                      title="Remove this entry"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor={`companyType-${index}`}>Company Type: <span className="required">*</span></label>
                <select
                  id={`companyType-${index}`}
                  name={`companyType-${index}`}
                  value={entry.companyType}
                  onChange={(e) => handleCompanyTypeChange(index, e)}
                  required
                >
                  <option value="">Select Company Type</option>
                  {companyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor={`college-${index}`}>College:</label>
                <select
                  id={`college-${index}`}
                  name={`college-${index}`}
                  value={entry.college}
                  onChange={(e) => handleCollegeChange(index, e)}
                >
                  <option value="">Select College</option>
                  {Object.keys(COLLEGES).map(college => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor={`department-${index}`}>Department:</label>
                <select
                  id={`department-${index}`}
                  name={`department-${index}`}
                  value={entry.department}
                  onChange={(e) => handleDepartmentChange(index, e)}
                  disabled={!entry.college}
                >
                  <option value="">Select Department</option>
                  {entry.college && getProgramsByCollege(entry.college).map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor={`status-${index}`}>Status:</label>
                <select
                  id={`status-${index}`}
                  name={`status-${index}`}
                  value={entry.status}
                  onChange={(e) => handleCollegeStatusChange(index, e)}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="For-Update">For Update</option>
                  <option value="Blacklisted">Blacklisted</option>
                  <option value="On process">On process</option>
                </select>
              </div>
            </div>
          ))}
          
          <div className="college-entry-actions">
            <button 
              type="button" 
              className="add-college-btn"
              onClick={handleAddCollege}
            >
              <i className="fas fa-plus"></i> Add Another College
            </button>
            
            <button 
              type="button" 
              className="reset-all-entries-btn"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  collegeEntries: [{ college: '', department: '', status: 'Active', companyType: '' }]
                }));
              }}
            >
              <i className="fas fa-sync"></i> Reset All Entries
            </button>
          </div>
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
              Validity
              <span className="helper-text"> Duration of the MOA</span>
            </label>
            <div className="validity-input-group">
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
              <select
                id="validityUnit"
                name="validityUnit"
                value={formData.validityUnit || 'years'}
                onChange={handleChange}
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="moaExpirationDate">Expiration Date:</label>
            <input
              type="date"
              id="moaExpirationDate"
              name="moaExpirationDate"
              value={formData.moaExpirationDate}
              onChange={handleChange}
              required={formData.withExpiration}
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