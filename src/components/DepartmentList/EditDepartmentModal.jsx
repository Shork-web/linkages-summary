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
    collegeEntries: [{ college: '', department: '', status: 'Active' }]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (department) {
      // Handle both new and legacy data formats
      if (department.collegeEntries && Array.isArray(department.collegeEntries)) {
        // New format with collegeEntries array
        const updatedEntries = department.collegeEntries.map(entry => ({
          ...entry,
          status: entry.status || department.moaStatus || 'Active' // Use entry status if available, fall back to company status
        }));
        
        setFormData({
          companyName: department.companyName,
          collegeEntries: updatedEntries
        });
      } else {
        // Legacy format with single college/department
        setFormData({
          companyName: department.companyName,
          collegeEntries: [{ 
            college: department.college || '', 
            department: department.department || '',
            status: department.moaStatus || 'Active'
          }]
        });
      }
    }
  }, [department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCollegeChange = (index, e) => {
    const { value } = e.target;
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
    const { value } = e.target;
    setFormData(prev => {
      const updatedEntries = [...prev.collegeEntries];
      updatedEntries[index] = { 
        ...updatedEntries[index], 
        department: value 
      };
      return { ...prev, collegeEntries: updatedEntries };
    });
  };

  const handleStatusChange = (index, e) => {
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

  const handleAddCollege = () => {
    setFormData(prev => ({
      ...prev,
      collegeEntries: [...prev.collegeEntries, { college: '', department: '', status: 'Active' }]
    }));
  };

  const handleRemoveCollege = (index) => {
    if (formData.collegeEntries.length <= 1) return; // Keep at least one entry
    
    setFormData(prev => ({
      ...prev,
      collegeEntries: prev.collegeEntries.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const departmentRef = doc(db, 'companyMOA', department.id);
      
      // Prepare data for update - ensure we're not sending empty entries
      const updatedData = {
        ...formData,
        collegeEntries: formData.collegeEntries.filter(
          entry => entry.college.trim() !== '' && entry.department.trim() !== ''
        )
      };
      
      // If no valid entries, add a placeholder
      if (updatedData.collegeEntries.length === 0) {
        updatedData.collegeEntries = [{ college: '', department: '', status: 'Active' }];
      }
      
      await updateDoc(departmentRef, updatedData);
      onUpdate('Department updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating department:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dept-modal-overlay">
      <div className="dept-edit-modal">
        <div className="dept-modal-header">
          <h2>Edit Department</h2>
          <button className="dept-close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dept-form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="dept-college-entries-section">
            <h3>College and Department Information</h3>
            
            {formData.collegeEntries.map((entry, index) => (
              <div key={index} className="dept-college-entry">
                <div className="dept-college-entry-header">
                  <h4>Entry #{index + 1}</h4>
                  {formData.collegeEntries.length > 1 && (
                    <button 
                      type="button" 
                      className="dept-remove-college-btn"
                      onClick={() => handleRemoveCollege(index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                
                <div className="dept-form-group">
                  <label>College</label>
                  <select
                    value={entry.college}
                    onChange={(e) => handleCollegeChange(index, e)}
                    required
                  >
                    <option value="">Select a college</option>
                    {Object.keys(COLLEGES).map(college => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                  </select>
                </div>

                <div className="dept-form-group">
                  <label>Department</label>
                  <select
                    value={entry.department}
                    onChange={(e) => handleDepartmentChange(index, e)}
                    required
                    disabled={!entry.college}
                  >
                    <option value="">Select a department</option>
                    {getProgramsByCollege(entry.college).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="dept-form-group">
                  <label>Status</label>
                  <select
                    value={entry.status || 'Active'}
                    onChange={(e) => handleStatusChange(index, e)}
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
              className="dept-add-college-btn"
              onClick={handleAddCollege}
            >
              <i className="fas fa-plus"></i> Add Another College
            </button>
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