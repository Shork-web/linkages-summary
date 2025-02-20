import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <h1 className="loading-title">CIT-U</h1>
      <div className="car-container">
        <div className="car-body">
          <div className="car-top"></div>
          <div className="car-bottom">
            <div className="wheel wheel-left"></div>
            <div className="wheel wheel-right"></div>
          </div>
        </div>
        <div className="road">
          <div className="road-line"></div>
          <div className="road-line"></div>
          <div className="road-line"></div>
        </div>
      </div>
      <p className="loading-text">Refreshing, please wait...</p>
    </div>
  );
};

export default LoadingScreen; 