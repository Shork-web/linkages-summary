import React, { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase-config';
import EditDepartmentModal from './EditDepartmentModal';
import './DepartmentList.css';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    college: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, departmentId: null, companyName: '' });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'companyMOA'), (snapshot) => {
      const departmentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort the data: numbers first, then letters
      const sortedData = departmentData.sort((a, b) => {
        const nameA = a.companyName.trim();
        const nameB = b.companyName.trim();

        // Check if either name starts with a number
        const startsWithNumberA = /^\d/.test(nameA);
        const startsWithNumberB = /^\d/.test(nameB);

        // If one starts with number and other doesn't
        if (startsWithNumberA && !startsWithNumberB) return -1;
        if (!startsWithNumberA && startsWithNumberB) return 1;

        // If both start with numbers or both start with letters
        return nameA.localeCompare(nameB, undefined, {
          numeric: true,
          sensitivity: 'base'
        });
      });

      setDepartments(sortedData);
    }, (error) => {
      console.error('Error fetching departments:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setIsEditModalOpen(true);
  };

  // Filter departments based on search term and filters
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = 
      dept.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || dept.moaStatus === filters.status;
    const matchesDepartment = !filters.department || dept.department === filters.department;
    const matchesCollege = !filters.college || dept.college === filters.college;

    return matchesSearch && matchesStatus && matchesDepartment && matchesCollege;
  });

  // Get unique departments for filter dropdown - sort alphabetically
  const uniqueDepartments = [...new Set(departments.map(dept => dept.department))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  // Get unique colleges for filter dropdown - sort alphabetically
  const uniqueColleges = [...new Set(departments.map(dept => dept.college))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  // Get current departments for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDepartments = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  // Update the pagination section
  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'companyMOA', deleteConfirm.departmentId));
      setNotification({
        message: `Successfully deleted ${deleteConfirm.companyName}`,
        type: 'success'
      });
      setDeleteConfirm({ show: false, departmentId: null, companyName: '' });
      // Refresh the list
      window.location.reload();
    } catch (error) {
      setNotification({
        message: `Error deleting department: ${error.message}`,
        type: 'error'
      });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const confirmDelete = (id, companyName) => {
    setDeleteConfirm({
      show: true,
      departmentId: id,
      companyName: companyName
    });
  };

  const handleUpdate = (message) => {
    setNotification({
      type: 'success',
      message: message || 'Department updated successfully'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="dept-list-container">
      {notification && (
        <div className={`dept-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <h2>Department List</h2>

      {/* Search and Filter Section */}
      <div className="dept-filters-section">
        <div className="dept-search-box">
          <input
            type="text"
            className="dept-search-input"
            placeholder="Search by company or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search dept-search-icon"></i>
        </div>

        <div className="dept-filter-controls">
          <select
            className="dept-filter-select"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="For-Update">For Update</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>

          <select
            className="dept-filter-select"
            value={filters.college}
            onChange={(e) => setFilters(prev => ({ ...prev, college: e.target.value }))}
          >
            <option value="">All Colleges</option>
            {uniqueColleges.map(college => (
              <option key={college} value={college}>{college}</option>
            ))}
          </select>

          <select
            className="dept-filter-select"
            value={filters.department}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="dept-table-container">
        <table className="dept-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Status</th>
              <th>College</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentDepartments.map(department => (
              <tr key={department.id}>
                <td data-full-text={department.companyName}>
                  {department.companyName}
                </td>
                <td>
                  <span className={`dept-status-badge dept-status-${department.moaStatus.toLowerCase()}`}>
                    {department.moaStatus}
                  </span>
                </td>
                <td data-full-text={department.college}>
                  {department.college}
                </td>
                <td data-full-text={department.department}>
                  {department.department}
                </td>
                <td className="dept-action-buttons">
                  <button 
                    className="dept-edit-button"
                    onClick={() => handleEdit(department)}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="dept-delete-button"
                    onClick={() => confirmDelete(department.id, department.companyName)}
                    title="Delete"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update pagination section */}
      <div className="dept-pagination">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="dept-page-btn"
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        {getPageNumbers().map((number, index) => (
          number === '...' ? (
            <span key={index} className="dept-page-ellipsis">...</span>
          ) : (
            <button
              key={index}
              className={`dept-page-btn ${currentPage === number ? 'active' : ''}`}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </button>
          )
        ))}

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="dept-page-btn"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="dept-page-info">
        Page {currentPage} of {totalPages}
      </div>

      {deleteConfirm.show && (
        <div className="dept-modal-overlay">
          <div className="dept-delete-confirmation-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {deleteConfirm.companyName}?</p>
            <div className="dept-modal-actions">
              <button onClick={() => setDeleteConfirm({ show: false, departmentId: null, companyName: '' })}>
                Cancel
              </button>
              <button onClick={handleDelete} className="dept-delete-button">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <EditDepartmentModal
          department={editingDepartment}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default DepartmentList; 