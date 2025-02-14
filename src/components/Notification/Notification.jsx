import React from 'react';
import './Notification.css';

const Notification = ({ type, message, onClose }) => {
  return (
    <div className={`notification-overlay`}>
      <div className={`notification ${type}`}>
        <div className="notification-content">
          <i className={`fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
          <p>{message}</p>
        </div>
        <button className="notification-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default Notification; 