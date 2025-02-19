import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import Notification from '../Notification/Notification';
import EditCompanyModal from './EditCompanyModal';
import './CompanyList.css';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });
  const [notification, setNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    companyId: null,
    companyName: ''
  });
  const [editingCompany, setEditingCompany] = useState(null);

  const companyTypes = [
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

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type ? company.companyType === filters.type : true;
    const matchesStatus = filters.status ? company.moaStatus === filters.status : true;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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

  const handleEdit = (company) => {
    setEditingCompany(company);
  };

  const handleUpdate = (message, type = 'success') => {
    setNotification({
      message,
      type
    });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return <div className="company-loading">Loading companies...</div>;
  }

  return (
    <div className="company-list-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
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

      {/* Add the edit modal */}
      {editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onUpdate={handleUpdate}
        />
      )}

      <h2 className="company-list-title">Company List</h2>
      <div className="company-list-header">
        <div className="company-header-controls">
          <div className="company-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search companies..."
            />
          </div>
          <div className="company-filter-group">
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {companyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="For-Update">For Update</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="company-list-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Address</th>
              <th>Longitude</th>
              <th>Latitude</th>
              <th>Year</th>
              <th>Status</th>
              <th>Type</th>
              <th>With Expiration</th>
              <th>Validity</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map(company => (
                <tr key={company.id}>
                  <td>{company.companyName}</td>
                  <td>{company.companyAddress}</td>
                  <td>{company.companyLongitude}</td>
                  <td>{company.companyLatitude}</td>
                  <td>{company.moaYear}</td>
                  <td>
                    <span className={`company-status-badge status-${company.moaStatus.toLowerCase()}`}>
                      {company.moaStatus}
                    </span>
                  </td>
                  <td>{company.companyType}</td>
                  <td>{company.withExpiration ? 'Yes' : 'No'}</td>
                  <td>{company.withExpiration ? `${company.moaValidity} years` : 'Active'}</td>
                  <td>{company.moaRemarks}</td>
                  <td className="company-action-buttons">
                    <button 
                      className="company-action-btn company-edit-btn" 
                      title="Edit"
                      onClick={() => handleEdit(company)}
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
              ))
            ) : (
              <tr>
                <td colSpan="11">
                  <div className="company-empty-state">
                    <i className="fas fa-building"></i>
                    <p>No companies found</p>
                    <p className="company-empty-subtitle">
                      {(filters.search || filters.type || filters.status) 
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
    </div>
  );
};

export default CompanyList; 