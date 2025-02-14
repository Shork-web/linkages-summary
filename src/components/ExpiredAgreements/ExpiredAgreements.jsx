import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';
import { useNavigate } from 'react-router-dom';
import './ExpiredAgreements.css';

const ExpiredAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    const agreementsRef = collection(db, 'agreementform');
    // Query for agreements where status is 'expired'
    const q = query(agreementsRef, where('status', '==', 'expired'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const agreementsData = [];
      querySnapshot.forEach((doc) => {
        agreementsData.push({ id: doc.id, ...doc.data() });
      });
      setAgreements(agreementsData);
    });

    return () => unsubscribe();
  }, [navigate]);

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
              placeholder="Search expired agreements..."
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
              <th>For Renewal</th>
              <th>Status</th>
              <th>Description</th>
              <th>Links</th>
            </tr>
          </thead>
          <tbody>
            {agreements.length > 0 ? (
              agreements.map(agreement => (
                <tr key={agreement.id} className="expired">
                  <td>{agreement.name}</td>
                  <td>{agreement.address}</td>
                  <td>{agreement.signedBy}</td>
                  <td>{agreement.designation}</td>
                  <td>{agreement.agreementType}</td>
                  <td>{agreement.dateSigned}</td>
                  <td>{agreement.validity}</td>
                  <td>{agreement.dateExpired}</td>
                  <td>{agreement.forRenewal ? 'Yes' : 'No'}</td>
                  <td>
                    <span className="status-badge status-expired">
                      {agreement.status}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {agreement.description}
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
                    <p>No expired agreements</p>
                    <p className="empty-subtitle">All agreements are currently valid</p>
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