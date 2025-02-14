import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';
import { useNavigate } from 'react-router-dom';
import './RenewalAgreements.css';

const RenewalAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    const agreementsRef = collection(db, 'agreementform');
    // Query for agreements where forRenewal is true AND status is not 'expired'
    const q = query(
      agreementsRef, 
      where('forRenewal', '==', true),
      where('status', 'in', ['active', 'pending'])
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const agreementsData = [];
      querySnapshot.forEach((doc) => {
        agreementsData.push({ id: doc.id, ...doc.data() });
      });
      setAgreements(agreementsData);
    });

    return () => unsubscribe();
  }, [navigate]);

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
          <h2>Agreements For Renewal</h2>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search agreements for renewal..."
            />
          </div>
          <div className="filter-group">
            <select defaultValue="">
              <option value="">All Types</option>
              <option value="MOU">MOU</option>
              <option value="MOA">MOA</option>
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
            {agreements.length > 0 ? (
              agreements.map(agreement => (
                <tr key={agreement.id} className="near-renewal">
                  <td>{agreement.name}</td>
                  <td>{agreement.address}</td>
                  <td>{agreement.signedBy}</td>
                  <td>{agreement.designation}</td>
                  <td>{agreement.agreementType}</td>
                  <td>{agreement.dateSigned}</td>
                  <td>{agreement.validity}</td>
                  <td>{agreement.dateExpired}</td>
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