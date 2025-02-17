import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
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
        <h2>Loading...</h2>
      </div>
    </div>
  );
};

export default LoadingScreen; 