import React from 'react';
import AgreementForm from './components/AgreementForm/AgreementForm';
import EditAgreement from './components/EditAgreement/EditAgreement';
import './App.css';
import { Routes, Route } from 'react-router-dom';

// Then use it in your component
function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="App">
          <header className="App-header">
            <h1>Partnership Agreement Management</h1>
          </header>
          <main>
            <AgreementForm />
          </main>
        </div>
      } />
      <Route path="/edit-agreement/:id" element={<EditAgreement />} />
    </Routes>
  );
}

export default App; 