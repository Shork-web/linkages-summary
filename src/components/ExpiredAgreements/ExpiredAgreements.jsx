import React, { useEffect, useState } from 'react';
import { subscribeToAgreements } from '../../utils/fetchAgreements';
import './ExpiredAgreements.css';
import ExcelExport from '../ExcelExport/ExcelExport';

const ExpiredAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    partnerType: ''
  });

  useEffect(() => {
    const unsubscribe = subscribeToAgreements((fetchedAgreements) => {
      const expiredAgreements = fetchedAgreements.filter(agreement => {
        const isExpired = new Date(agreement.dateExpired) < new Date();
        return (agreement.status.toLowerCase() === 'expired' || isExpired) && !agreement.forRenewal;
      });
      setAgreements(expiredAgreements);
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

  // Filter agreements based on search and type
  const filteredAgreements = agreements.filter(agreement => {
    const searchTerm = filters.search.toLowerCase().trim();
    
    const matchesSearch = [
      agreement.name,
      agreement.address,
      agreement.signedBy,
      agreement.designation,
      agreement.description,
      agreement.agreementType,
      agreement.partnerType
    ].some(field => 
      String(field || '').toLowerCase().includes(searchTerm)
    );

    const matchesType = !filters.type || agreement.agreementType === filters.type;

    return matchesSearch && matchesType;
  });

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

  return (
    <div className="agreements-container">
      <div className="agreements-header">
        <div className="header-title">
          <h2>Expired Agreements</h2>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search expired agreements..."
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
            <ExcelExport agreements={filteredAgreements} />
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
            </tr>
          </thead>
          <tbody>
            {filteredAgreements.length > 0 ? (
              filteredAgreements.map(agreement => (
                <tr key={agreement.id} className="expired">
                  <td>{agreement.name}</td>
                  <td>{agreement.address}</td>
                  <td>{agreement.signedBy}</td>
                  <td>{agreement.designation}</td>
                  <td>{agreement.agreementType}</td>
                  <td>{new Date(agreement.dateSigned).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</td>
                  <td>{agreement.validity} years</td>
                  <td>{new Date(agreement.dateExpired).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</td>
                  <td>{agreement.forRenewal ? 'Yes' : 'No'}</td>
                  <td>{agreement.status}</td>
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
                </tr>
              ))
            ) : (
              <tr className="empty-table">
                <td colSpan="12">
                  <div className="empty-state">
                    <i className="fas fa-times-circle"></i>
                    <p>No expired agreements found</p>
                    <p className="empty-subtitle">
                      {filters.search || filters.type ? 
                        'Try adjusting your filters' : 
                        'All agreements are currently valid'}
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

export default ExpiredAgreements; 