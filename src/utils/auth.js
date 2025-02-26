import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';

export const authenticateUser = async (email, password) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('email', '==', email.toLowerCase()),
      where('password', '==', password),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Invalid email or password');
    }

    // Get the first matching document
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Don't return sensitive data
    return {
      id: userDoc.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role
    };
  } catch (error) {
    throw new Error('Authentication failed');
  }
};

export const checkUserStatus = async (email) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return userData.status;
    }
    return null;
  } catch (error) {
    console.error('Error checking user status:', error);
    return null;
  }
}; 