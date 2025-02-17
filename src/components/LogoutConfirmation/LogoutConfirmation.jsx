import React from 'react';
import './LogoutConfirmation.css';

const LogoutConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div className="logout-confirmation">
      <div className="confirmation-content">
        <div className="animation">
          <span role="img" aria-label="waving hand">👋</span>
        </div>
        <h2>Log Out Confirmation</h2>
        <p className="goodbye-text">Are you sure you want to log out?</p>
        <p className="additional-text">We hope to see you again soon!</p>
        <div className="confirmation-buttons">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn" onClick={onConfirm}>Log Out</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmation; 