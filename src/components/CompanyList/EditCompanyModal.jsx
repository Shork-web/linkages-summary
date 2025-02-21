import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import './EditCompanyModal.css';

// Add the college data here
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

const EditCompanyModal = ({ company, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyLongitude: '',
    companyLatitude: '',
    moaYear: '',
    moaStatus: '',
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

  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

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

  const handleCollegeFocus = () => {
    setShowCollegeDropdown(true);
    setCollegeSuggestions(Object.keys(COLLEGES)); // Show all colleges on focus
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, department: value }));
    setDepartmentSuggestions(
      getProgramsByCollege(formData.college).filter(program =>
        program.toLowerCase().includes(value.toLowerCase())
      )
    );
    setShowDepartmentDropdown(true);
  };

  const handleDepartmentSelect = (department) => {
    setFormData(prev => ({ ...prev, department }));
    setShowDepartmentDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const companyRef = doc(db, 'companyMOA', company.id);
      await updateDoc(companyRef, {
        ...formData,
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
            <div className="form-group">
              <label htmlFor="companyType">Company Type:</label>
              <div className="company-type-autocomplete" ref={suggestionsRef}>
                <input
                  type="text"
                  id="companyType"
                  name="companyType"
                  className="company-type-input"
                  value={formData.companyType}
                  onChange={handleCompanyTypeChange}
                  onKeyDown={handleKeyDown}
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
            </div>
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
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleDepartmentChange}
              onFocus={() => setShowDepartmentDropdown(true)}
              onBlur={() => setShowDepartmentDropdown(false)}
              disabled={!formData.college}
            />
            {showDepartmentDropdown && departmentSuggestions.length > 0 && (
              <div className="suggestions-list">
                {departmentSuggestions.map((program) => (
                  <div
                    key={program}
                    className="suggestion-item"
                    onClick={() => handleDepartmentSelect(program)}
                  >
                    {program}
                  </div>
                ))}
              </div>
            )}
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
              <label htmlFor="moaExpirationDate">Expiration Date</label>
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