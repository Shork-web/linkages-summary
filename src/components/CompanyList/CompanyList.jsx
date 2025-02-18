import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase-config';
import './CompanyList.css';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });

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

  if (loading) {
    return <div className="loading">Loading companies...</div>;
  }

  return (
    <div className="company-list-container">
      <h2>Company List</h2>
      <div className="list-header">
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search companies..."
            />
          </div>
          <div className="filter-group">
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
        <table className="companies-table">
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
                    <span className={`status-badge status-${company.moaStatus.toLowerCase()}`}>
                      {company.moaStatus}
                    </span>
                  </td>
                  <td>{company.companyType}</td>
                  <td>{company.withExpiration ? 'Yes' : 'No'}</td>
                  <td>{company.moaValidity} years</td>
                  <td>{company.moaRemarks}</td>
                  <td className="action-buttons">
                    <button className="action-btn view-btn" title="View Details">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="action-btn edit-btn" title="Edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="action-btn delete-btn" title="Delete">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11">
                  <div className="empty-state">
                    <i className="fas fa-building"></i>
                    <p>No companies found</p>
                    <p className="empty-subtitle">
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