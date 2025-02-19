import React, { useEffect, useState } from 'react';
import { subscribeToAgreements } from '../../utils/fetchAgreements';
import './RenewalAgreements.css';

const RenewalAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    partnerType: ''
  });
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  useEffect(() => {
    const unsubscribe = subscribeToAgreements((fetchedAgreements) => {
      const renewalAgreements = fetchedAgreements.filter(agreement => agreement.forRenewal);
      setAgreements(renewalAgreements);
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

  const normalizePartnerType = (type) => {
    const typeMap = {
      'academe': 'Academe',
      'ACADEME': 'Academe',
      'industry': 'Industry',
      'INDUSTRY': 'Industry',
      'government': 'Government',
      'GOVERNMENT': 'Government',
      'Local Government': 'Government'
    };
    return typeMap[type] || type;
  };

  const filteredAgreements = agreements.filter(agreement => {
    const searchTerm = filters.search.toLowerCase().trim();
    const normalizedPartnerType = normalizePartnerType(agreement.partnerType);
    
    const matchesSearch = [
      agreement.name,
      agreement.address,
      agreement.signedBy,
      agreement.designation,
      agreement.description,
      agreement.agreementType,
      normalizedPartnerType
    ].some(field => 
      String(field || '').toLowerCase().includes(searchTerm)
    );

    const matchesType = filters.type === '' || agreement.agreementType === filters.type;
    const matchesPartnerType = filters.partnerType === '' || normalizedPartnerType === filters.partnerType;

    return matchesSearch && matchesType && matchesPartnerType;
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
          <h2>Agreements for Renewal</h2>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search agreements..."
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
              <option value="Industry">Industry</option>
              <option value="Academe">Academe</option>
              <option value="Government">Government</option>
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
              <th>Status</th>
              <th>Description</th>
              <th>Links</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgreements.length > 0 ? (
              filteredAgreements.map(agreement => (
                <tr key={agreement.id} className="near-renewal">
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
                <td colSpan="11">
                  <div className="empty-state">
                    <i className="fas fa-history"></i>
                    <p>No agreements for renewal</p>
                    <p className="empty-subtitle">All agreements are up to date</p>
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

export default RenewalAgreements; 