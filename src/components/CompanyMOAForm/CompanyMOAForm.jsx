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
    collegeEntries: [{ college: '', department: '', status: 'Active' }],
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
  const suggestionsRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [departmentSuggestions, setDepartmentSuggestions] = useState([]);
  const [showCollegeDropdowns, setShowCollegeDropdowns] = useState([]);
  const [showDepartmentDropdowns, setShowDepartmentDropdowns] = useState([]);
  const [activeCollegeIndex, setActiveCollegeIndex] = useState(-1);
  const [activeDepartmentIndex, setActiveDepartmentIndex] = useState(-1);

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

  // Add these new state variables for keyboard navigation
  const [companyTypeKeyIndex, setCompanyTypeKeyIndex] = useState(-1);
  const [collegeKeyIndex, setCollegeKeyIndex] = useState(-1);
  const [departmentKeyIndex, setDepartmentKeyIndex] = useState(-1);
  
  // Add refs for scrolling
  const companyTypeListRef = useRef(null);
  const collegeListRef = useRef(null);
  const departmentListRef = useRef(null);

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
    
    // Filter college suggestions based on input
    const filtered = Object.keys(COLLEGES).filter(college =>
      college.toLowerCase().includes(value.toLowerCase())
    );
    setCollegeSuggestions(filtered);
    setShowCollegeDropdowns(Array(formData.collegeEntries.length).fill(false));
    setActiveCollegeIndex(index);
  };

  const handleCollegeSelect = (index, college) => {
    setFormData(prev => {
      const updatedEntries = [...prev.collegeEntries];
      updatedEntries[index] = { 
        ...updatedEntries[index], 
        college: college,
        department: '' // Reset department when college changes
      };
      return { ...prev, collegeEntries: updatedEntries };
    });
    
    setShowCollegeDropdowns(Array(formData.collegeEntries.length).fill(false));
    setCollegeSuggestions([]);
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
    
    // Get programs for the selected college and filter based on input
    const collegePrograms = getProgramsByCollege(formData.collegeEntries[index].college);
    const filtered = collegePrograms.filter(program =>
      program.toLowerCase().includes(value.toLowerCase())
    );
    setDepartmentSuggestions(filtered);
    setShowDepartmentDropdowns(Array(formData.collegeEntries.length).fill(false));
    setActiveDepartmentIndex(index);
  };

  const handleDepartmentSelect = (index, department) => {
    setFormData(prev => {
      const updatedEntries = [...prev.collegeEntries];
      updatedEntries[index] = { 
        ...updatedEntries[index], 
        department: department 
      };
      return { ...prev, collegeEntries: updatedEntries };
    });
    
    setShowDepartmentDropdowns(Array(formData.collegeEntries.length).fill(false));
    setDepartmentSuggestions([]);
  };

  const handleCollegeFocus = (index) => {
    const newDropdowns = Array(formData.collegeEntries.length).fill(false);
    newDropdowns[index] = true;
    setShowCollegeDropdowns(newDropdowns);
    setActiveCollegeIndex(index);
    setCollegeSuggestions(Object.keys(COLLEGES)); // Show all colleges on focus
  };

  const handleDepartmentFocus = (index) => {
    if (formData.collegeEntries[index].college) {
      const newDropdowns = Array(formData.collegeEntries.length).fill(false);
      newDropdowns[index] = true;
      setShowDepartmentDropdowns(newDropdowns);
      setActiveDepartmentIndex(index);
      setDepartmentSuggestions(getProgramsByCollege(formData.collegeEntries[index].college));
    }
  };

  const handleCollegeBlur = (index) => {
    setTimeout(() => {
      const newDropdowns = [...showCollegeDropdowns];
      newDropdowns[index] = false;
      setShowCollegeDropdowns(newDropdowns);
    }, 200);
  };

  const handleDepartmentBlur = (index) => {
    setTimeout(() => {
      const newDropdowns = [...showDepartmentDropdowns];
      newDropdowns[index] = false;
      setShowDepartmentDropdowns(newDropdowns);
    }, 200);
  };

  // Handle keyboard navigation for company type dropdown
  const handleCompanyTypeKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setCompanyTypeKeyIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setCompanyTypeKeyIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (companyTypeKeyIndex >= 0 && companyTypeKeyIndex < suggestions.length) {
          handleSuggestionClick(suggestions[companyTypeKeyIndex]);
          setShowDropdown(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
      default:
        break;
    }
  };

  // Handle keyboard navigation for college dropdown
  const handleCollegeKeyDown = (e) => {
    if (!showCollegeDropdowns[activeCollegeIndex] || collegeSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setCollegeKeyIndex(prev => 
          prev < collegeSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setCollegeKeyIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (collegeKeyIndex >= 0 && collegeKeyIndex < collegeSuggestions.length) {
          handleCollegeSelect(activeCollegeIndex, collegeSuggestions[collegeKeyIndex]);
          setShowCollegeDropdowns(Array(formData.collegeEntries.length).fill(false));
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowCollegeDropdowns(Array(formData.collegeEntries.length).fill(false));
        break;
      default:
        break;
    }
  };

  // Handle keyboard navigation for department dropdown
  const handleDepartmentKeyDown = (e) => {
    if (!showDepartmentDropdowns[activeDepartmentIndex] || departmentSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setDepartmentKeyIndex(prev => 
          prev < departmentSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setDepartmentKeyIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (departmentKeyIndex >= 0 && departmentKeyIndex < departmentSuggestions.length) {
          handleDepartmentSelect(activeDepartmentIndex, departmentSuggestions[departmentKeyIndex]);
          setShowDepartmentDropdowns(Array(formData.collegeEntries.length).fill(false));
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDepartmentDropdowns(Array(formData.collegeEntries.length).fill(false));
        break;
      default:
        break;
    }
  };

  // Auto-scroll to the selected item in company type dropdown
  useEffect(() => {
    if (companyTypeKeyIndex >= 0 && companyTypeListRef.current) {
      const listItems = companyTypeListRef.current.querySelectorAll('.suggestion-item');
      if (listItems[companyTypeKeyIndex]) {
        listItems[companyTypeKeyIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [companyTypeKeyIndex]);

  // Auto-scroll to the selected item in college dropdown
  useEffect(() => {
    if (collegeKeyIndex >= 0 && collegeListRef.current) {
      const listItems = collegeListRef.current.querySelectorAll('.suggestion-item');
      if (listItems[collegeKeyIndex]) {
        listItems[collegeKeyIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [collegeKeyIndex]);

  // Auto-scroll to the selected item in department dropdown
  useEffect(() => {
    if (departmentKeyIndex >= 0 && departmentListRef.current) {
      const listItems = departmentListRef.current.querySelectorAll('.suggestion-item');
      if (listItems[departmentKeyIndex]) {
        listItems[departmentKeyIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [departmentKeyIndex]);

  // Reset key index when dropdown visibility changes
  useEffect(() => {
    if (!showDropdown) setCompanyTypeKeyIndex(-1);
  }, [showDropdown]);

  useEffect(() => {
    if (!showCollegeDropdowns.every(Boolean)) setCollegeKeyIndex(-1);
  }, [showCollegeDropdowns]);

  useEffect(() => {
    if (!showDepartmentDropdowns.every(Boolean)) setDepartmentKeyIndex(-1);
  }, [showDepartmentDropdowns]);

  // Initialize dropdown states when entries change
  useEffect(() => {
    setShowCollegeDropdowns(Array(formData.collegeEntries.length).fill(false));
    setShowDepartmentDropdowns(Array(formData.collegeEntries.length).fill(false));
  }, [formData.collegeEntries.length]);

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
        collegeEntries: [{ college: '', department: '', status: 'Active' }],
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

  // Add a function to handle adding another college entry
  const handleAddCollege = () => {
    setFormData(prev => ({
      ...prev,
      collegeEntries: [...prev.collegeEntries, { college: '', department: '', status: 'Active' }]
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

          <div className="form-group">
            <label htmlFor="companyType">Company Type:</label>
            <div className="company-type-autocomplete">
              <input
                type="text"
                id="companyType"
                name="companyType"
                value={formData.companyType}
                onChange={handleCompanyTypeChange}
                onFocus={handleCompanyTypeFocus}
                onBlur={handleBlur}
                onKeyDown={handleCompanyTypeKeyDown}
                placeholder="Start typing to see suggestions..."
                required
              />
              {showDropdown && suggestions.length > 0 && (
                <div className="suggestions-list" ref={companyTypeListRef}>
                  {suggestions.map((type, index) => (
                    <div
                      key={type}
                      className={`suggestion-item ${index === companyTypeKeyIndex ? 'selected' : ''}`}
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

        {/* College and Department section */}
        <div className="college-entries-section">
          <h3>College and Department Information</h3>
          
          {formData.collegeEntries.map((entry, index) => (
            <div key={index} className="college-entry">
              <div className="college-entry-header">
                <h4>Entry #{index + 1}</h4>
                {formData.collegeEntries.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-college-btn"
                    onClick={() => handleRemoveCollege(index)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor={`college-${index}`}>College:</label>
                <div className="company-type-autocomplete">
                  <input
                    type="text"
                    id={`college-${index}`}
                    name={`college-${index}`}
                    value={entry.college}
                    onChange={(e) => handleCollegeChange(index, e)}
                    onFocus={() => handleCollegeFocus(index)}
                    onKeyDown={activeCollegeIndex === index ? handleCollegeKeyDown : null}
                    onBlur={() => handleCollegeBlur(index)}
                    placeholder="Select a college..."
                  />
                  {showCollegeDropdowns[index] && collegeSuggestions.length > 0 && (
                    <div className="suggestions-list" ref={collegeListRef}>
                      {collegeSuggestions.map((college, i) => (
                        <div
                          key={college}
                          className={`suggestion-item ${i === collegeKeyIndex ? 'selected' : ''}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleCollegeSelect(index, college);
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
                <label htmlFor={`department-${index}`}>Department:</label>
                <div className="company-type-autocomplete">
                  <input
                    type="text"
                    id={`department-${index}`}
                    name={`department-${index}`}
                    value={entry.department}
                    onChange={(e) => handleDepartmentChange(index, e)}
                    onFocus={() => handleDepartmentFocus(index)}
                    onKeyDown={activeDepartmentIndex === index ? handleDepartmentKeyDown : null}
                    onBlur={() => handleDepartmentBlur(index)}
                    placeholder="Select a department..."
                    disabled={!entry.college}
                  />
                  {showDepartmentDropdowns[index] && departmentSuggestions.length > 0 && (
                    <div className="suggestions-list" ref={departmentListRef}>
                      {departmentSuggestions.map((program, i) => (
                        <div
                          key={program}
                          className={`suggestion-item ${i === departmentKeyIndex ? 'selected' : ''}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleDepartmentSelect(index, program);
                          }}
                        >
                          {program}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
          
          <button 
            type="button" 
            className="add-college-btn"
            onClick={handleAddCollege}
          >
            <i className="fas fa-plus"></i> Add Another College
          </button>
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