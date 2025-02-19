import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase-config';
import Sidebar from '../Sidebar/Sidebar';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import './MainLayout.css';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log('Current route:', location.pathname);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      }
      // Add a small delay to prevent flash of loading screen
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="main-layout">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} onLogout={handleLogout} />
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="App-header">
          <h1>LINKAGES SUMMARY SYSTEM</h1>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 