import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';
import { useNavigate } from 'react-router-dom';
import './Partners.css';

const Partners = () => {
  const [partnerStats, setPartnerStats] = useState({
    Academe: { MOU: 0, MOA: 0, total: 0 },
    Industry: { MOU: 0, MOA: 0, total: 0 },
    Government: { MOU: 0, MOA: 0, total: 0 }
  });
  const navigate = useNavigate();

  // Helper function to normalize partner type
  const normalizePartnerType = (type) => {
    if (!type) return '';
    
    // Convert to lowercase for comparison
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('academe')) return 'Academe';
    if (lowerType.includes('industry')) return 'Industry';
    if (lowerType.includes('government') || lowerType.includes('local')) return 'Government';
    
    // If no match, capitalize first letter
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

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
          Academe: { MOU: 0, MOA: 0, total: 0 },
          Industry: { MOU: 0, MOA: 0, total: 0 },
          Government: { MOU: 0, MOA: 0, total: 0 }
        };
        
        querySnapshot.forEach((doc) => {
          const agreement = doc.data();
          const normalizedType = normalizePartnerType(agreement.partnerType);
          
          // Only count if it matches one of our main categories
          if (stats[normalizedType]) {
            const agreementType = agreement.agreementType?.toUpperCase() || '';
            if (agreementType === 'MOA' || agreementType === 'MOU') {
              stats[normalizedType][agreementType]++;
              stats[normalizedType].total++;
            }
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
              <h3>{partnerType} Partners</h3>
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