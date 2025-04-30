import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import EditCompanyModal from '../CompanyList/EditCompanyModal';
import '../CompanyList/CompanyList.css';
import './ExpiredCompanies.css';

const ExpiredCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
  });
  const [notification, setNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    companyId: null,
    companyName: ''
  });
  const [editingCompany, setEditingCompany] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [visiblePages, setVisiblePages] = useState([]);
  const [expandedCompanies, setExpandedCompanies] = useState({});
  const tableContainerRef = useRef(null);

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
    const companiesRef = collection(db, 'companyMOA');
    
    // Get current date for filtering expired companies
    const currentDate = new Date();
    
    const unsubscribe = onSnapshot(companiesRef, (snapshot) => {
      const companiesData = [];
      
      snapshot.forEach((doc) => {
        const companyData = { id: doc.id, ...doc.data() };
        
        // Check if the company has an expiration date and is expired
        if (companyData.withExpiration && companyData.moaExpirationDate) {
          const expirationDate = new Date(companyData.moaExpirationDate);
          if (expirationDate < currentDate) {
            companiesData.push(companyData);
          }
        }
      });
      
      setCompanies(companiesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const filteredCompanies = companies
    .filter(company => {
      // Search filter - check company name, address, and remarks
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        company.companyName.toLowerCase().includes(searchTerm) ||
        (company.companyAddress && company.companyAddress.toLowerCase().includes(searchTerm)) ||
        (company.moaRemarks && company.moaRemarks.toLowerCase().includes(searchTerm));
      
      // Type filter - check both main company type and all college entries
      const matchesType = !filters.type || 
        company.companyType === filters.type || 
        (company.collegeEntries && company.collegeEntries.some(entry => entry.companyType === filters.type));
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // First sort by days since expiration (descending)
      const dateA = new Date(a.moaExpirationDate);
      const dateB = new Date(b.moaExpirationDate);
      const now = new Date();
      const daysExpiredA = Math.floor((now - dateA) / (1000 * 60 * 60 * 24));
      const daysExpiredB = Math.floor((now - dateB) / (1000 * 60 * 60 * 24));
      
      if (daysExpiredA !== daysExpiredB) {
        return daysExpiredB - daysExpiredA; // Most recently expired first
      }
      
      // If days since expiration are the same, sort by name
      const nameA = a.companyName.toLowerCase();
      const nameB = b.companyName.toLowerCase();

      // Check if both names start with a number
      const isNumberA = /^\d/.test(nameA);
      const isNumberB = /^\d/.test(nameB);

      if (isNumberA && !isNumberB) return -1;
      if (!isNumberA && isNumberB) return 1;

      return nameA.localeCompare(nameB);
    });

  // Calculate pagination
  const calculateVisiblePages = (totalPages, currentPage) => {
    let pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // If total pages is less than or equal to max visible, show all pages
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always try to show 5 pages when possible
      let startPage = Math.max(currentPage - 2, 1);
      let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
      
      // Adjust start page if we're near the end
      if (endPage === totalPages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
      
      // Generate the page numbers
      pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    }
    
    setVisiblePages(pages);
  };

  // Get current companies
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  useEffect(() => {
    calculateVisiblePages(totalPages, currentPage);
  }, [currentPage, totalPages]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      setDeletingCompanyId(deleteConfirm.companyId);
      
      // Optimistic update - remove from local state immediately
      setCompanies(prevCompanies => 
        prevCompanies.filter(company => company.id !== deleteConfirm.companyId)
      );
      
      // Close confirmation modal
      setDeleteConfirm({ show: false, companyId: null, companyName: '' });
      
      // Perform actual delete operation
      await deleteDoc(doc(db, 'companyMOA', deleteConfirm.companyId));
      
      setNotification({
        message: `Successfully deleted ${deleteConfirm.companyName}`,
        type: 'success'
      });
    } catch (error) {
      console.error("Delete error:", error);
      
      // Restore the company in case of error
      const companiesRef = collection(db, 'companyMOA');
      const unsubscribe = onSnapshot(companiesRef, (snapshot) => {
        const companiesData = [];
        const currentDate = new Date();
        
        snapshot.forEach((doc) => {
          const companyData = { id: doc.id, ...doc.data() };
          if (companyData.withExpiration && companyData.moaExpirationDate) {
            const expirationDate = new Date(companyData.moaExpirationDate);
            if (expirationDate < currentDate) {
              companiesData.push(companyData);
            }
          }
        });
        
        setCompanies(companiesData);
        unsubscribe();
      });
      
      setNotification({
        message: `Error deleting company: ${error.message}`,
        type: 'error'
      });
    } finally {
      setDeleteLoading(false);
      setDeletingCompanyId(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const confirmDelete = (id, name) => {
    setDeleteConfirm({
      show: true,
      companyId: id,
      companyName: name
    });
  };

  const cancelDelete = () => {
    setDeleteConfirm({
      show: false,
      companyId: null,
      companyName: ''
    });
  };

  const handleEditCompany = (company) => {
    setEditingCompany({
      ...company,
      validityUnit: company.validityUnit || 'years' // Default to 'years' if not set
    });
  };

  const handleUpdate = (message) => {
    setNotification({
      type: 'success',
      message: message || 'Company updated successfully'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleExpand = (companyId) => {
    setExpandedCompanies(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
  };

  // Calculate days since expiration
  const getDaysSinceExpiration = (expirationDate) => {
    const expDate = new Date(expirationDate);
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - expDate.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };

  // Add scroll indicator logic
  useEffect(() => {
    const handleScroll = () => {
      if (!tableContainerRef.current) return;
      
      const container = tableContainerRef.current;
      const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
      
      if (hasHorizontalScroll) {
        const isScrolledLeft = container.scrollLeft > 0;
        const isScrolledRight = container.scrollLeft + container.clientWidth < container.scrollWidth - 5;
        
        if (isScrolledLeft) {
          container.classList.add('scroll-left');
        } else {
          container.classList.remove('scroll-left');
        }
        
        if (isScrolledRight) {
          container.classList.add('scroll-right');
        } else {
          container.classList.remove('scroll-right');
        }
      }
    };
    
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      
      // Check again after content might have changed
      setTimeout(handleScroll, 500);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [currentCompanies]);

  if (loading) {
    return (
      <div className="company-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading expired companies...</p>
      </div>
    );
  }

  return (
    <div className="expired-companies-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{notification.message}</span>
          </div>
          <button className="notification-close" onClick={() => setNotification(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="modal-overlay">
          <div className="delete-confirm">
            <h3>Delete Company</h3>
            <p>Are you sure you want to delete the company with:</p>
            <p className="warning-text">{deleteConfirm.companyName}</p>
            <div className="delete-actions">
              <button
                className="cancel-btn"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className={`confirm-btn ${deleteLoading ? 'loading' : ''}`}
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onUpdate={handleUpdate}
        />
      )}

      <div className="company-list-header">
        <h2 className="company-list-title">Expired Companies</h2>
        
        {/* Search and Filter Section */}
        <div className="company-filters-section">
          <div className="company-search-box">
            <i className="fas fa-search company-search-icon"></i>
            <input
              type="text"
              className="company-search-input"
              placeholder="Search by name, address or remarks..."
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="company-filter-controls">
            <select
              className="company-filter-select"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {companyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="company-table-container" ref={tableContainerRef}>
        <table className="expired-table">
          <thead>
            <tr>
              <th className="company-name-col">
                <div className="th-content">
                  <i className="fas fa-building"></i> Company
                </div>
              </th>
              <th className="address-col">
                <div className="th-content">
                  <i className="fas fa-map-marker-alt"></i> Address
                </div>
              </th>
              <th className="coordinates-col">
                <div className="th-content">
                  <i className="fas fa-location-arrow"></i> Longitude
                </div>
              </th>
              <th className="coordinates-col">
                <div className="th-content">
                  <i className="fas fa-location-arrow"></i> Latitude
                </div>
              </th>
              <th className="year-col">
                <div className="th-content">
                  <i className="fas fa-calendar-alt"></i> Year
                </div>
              </th>
              <th className="type-col">
                <div className="th-content">
                  <i className="fas fa-tag"></i> Type
                </div>
              </th>
              <th className="expiration-col">
                <div className="th-content">
                  <i className="fas fa-exclamation-triangle"></i> Expired
                </div>
              </th>
              <th className="validity-col">
                <div className="th-content">
                  <i className="fas fa-hourglass-end"></i> Validity
                </div>
              </th>
              <th className="remarks-col">
                <div className="th-content">
                  <i className="fas fa-comment-alt"></i> Remarks
                </div>
              </th>
              <th className="actions-col">
                <div className="th-content">
                  <i className="fas fa-cog"></i> Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentCompanies.length > 0 ? (
              currentCompanies.map(company => {
                const hasMultipleEntries = company.collegeEntries && company.collegeEntries.length > 1;
                const isExpanded = expandedCompanies[company.id] || false;
                const daysSinceExpiration = getDaysSinceExpiration(company.moaExpirationDate);
                
                const firstEntry = company.collegeEntries && company.collegeEntries.length > 0 
                  ? company.collegeEntries[0] 
                  : { companyType: company.companyType || 'N/A' };
                
                return (
                  <React.Fragment key={company.id}>
                    <tr className={`company-row ${isExpanded ? 'expanded' : ''}`}>
                      <td className="company-name-cell">
                        <div className="company-name-container">
                          <span className="company-name">{company.companyName}</span>
                          {hasMultipleEntries && (
                            <button 
                              className="toggle-expand-btn"
                              onClick={() => toggleExpand(company.id)}
                              aria-label={isExpanded ? "Collapse details" : "Expand details"}
                            >
                              <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                            </button>
                          )}
                        </div>
                      </td>
                      <td>{company.companyAddress || 'N/A'}</td>
                      <td>{company.companyLongitude || 'N/A'}</td>
                      <td>{company.companyLatitude || 'N/A'}</td>
                      <td>{company.moaYear || 'N/A'}</td>
                      <td>
                        <span className="company-type-badge">
                          {firstEntry.companyType || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="expired-days-badge">
                          {daysSinceExpiration} days
                        </span>
                      </td>
                      <td>
                        <div className="validity-info">
                          <span>{company.moaValidity} {company.validityUnit || 'years'}</span>
                          {company.moaExpirationDate && (
                            <div className="expiration-date">
                              Expired: {new Date(company.moaExpirationDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="remarks-cell">
                          {company.moaRemarks || 'No remarks provided'}
                        </div>
                      </td>
                      <td>
                        <div className="company-actions">
                          <button 
                            className="edit-btn" 
                            onClick={() => handleEditCompany(company)}
                            aria-label="Edit company"
                            title="Edit company"
                          >
                            <i className="fas fa-edit"></i>
                            <span className="action-label">Edit</span>
                          </button>
                          <button 
                            className={`delete-btn ${deletingCompanyId === company.id ? 'loading' : ''}`}
                            onClick={() => confirmDelete(company.id, company.companyName)}
                            disabled={deleteLoading && deletingCompanyId === company.id}
                            aria-label="Delete company"
                            title="Delete company"
                          >
                            {deleteLoading && deletingCompanyId === company.id ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <>
                                <i className="fas fa-trash-alt"></i>
                                <span className="action-label">Delete</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded details row */}
                    {isExpanded && hasMultipleEntries && (
                      <tr className="expanded-details-row">
                        <td colSpan="10">
                          <div className="expanded-details">
                            <h4>Multiple College Entries</h4>
                            <table className="college-entries-table">
                              <thead>
                                <tr>
                                  <th>College</th>
                                  <th>Department</th>
                                  <th>Type</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {company.collegeEntries.map((entry, index) => (
                                  <tr key={index}>
                                    <td>{entry.college || 'N/A'}</td>
                                    <td>{entry.department || 'N/A'}</td>
                                    <td>{entry.companyType || 'N/A'}</td>
                                    <td>
                                      <span className={`status-badge status-${entry.status?.toLowerCase() || 'active'}`}>
                                        {entry.status || 'Active'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="no-companies-message">
                  <div className="no-companies-content">
                    <i className="fas fa-info-circle"></i>
                    <p>No expired companies found matching your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredCompanies.length > 0 && (
        <>
          <div className="pagination-container">
            <button 
              className="pagination-btn first-btn" 
              onClick={handleFirstPage} 
              disabled={currentPage === 1}
              aria-label="Go to first page"
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button 
              className="pagination-btn prev-btn" 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              aria-label="Go to previous page"
            >
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            
            <div className="pagination-pages">
              {visiblePages.map((page, index) => (
                <button
                  key={index}
                  className={`pagination-page-btn ${page === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : null}
                >
                  {page}
                </button>
              ))}
              {totalPages > Math.max(...visiblePages) && (
                <>
                  <span className="pagination-page-btn ellipsis">...</span>
                  <button
                    className="pagination-page-btn"
                    onClick={() => setCurrentPage(totalPages)}
                    aria-label={`Go to page ${totalPages}`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button 
              className="pagination-btn next-btn" 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages || totalPages === 0}
              aria-label="Go to next page"
            >
              Next <i className="fas fa-chevron-right"></i>
            </button>
            <button 
              className="pagination-btn last-btn" 
              onClick={handleLastPage} 
              disabled={currentPage === totalPages || totalPages === 0}
              aria-label="Go to last page"
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
          
          {/* Pagination info */}
          <div className="pagination-info">
            Showing <strong>{Math.min(indexOfFirstItem + 1, filteredCompanies.length)}</strong> to <strong>{Math.min(indexOfLastItem, filteredCompanies.length)}</strong> of <strong>{filteredCompanies.length}</strong> companies
          </div>
        </>
      )}
    </div>
  );
};

export default ExpiredCompanies; 