import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { auth } from '../../firebase-config';
import './PrivateRoute.css';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default PrivateRoute; 