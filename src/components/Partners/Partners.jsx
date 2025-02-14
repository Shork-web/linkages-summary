import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';
import { useNavigate } from 'react-router-dom';
import './Partners.css';

const Partners = () => {
  const [partners, setPartners] = useState([]);
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
          const partnerKey = `${agreement.partnerType}-${agreement.partnerName}`;
          
          if (!partnersMap.has(partnerKey)) {
            partnersMap.set(partnerKey, {
              name: agreement.partnerName,
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
              placeholder="Search partners..."
            />
          </div>
          <div className="filter-group">
            <select defaultValue="">
              <option value="">All Types</option>
              <option value="academic">Academic</option>
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
              <th>Partner Name</th>
              <th>Type</th>
              <th>Total Agreements</th>
              <th>Active</th>
              <th>Pending</th>
              <th>For Renewal</th>
              <th>Expired</th>
            </tr>
          </thead>
          <tbody>
            {partners.length > 0 ? (
              partners.map((partner, index) => (
                <tr key={index}>
                  <td>{partner.name}</td>
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
                <td colSpan="7">
                  <div className="empty-state">
                    <i className="fas fa-handshake"></i>
                    <p>No partners found</p>
                    <p className="empty-subtitle">Add partners through agreements</p>
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