import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import EditCompanyModal from './EditCompanyModal';
import './CompanyList.css';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
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
    
    const unsubscribe = onSnapshot(companiesRef, (snapshot) => {
      const companiesData = [];
      snapshot.forEach((doc) => {
        companiesData.push({ id: doc.id, ...doc.data() });
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
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
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

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'companyMOA', deleteConfirm.companyId));
      setNotification({
        message: `Successfully deleted ${deleteConfirm.companyName}`,
        type: 'success'
      });
      setDeleteConfirm({ show: false, companyId: null, companyName: '' });
    } catch (error) {
      setNotification({
        message: `Error deleting company: ${error.message}`,
        type: 'error'
      });
    }
    setTimeout(() => setNotification(null), 3000);
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
      message: message || 'Company updated successfully' // Provide fallback message
    });
    setTimeout(() => setNotification(null), 3000); // Hide notification after 3 seconds
  };

  const toggleExpand = (companyId) => {
    setExpandedCompanies(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
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
        <p>Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="company-list-container">
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
                className="confirm-btn"
                onClick={handleDelete}
              >
                Delete
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
        <h2 className="company-list-title">Company List</h2>
        
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
        <table className="company-list-table">
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
                  <i className="fas fa-clock"></i> With Expiration
                </div>
              </th>
              <th className="validity-col">
                <div className="th-content">
                  <i className="fas fa-hourglass-half"></i> Validity
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
                
                const firstEntry = company.collegeEntries && company.collegeEntries.length > 0 
                  ? company.collegeEntries[0] 
                  : { companyType: company.companyType || 'N/A' };
                
                return (
                  <React.Fragment key={company.id}>
                    <tr className={hasMultipleEntries ? "has-multiple-entries" : ""}>
                      <td className="company-name-cell">{company.companyName}</td>
                      <td className="address-cell" title={company.companyAddress}>
                        {company.companyAddress}
                      </td>
                      <td className="coordinates-cell">{company.companyLongitude}</td>
                      <td className="coordinates-cell">{company.companyLatitude}</td>
                      <td className="year-cell">{company.moaYear}</td>
                      <td className="type-cell">
                        <div className="company-type-cell">
                          <span className="company-type-badge">{firstEntry.companyType || company.companyType}</span>
                          {hasMultipleEntries && (
                            <button 
                              className="toggle-entries-btn"
                              onClick={() => toggleExpand(company.id)}
                              title={isExpanded ? "Collapse entries" : "Show all entries"}
                            >
                              <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="expiration-cell">
                        <span className={`expiration-badge ${company.withExpiration ? 'yes' : 'no'}`}>
                          {company.withExpiration ? 'Yes' : 'No'}
                    </span>
                  </td>
                      <td className="validity-cell">
                        {company.withExpiration 
                          ? `${company.moaValidity} ${company.validityUnit}` 
                          : <span className="no-expiry">Active</span>
                        }
                      </td>
                      <td className="remarks-cell" title={company.moaRemarks}>
                        {company.moaRemarks}
                      </td>
                  <td className="company-action-buttons">
                    <button 
                      className="company-action-btn company-edit-btn" 
                      title="Edit"
                      onClick={() => handleEditCompany(company)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="company-action-btn company-delete-btn" 
                      title="Delete"
                      onClick={() => confirmDelete(company.id, company.companyName)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
                    
                    {hasMultipleEntries && isExpanded && company.collegeEntries.slice(1).map((entry, index) => (
                      <tr key={`${company.id}-entry-${index + 1}`} className="additional-entry-row">
                        <td colSpan="5" className="additional-entry-spacer"></td>
                        <td>
                          <div className="additional-entry">
                            <span className="entry-type">{entry.companyType || 'N/A'}</span>
                          </div>
                        </td>
                        <td colSpan="4" className="additional-entry-spacer"></td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="10">
                  <div className="company-empty-state">
                    <i className="fas fa-building"></i>
                    <p>No companies found</p>
                    <p className="company-empty-subtitle">
                      {(filters.search || filters.type) 
                        ? 'Try adjusting your filters'
                        : 'Add a new company to get started'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredCompanies.length > 0 && (
        <div className="company-pagination-container">
          <div className="company-pagination">
            <button 
              className="company-page-btn" 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {visiblePages.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="company-page-ellipsis">...</span>
                ) : (
                  <button
                    className={`company-page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            <button 
              className="company-page-btn" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <div className="company-page-info">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCompanies.length)} of {filteredCompanies.length} companies
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList; 