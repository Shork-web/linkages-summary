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
    
    if (statusFilter) {
      q = query(agreementsRef, where('status', '==', statusFilter));
    }

    return onSnapshot(q, 
      (querySnapshot) => {
        const agreements = [];
        querySnapshot.forEach((doc) => {
          agreements.push({ id: doc.id, ...doc.data() });
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