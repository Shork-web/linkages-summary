import React from 'react';
import './DashboardCounters.css';

const DashboardCounters = ({ counters }) => {
  return (
    <div className="dashboard-counters">
      <div className="counter-grid">
        <div className="counter-card total">
          <div className="counter-content">
            <span className="counter-value">{counters.totalAgreements}</span>
            <span className="counter-label">Total Agreements</span>
          </div>
        </div>

        <div className="counter-section">
          <div className="counter-card mou">
            <div className="counter-content">
              <span className="counter-value">{counters.byType.MOU}</span>
              <span className="counter-label">MOU</span>
            </div>
          </div>
          <div className="counter-card moa">
            <div className="counter-content">
              <span className="counter-value">{counters.byType.MOA}</span>
              <span className="counter-label">MOA</span>
            </div>
          </div>
        </div>

        <div className="counter-section partners">
          <div className="counter-card academic">
            <div className="counter-content">
              <span className="counter-value">{counters.byPartnerType.Academic}</span>
              <span className="counter-label">Academic</span>
            </div>
          </div>
          <div className="counter-card industry">
            <div className="counter-content">
              <span className="counter-value">{counters.byPartnerType.Industry}</span>
              <span className="counter-label">Industry</span>
            </div>
          </div>
          <div className="counter-card government">
            <div className="counter-content">
              <span className="counter-value">{counters.byPartnerType.Government}</span>
              <span className="counter-label">Government</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCounters; 