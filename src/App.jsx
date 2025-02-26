import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout';
import Login from './components/Auth/Login/Login';
import Signup from './components/Auth/Signup/Signup';
import AgreementForm from './components/AgreementForm/AgreementForm';
import CompanyMOAForm from './components/CompanyMOAForm/CompanyMOAForm';
import AllAgreements from './components/AllAgreements/AllAgreements';
import ActiveAgreements from './components/ActiveAgreements/ActiveAgreements';
import PendingAgreements from './components/PendingAgreements/PendingAgreements';
import RenewalAgreements from './components/RenewalAgreements/RenewalAgreements';
import ExpiredAgreements from './components/ExpiredAgreements/ExpiredAgreements';
import Partners from './components/Partners/Partners';
import CompanyList from './components/CompanyList/CompanyList';
import DepartmentList from './components/DepartmentList/DepartmentList';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/agreements" replace />} />
        <Route path="/new-agreement" element={<AgreementForm />} />
        <Route path="/company-moa" element={<CompanyMOAForm />} />
        <Route path="/company-list" element={<CompanyList />} />
        <Route path="/departments" element={<DepartmentList />} />
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