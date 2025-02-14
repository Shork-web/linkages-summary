import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase-config';
import Login from './components/Auth/Login/Login';
import MainLayout from './components/MainLayout/MainLayout';
import AgreementForm from './components/AgreementForm/AgreementForm';
import AllAgreements from './components/AllAgreements/AllAgreements';
import PendingAgreements from './components/PendingAgreements/PendingAgreements';
import ActiveAgreements from './components/ActiveAgreements/ActiveAgreements';
import RenewalAgreements from './components/RenewalAgreements/RenewalAgreements';
import ExpiredAgreements from './components/ExpiredAgreements/ExpiredAgreements';
import Partners from './components/Partners/Partners';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Add a proper loading spinner here
  }

  return (
    <Router>
      <div className="App">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <header className="App-header">
            <h1>Partnership Agreement Management</h1>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<AgreementForm />} />
              <Route path="/agreements" element={<AllAgreements />} />
              <Route path="/pending" element={<PendingAgreements />} />
              <Route path="/active" element={<ActiveAgreements />} />
              <Route path="/renewal" element={<RenewalAgreements />} />
              <Route path="/expired" element={<ExpiredAgreements />} />
              <Route path="/partners" element={<Partners />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
