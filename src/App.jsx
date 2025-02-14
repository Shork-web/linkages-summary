import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout';
import Login from './components/Auth/Login/Login';
import AgreementForm from './components/AgreementForm/AgreementForm';
import AllAgreements from './components/AllAgreements/AllAgreements';
import ActiveAgreements from './components/ActiveAgreements/ActiveAgreements';
import PendingAgreements from './components/PendingAgreements/PendingAgreements';
import RenewalAgreements from './components/RenewalAgreements/RenewalAgreements';
import ExpiredAgreements from './components/ExpiredAgreements/ExpiredAgreements';
import Partners from './components/Partners/Partners';
import PrivateRoute from './components/Auth/PrivateRoute';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/" element={<Navigate to="/all-agreements" replace />} />
        <Route path="/new-agreement" element={<AgreementForm />} />
        <Route path="/all-agreements" element={<AllAgreements />} />
        <Route path="/active-agreements" element={<ActiveAgreements />} />
        <Route path="/pending-agreements" element={<PendingAgreements />} />
        <Route path="/renewal-agreements" element={<RenewalAgreements />} />
        <Route path="/expired-agreements" element={<ExpiredAgreements />} />
        <Route path="/partners" element={<Partners />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App; 