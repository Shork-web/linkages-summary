import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { auth } from '../../firebase-config';
import NotificationBell from './NotificationBell';
import './NotificationBell.css';

const FloatingNotificationBell = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Don't show on login and signup pages
  const publicPaths = ['/login', '/signup'];
  
  if (!isAuthenticated || publicPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="floating-notification-bell">
      <NotificationBell />
    </div>
  );
};

export default FloatingNotificationBell; 