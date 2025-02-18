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
    const unsubscribe = onSnapshot(
      collection(db, 'companyMOA'),
      (snapshot) => {
        const companiesData = [];
        snapshot.forEach((doc) => {
          companiesData.push({ id: doc.id, ...doc.data() });
        });
        setCompanies(companiesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching companies:", error);
        setLoading(false);
      }
    );

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
    const searchTerm = filters.search.toLowerCase().trim();
    
    // If no filters are applied, return all companies
    if (!searchTerm && !filters.type && !filters.status) {
      return true;
    }

    // Check if company matches search term
    const matchesSearch = !searchTerm || [
      company.company,
      company.address,
      company.type,
      company.status,
      company.year?.toString()
    ].some(field => field?.toLowerCase().includes(searchTerm));

    // Check if company matches type filter
    const matchesType = !filters.type || company.type === filters.type;

    // Check if company matches status filter
    const matchesStatus = !filters.status || company.status === filters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Loading companies...</span>
      </div>
    );
  }

  return (
    <div className="company-list-container">
      <div className="list-header">
        <h2>Company List</h2>
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
              <th>Company Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Address</th>
              <th>Year</th>
              <th>Validity</th>
              <th>Expiration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map(company => (
                <tr key={company.id}>
                  <td>{company.company}</td>
                  <td>{company.type}</td>
                  <td>
                    <span className={`status-badge status-${company.status.toLowerCase()}`}>
                      {company.status}
                    </span>
                  </td>
                  <td>{company.address}</td>
                  <td>{company.year}</td>
                  <td>{company.validity} years</td>
                  <td>{new Date(company.expirationDate).toLocaleDateString()}</td>
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
                <td colSpan="8">
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