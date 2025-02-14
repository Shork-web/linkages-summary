import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';
import { useNavigate } from 'react-router-dom';
import './Partners.css';

const Partners = () => {
  const [partnerStats, setPartnerStats] = useState({
    academe: { MOU: 0, MOA: 0, total: 0 },
    industry: { MOU: 0, MOA: 0, total: 0 },
    government: { MOU: 0, MOA: 0, total: 0 }
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
        const stats = {
          academe: { MOU: 0, MOA: 0, total: 0 },
          industry: { MOU: 0, MOA: 0, total: 0 },
          government: { MOU: 0, MOA: 0, total: 0 }
        };
        
        querySnapshot.forEach((doc) => {
          const agreement = doc.data();
          const partnerKey = agreement.partnerType;
          
          if (stats[partnerKey]) {
            stats[partnerKey][agreement.agreementType]++;
            stats[partnerKey].total++;
          }
        });

        setPartnerStats(stats);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="partners-container">
      <h2 className="partners-title">Partner Statistics</h2>
      <div className="partner-stats-grid">
        {Object.entries(partnerStats).map(([partnerType, stats]) => (
          <div key={partnerType} className={`partner-stat-card ${partnerType}`}>
            <div className="partner-stat-header">
              <h3>{partnerType.charAt(0).toUpperCase() + partnerType.slice(1)} Partners</h3>
              <span className="total-count">{stats.total} Total</span>
            </div>
            <div className="agreement-type-counts">
              <div className="count-item">
                <span className="count-label">MOU</span>
                <span className="count-value">{stats.MOU}</span>
              </div>
              <div className="count-item">
                <span className="count-label">MOA</span>
                <span className="count-value">{stats.MOA}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Partners; 