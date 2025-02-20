import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout';
import Login from './components/Auth/Login/Login';
import AgreementForm from './components/AgreementForm/AgreementForm';
import CompanyMOAForm from './components/CompanyMOAForm/CompanyMOAForm';
import AllAgreements from './components/AllAgreements/AllAgreements';
import ActiveAgreements from './components/ActiveAgreements/ActiveAgreements';
import PendingAgreements from './components/PendingAgreements/PendingAgreements';
import RenewalAgreements from './components/RenewalAgreements/RenewalAgreements';
import ExpiredAgreements from './components/ExpiredAgreements/ExpiredAgreements';
import Partners from './components/Partners/Partners';
import CompanyList from './components/CompanyList/CompanyList';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/agreements" replace />} />
        <Route path="/new-agreement" element={<AgreementForm />} />
        <Route path="/company-moa" element={<CompanyMOAForm />} />
        <Route path="/company-list" element={<CompanyList />} />
        <Route path="/agreements" element={<AllAgreements />} />
        <Route path="/active" element={<ActiveAgreements />} />
        <Route path="/pending" element={<PendingAgreements />} />
        <Route path="/renewal" element={<RenewalAgreements />} />
        <Route path="/expired" element={<ExpiredAgreements />} />
        <Route path="/partners" element={<Partners />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App; 