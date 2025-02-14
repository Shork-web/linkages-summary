import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgreementForm from './components/AgreementForm/AgreementForm';
import AllAgreements from './components/AllAgreements/AllAgreements';
import PendingAgreements from './components/PendingAgreements/PendingAgreements';
import ActiveAgreements from './components/ActiveAgreements/ActiveAgreements';
import RenewalAgreements from './components/RenewalAgreements/RenewalAgreements';
import ExpiredAgreements from './components/ExpiredAgreements/ExpiredAgreements';
import Partners from './components/Partners/Partners';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className="App">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <header className="App-header">
            <h1>LinkagesPartnership Agreement Management</h1>
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
