import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout';
import Login from './components/Auth/Login/Login';
import AgreementForm from './components/AgreementForm/AgreementForm';
import AllAgreements from './components/AllAgreements/AllAgreements';
import PendingAgreements from './components/PendingAgreements/PendingAgreements';
import ActiveAgreements from './components/ActiveAgreements/ActiveAgreements';
import RenewalAgreements from './components/RenewalAgreements/RenewalAgreements';
import ExpiredAgreements from './components/ExpiredAgreements/ExpiredAgreements';
import Partners from './components/Partners/Partners';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<AgreementForm />} />
          <Route path="agreements" element={<AllAgreements />} />
          <Route path="pending" element={<PendingAgreements />} />
          <Route path="active" element={<ActiveAgreements />} />
          <Route path="renewal" element={<RenewalAgreements />} />
          <Route path="expired" element={<ExpiredAgreements />} />
          <Route path="partners" element={<Partners />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
