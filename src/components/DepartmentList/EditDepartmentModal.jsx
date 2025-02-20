import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import './EditDepartmentModal.css';

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

const EditDepartmentModal = ({ department, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    moaStatus: '',
    college: '',
    department: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [departmentSuggestions, setDepartmentSuggestions] = useState([]);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (department) {
      setFormData({
        companyName: department.companyName,
        moaStatus: department.moaStatus,
        college: department.college,
        department: department.department
      });
    }
  }, [department]);

  const handleCollegeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, college: value, department: '' }));
    
    const filtered = Object.keys(COLLEGES).filter(college =>
      college.toLowerCase().includes(value.toLowerCase())
    );
    setCollegeSuggestions(filtered);
    setShowCollegeDropdown(true);
  };

  const handleCollegeSelect = (college) => {
    setFormData(prev => ({
      ...prev,
      college: college,
      department: '' // Reset department when college changes
    }));
    setShowCollegeDropdown(false);
    setCollegeSuggestions([]);
  };

  const handleCollegeFocus = () => {
    setShowCollegeDropdown(true);
    setCollegeSuggestions(Object.keys(COLLEGES));
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, department: value }));
    
    const programs = getProgramsByCollege(formData.college) || [];
    const filtered = programs.filter(program =>
      program.toLowerCase().includes(value.toLowerCase())
    );
    setDepartmentSuggestions(filtered);
    setShowDepartmentDropdown(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const departmentRef = doc(db, 'companyMOA', department.id);
      await updateDoc(departmentRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });

      onUpdate(`${formData.companyName} has been updated successfully`);
      onClose();
    } catch (error) {
      console.error('Error updating department:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update department'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dept-modal-overlay">
      {notification && (
        <div className={`dept-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <div className="dept-edit-modal">
        <div className="dept-modal-header">
          <h2>Edit Department</h2>
          <button className="dept-close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dept-form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              disabled
            />
          </div>

          <div className="dept-form-group">
            <label>Status</label>
            <select
              value={formData.moaStatus}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                moaStatus: e.target.value
              }))}
            >
              <option value="Active">Active</option>
              <option value="For-Update">For Update</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>

          <div className="dept-form-group">
            <label>College</label>
            <div className="dept-type-autocomplete">
              <input
                type="text"
                value={formData.college}
                onChange={handleCollegeChange}
                onFocus={handleCollegeFocus}
                onBlur={() => {
                  setTimeout(() => {
                    setShowCollegeDropdown(false);
                  }, 200);
                }}
                placeholder="Select a college..."
              />
              {showCollegeDropdown && collegeSuggestions.length > 0 && (
                <div className="dept-suggestions-list">
                  {collegeSuggestions.map((college) => (
                    <div
                      key={college}
                      className="dept-suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
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

          <div className="dept-form-group">
            <label>Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={handleDepartmentChange}
              disabled={!formData.college}
              placeholder={formData.college ? "Select a department..." : "Select a college first"}
            />
            {showDepartmentDropdown && departmentSuggestions.length > 0 && (
              <div className="dept-suggestions-list">
                {departmentSuggestions.map((dept) => (
                  <div
                    key={dept}
                    className="dept-suggestion-item"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, department: dept }));
                      setShowDepartmentDropdown(false);
                    }}
                  >
                    {dept}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dept-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartmentModal; 