import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase-config';
import { getDetailedTimeRemaining } from '../utils/dateUtils';

const useAgreementNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    try {
      // Listen for agreement notifications
      const agreementsRef = collection(db, 'agreementform');
      const agreementsQuery = query(agreementsRef);
      
      // Listen for company MOA notifications
      const companiesRef = collection(db, 'companyMOA');
      const companiesQuery = query(companiesRef);
      
      let agreementUnsubscribe;
      let companyUnsubscribe;
      
      // Get agreements
      agreementUnsubscribe = onSnapshot(agreementsQuery, (agreementsSnapshot) => {
        const expiringAgreements = [];
        
        agreementsSnapshot.forEach((doc) => {
          const agreement = { id: doc.id, ...doc.data(), type: 'agreement' };
          
          // Check if agreement exists and has required fields
          if (!agreement.dateExpired || !agreement.status) {
            return;
          }
          
          // Check if agreement will expire within 2 years
          const timeRemaining = getDetailedTimeRemaining(agreement.dateExpired);
          if (timeRemaining.years < 2 && agreement.status.toLowerCase() === 'active') {
            // Add urgency level to the agreement
            agreement.urgency = getUrgencyLevel(timeRemaining);
            expiringAgreements.push(agreement);
          }
        });
        
        // Get companies
        companyUnsubscribe = onSnapshot(companiesQuery, (companiesSnapshot) => {
          const expiringCompanies = [];
          
          companiesSnapshot.forEach((doc) => {
            const company = { id: doc.id, ...doc.data(), type: 'company' };
            
            // Check if company exists and has expiration
            if (company.withExpiration && company.moaExpirationDate) {
              const timeRemaining = getDetailedTimeRemaining(company.moaExpirationDate);
              
              // Check if company will expire within 2 years
              if (timeRemaining.years < 2) {
                // Add urgency level to the company
                company.urgency = getUrgencyLevel(timeRemaining);
                expiringCompanies.push({
                  id: company.id,
                  name: company.companyName,
                  address: company.companyAddress,
                  dateExpired: company.moaExpirationDate,
                  agreementType: 'MOA',
                  partnerType: 'Company',
                  status: company.moaStatus || 'Active',
                  type: 'company',
                  urgency: company.urgency
                });
              }
            }
          });
          
          // Combine and sort by expiration date (ascending)
          const combinedNotifications = [...expiringAgreements, ...expiringCompanies].sort((a, b) => 
            new Date(a.dateExpired) - new Date(b.dateExpired)
          );
          
          setNotifications(combinedNotifications);
          setLoading(false);
        }, handleError);
      }, handleError);
      
      return () => {
        if (agreementUnsubscribe) agreementUnsubscribe();
        if (companyUnsubscribe) companyUnsubscribe();
      };
    } catch (err) {
      handleError(err);
      return () => {};
    }
  }, []);
  
  // Error handler
  const handleError = (err) => {
    console.error('Error fetching notifications:', err);
    setError(err);
    setLoading(false);
  };

  // Helper function to determine urgency level
  const getUrgencyLevel = (timeRemaining) => {
    const { years, months } = timeRemaining;
    
    if (years === 0 && months === 0) {
      return 'expired'; // Already expired
    }
    if (years === 0 && months <= 3) {
      return 'critical'; // Critical: less than 3 months
    }
    if (years === 0 && months <= 6) {
      return 'high'; // High: less than 6 months
    }
    if (years === 0) {
      return 'medium'; // Medium: less than 1 year
    }
    return 'low'; // Low: between 1-2 years
  };

  // Helper function to format remaining time
  const formatRemainingTime = (dateExpired) => {
    const { years, months } = getDetailedTimeRemaining(dateExpired);
    
    if (years === 0 && months === 0) {
      return 'Expired';
    } else if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''} left`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''} left`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} left`;
    }
  };

  return { 
    notifications, 
    loading, 
    error,
    formatRemainingTime,
    getUrgencyLevel
  };
};

export default useAgreementNotifications; 