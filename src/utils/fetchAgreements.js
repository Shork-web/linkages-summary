import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase-config';
import { auth } from '../firebase-config';

export const subscribeToAgreements = (callback, statusFilter = null) => {
  // Check if user is authenticated
  if (!auth.currentUser) {
    console.error('User not authenticated');
    callback([]);
    return () => {};
  }

  try {
    const agreementsRef = collection(db, 'agreementform');
    let q = agreementsRef;
    
    if (statusFilter === 'renewal') {
      // For renewal page, only check forRenewal flag
      q = query(agreementsRef, where('forRenewal', '==', true));
    } else if (statusFilter) {
      // Handle 'renewed' status as 'active'
      if (statusFilter === 'active') {
        q = query(
          agreementsRef, 
          where('status', 'in', ['active', 'renewed'])
        );
      } else {
        q = query(agreementsRef, where('status', '==', statusFilter.toLowerCase()));
      }
    }

    return onSnapshot(q, 
      (querySnapshot) => {
        const agreements = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Convert 'renewed' status to 'active'
          if (data.status && data.status.toLowerCase() === 'renewed') {
            data.status = 'active';
          }
          // Add expiration check for active agreements
          if (statusFilter === 'active' && data.dateExpired) {
            const isExpired = new Date(data.dateExpired) < new Date();
            if (isExpired) return; // Skip if expired
          }
          agreements.push({ id: doc.id, ...data });
        });
        callback(agreements);
      },
      (error) => {
        console.error('Error fetching agreements:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up listener:', error);
    callback([]);
    return () => {};
  }
}; 