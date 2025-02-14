import React from 'react';
import AgreementForm from './components/AgreementForm/AgreementForm';
import './App.css';

// Then use it in your component
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Partnership Agreement Management</h1>
      </header>
      <main>
        <AgreementForm />
      </main>
    </div>
  );
}

export default App; 