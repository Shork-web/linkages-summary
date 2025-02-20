import React, { useState, useEffect, useRef } from 'react';
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
    companyType: '',
    college: '',
    department: '',
    withExpiration: false,
    moaValidity: '',
    moaExpirationDate: '',
    moaRemarks: '',
    validityUnit: 'years'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [departmentSuggestions, setDepartmentSuggestions] = useState([]);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

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

  const handleCompanyTypeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, companyType: value }));
    
    // Filter suggestions based on input
    if (value.trim()) {
      const filtered = companyTypes.filter(type =>
        type.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setSelectedIndex(-1);
    } else {
      setSuggestions(companyTypes); // Show all if input is empty
    }
  };

  const handleCompanyTypeFocus = () => {
    setShowDropdown(true);
    setSuggestions(companyTypes); // Show all options on focus
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 100); // Delay to allow click event to register
  };

  const handleSuggestionClick = (type) => {
    setFormData(prev => ({ ...prev, companyType: type }));
    setSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCollegeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, college: value, department: '' }));
    
    // Filter college suggestions based on input
    const filtered = Object.keys(COLLEGES).filter(college =>
      college.toLowerCase().includes(value.toLowerCase())
    );
    setCollegeSuggestions(filtered);
    setShowCollegeDropdown(true);
  };

  const handleCollegeSelect = (college) => {
    console.log('Selected college:', college); // For debugging
    setFormData(prev => ({
      ...prev,
      college: college,
      department: '' // Reset department when college changes
    }));
    setShowCollegeDropdown(false);
    setCollegeSuggestions([]); // Clear suggestions after selection
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, department: value }));
    
    // Get programs for the selected college and filter based on input
    const collegePrograms = getProgramsByCollege(formData.college);
    const filtered = collegePrograms.filter(program =>
      program.toLowerCase().includes(value.toLowerCase())
    );
    setDepartmentSuggestions(filtered);
    setShowDepartmentDropdown(true);
  };

  const handleDepartmentSelect = (department) => {
    setFormData(prev => ({ ...prev, department }));
    setShowDepartmentDropdown(false);
    setDepartmentSuggestions([]); // Clear suggestions after selection
  };

  const handleDepartmentFocus = () => {
    if (formData.college) {
      setShowDepartmentDropdown(true);
      // Show all programs for the selected college
      setDepartmentSuggestions(getProgramsByCollege(formData.college));
    }
  };

  const handleCollegeFocus = () => {
    setShowCollegeDropdown(true);
    setCollegeSuggestions(Object.keys(COLLEGES)); // Show all colleges on focus
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setNotification(null);

    try {
      const docRef = await addDoc(collection(db, 'companyMOA'), {
        ...formData,
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
        companyType: '',
        college: '',
        department: '',
        withExpiration: false,
        moaValidity: '',
        moaExpirationDate: '',
        moaRemarks: '',
        validityUnit: 'years'
      });

      setSuggestions([]); // Clear suggestions
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
          <label htmlFor="companyType">Company Type:</label>
          <input
            type="text"
            id="companyType"
            name="companyType"
            value={formData.companyType}
            onChange={handleCompanyTypeChange}
            onFocus={handleCompanyTypeFocus}
            onBlur={handleBlur}
            placeholder="Start typing to see suggestions..."
            required
          />
          {showDropdown && suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.map((type, index) => (
                <div
                  key={type}
                  className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(type)}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="college">College:</label>
          <div className="company-type-autocomplete">
            <input
              type="text"
              id="college"
              name="college"
              value={formData.college}
              onChange={handleCollegeChange}
              onFocus={handleCollegeFocus}
              onBlur={() => {
                // Delay hiding dropdown to allow click to register
                setTimeout(() => {
                  setShowCollegeDropdown(false);
                }, 200);
              }}
              placeholder="Select a college..."
            />
            {showCollegeDropdown && collegeSuggestions.length > 0 && (
              <div className="suggestions-list">
                {collegeSuggestions.map((college) => (
                  <div
                    key={college}
                    className="suggestion-item"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      handleCollegeSelect(college);
                    }}
                  >
                    {college}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="department">Department:</label>
          <div className="company-type-autocomplete">
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleDepartmentChange}
              onFocus={handleDepartmentFocus}
              onBlur={() => {
                setTimeout(() => {
                  setShowDepartmentDropdown(false);
                }, 200);
              }}
              placeholder="Select a department..."
              disabled={!formData.college}
            />
            {showDepartmentDropdown && departmentSuggestions.length > 0 && (
              <div className="suggestions-list">
                {departmentSuggestions.map((program) => (
                  <div
                    key={program}
                    className="suggestion-item"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      handleDepartmentSelect(program);
                    }}
                  >
                    {program}
                  </div>
                ))}
              </div>
            )}
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