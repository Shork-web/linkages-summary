import React, { useEffect, useState, useCallback } from 'react';
import { subscribeToAgreements } from '../../utils/fetchAgreements';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import DashboardCounters from '../DashboardCounters/DashboardCounters';
import './AllAgreements.css';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import EditAgreementForm from '../EditAgreementForm/EditAgreementForm';
import Notification from '../Notification/Notification';

const AllAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
    partnerType: ''
  });
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    agreementId: null,
    agreementName: ''
  });
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [visiblePages, setVisiblePages] = useState([]);

  useEffect(() => {
    // Check authentication
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    const unsubscribe = subscribeToAgreements(setAgreements);
    return () => unsubscribe();
  }, [navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredAgreements = agreements.filter(agreement => {
    const searchTerm = filters.search.toLowerCase().trim();
    
    // If no search term, only apply type filters
    if (!searchTerm) {
      return (filters.type === '' || agreement.agreementType === filters.type) &&
             (filters.status === '' || agreement.status === filters.status) &&
             (filters.partnerType === '' || agreement.partnerType === filters.partnerType);
    }

    // Check if any field matches the search term
    const isMatch = [
      agreement.name,
      agreement.address,
      agreement.signedBy,
      agreement.designation,
      agreement.description,
      agreement.agreementType,
      agreement.partnerType,
      agreement.status,
      agreement.validity,
      agreement.dateSigned,
      agreement.dateExpired
    ].some(field => 
      String(field || '').toLowerCase().includes(searchTerm)
    );

    // Apply both search and type filters
    return isMatch && 
           (filters.type === '' || agreement.agreementType === filters.type) &&
           (filters.status === '' || agreement.status === filters.status) &&
           (filters.partnerType === '' || agreement.partnerType === filters.partnerType);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAgreements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAgreements.length / itemsPerPage);

  const handleEdit = (agreement) => {
    setEditingAgreement(agreement);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingAgreement(null);
  };

  const handleUpdateAgreement = async (updatedData) => {
    try {
      const agreementRef = doc(db, 'agreementform', editingAgreement.id);
      await updateDoc(agreementRef, updatedData);
      handleCloseModal();
      setNotification({
        show: true,
        type: 'success',
        message: 'Agreement updated successfully!'
      });
    } catch (error) {
      console.error('Error updating agreement:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Error updating agreement. Please try again.'
      });
    }
  };

  const handleDelete = (agreement) => {
    setDeleteConfirm({
      show: true,
      agreementId: agreement.id,
      agreementName: agreement.name
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'agreementform', deleteConfirm.agreementId));
      setDeleteConfirm({ show: false, agreementId: null, agreementName: '' });
      setNotification({
        show: true,
        type: 'success',
        message: 'Agreement deleted successfully!'
      });
    } catch (error) {
      console.error('Error deleting agreement:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Error deleting agreement. Please try again.'
      });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, agreementId: null, agreementName: '' });
  };

  const toggleDescription = (id) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const calculateVisiblePages = useCallback(() => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    setVisiblePages(range);
  }, [currentPage, totalPages]);

  useEffect(() => {
    calculateVisiblePages();
  }, [calculateVisiblePages]);

  return (
    <div>
      <DashboardCounters agreements={agreements} />
      <div className="agreements-container">
        <div className="agreements-header">
          <div className="header-title">
            <h2>All Agreements</h2>
          </div>
          <div className="header-controls">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name, type, status..."
              />
            </div>
            <div className="filter-group">
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="MOU">MOU</option>
                <option value="MOA">MOA</option>
              </select>
              <select
                name="partnerType"
                value={filters.partnerType}
                onChange={handleFilterChange}
              >
                <option value="">All Partners</option>
                <option value="academe">Academe</option>
                <option value="industry">Industry</option>
                <option value="government">Government</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="agreements-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Signed By</th>
                <th>Designation</th>
                <th>Agreement Type</th>
                <th>Date Signed</th>
                <th>Validity</th>
                <th>Date Expired</th>
                <th>For Renewal</th>
                <th>Status</th>
                <th>Description</th>
                <th>Links</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map(agreement => (
                  <tr key={agreement.id}>
                    <td>{agreement.name}</td>
                    <td>{agreement.address}</td>
                    <td>{agreement.signedBy}</td>
                    <td>{agreement.designation}</td>
                    <td>{agreement.agreementType}</td>
                    <td>{agreement.dateSigned}</td>
                    <td>
                      {agreement.validity}
                      {agreement.validity && !isNaN(agreement.validity) && ' years'}
                    </td>
                    <td>{agreement.dateExpired}</td>
                    <td>{agreement.forRenewal ? 'Yes' : 'No'}</td>
                    <td>
                      <span className={`status-badge status-${agreement.status}`}>
                        {agreement.status}
                      </span>
                    </td>
                    <td className="description-cell">
                      <div className={`description-content ${expandedDescriptions.has(agreement.id) ? 'expanded' : 'collapsed'}`}>
                        {agreement.description}
                      </div>
                      {agreement.description.length > 100 && (
                        <button 
                          className="show-more-btn"
                          onClick={() => toggleDescription(agreement.id)}
                        >
                          {expandedDescriptions.has(agreement.id) ? (
                            <>
                              Show Less
                              <i className="fas fa-chevron-up"></i>
                            </>
                          ) : (
                            <>
                              Show More
                              <i className="fas fa-chevron-down"></i>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td>
                      <a href={agreement.links} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(agreement)}
                        title="Edit Agreement"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(agreement)}
                        title="Delete Agreement"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="empty-table">
                  <td colSpan="13">
                    <div className="empty-state">
                      <i className="fas fa-file-contract"></i>
                      <p>No agreements found</p>
                      <p className="empty-subtitle">Add a new agreement to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="pagination">
            <button 
              className="page-btn" 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {visiblePages.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="page-ellipsis">...</span>
                ) : (
                  <button
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            <button 
              className="page-btn" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Agreement</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <EditAgreementForm 
              agreement={editingAgreement}
              onSubmit={handleUpdateAgreement}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}

      {/* Add Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="modal-overlay">
          <div className="delete-confirm">
            <h3>Delete Agreement</h3>
            <p>Are you sure you want to delete the agreement with:</p>
            <p className="agreement-name">{deleteConfirm.agreementName}</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="delete-actions">
              <button 
                className="cancel-btn" 
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

export default AllAgreements; 