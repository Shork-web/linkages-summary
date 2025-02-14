import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';
import { useNavigate } from 'react-router-dom';
import './Partners.css';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    type: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    const agreementsRef = collection(db, 'agreementform');
    
    const unsubscribe = onSnapshot(
      agreementsRef,
      (querySnapshot) => {
        const partnersMap = new Map();
        
        querySnapshot.forEach((doc) => {
          const agreement = doc.data();
          const partnerKey = agreement.partnerType;
          
          if (!partnersMap.has(partnerKey)) {
            partnersMap.set(partnerKey, {
              type: agreement.partnerType,
              totalAgreements: 1,
              activeAgreements: agreement.status === 'active' ? 1 : 0,
              pendingAgreements: agreement.status === 'pending' ? 1 : 0,
              expiredAgreements: agreement.status === 'expired' ? 1 : 0,
              renewalAgreements: agreement.forRenewal ? 1 : 0
            });
          } else {
            const existing = partnersMap.get(partnerKey);
            partnersMap.set(partnerKey, {
              ...existing,
              totalAgreements: existing.totalAgreements + 1,
              activeAgreements: existing.activeAgreements + (agreement.status === 'active' ? 1 : 0),
              pendingAgreements: existing.pendingAgreements + (agreement.status === 'pending' ? 1 : 0),
              expiredAgreements: existing.expiredAgreements + (agreement.status === 'expired' ? 1 : 0),
              renewalAgreements: existing.renewalAgreements + (agreement.forRenewal ? 1 : 0)
            });
          }
        });

        setPartners(Array.from(partnersMap.values()));
      },
      (error) => {
        console.error('Error fetching partners:', error);
        setPartners([]);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter partners based on search and type
  const filteredPartners = partners.filter(partner => {
    const matchesType = !filters.type || partner.type === filters.type;
    const matchesSearch = !filters.search || 
      partner.type.toLowerCase().includes(filters.search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="agreements-container">
      <div className="agreements-header">
        <div className="header-title">
          <h2>Partners</h2>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search partners..."
            />
          </div>
          <div className="filter-group">
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
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
              <th>Partner Type</th>
              <th>Total Agreements</th>
              <th>Active</th>
              <th>Pending</th>
              <th>For Renewal</th>
              <th>Expired</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.length > 0 ? (
              filteredPartners.map((partner, index) => (
                <tr key={index}>
                  <td>
                    <span className={`partner-type-badge ${partner.type}`}>
                      {partner.type}
                    </span>
                  </td>
                  <td>{partner.totalAgreements}</td>
                  <td>{partner.activeAgreements}</td>
                  <td>{partner.pendingAgreements}</td>
                  <td>{partner.renewalAgreements}</td>
                  <td>{partner.expiredAgreements}</td>
                </tr>
              ))
            ) : (
              <tr className="empty-table">
                <td colSpan="6">
                  <div className="empty-state">
                    <i className="fas fa-handshake"></i>
                    <p>No partners found</p>
                    <p className="empty-subtitle">
                      {filters.type || filters.search 
                        ? 'Try adjusting your filters'
                        : 'Add partners through agreements'}
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

export default Partners; 