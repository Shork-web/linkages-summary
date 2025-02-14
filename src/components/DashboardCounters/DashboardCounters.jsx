import React from 'react';
import './DashboardCounters.css';

const DashboardCounters = ({ agreements }) => {
  const counters = {
    totalAgreements: agreements.length,
    byType: {
      MOU: agreements.filter(a => a.agreementType === 'MOU').length,
      MOA: agreements.filter(a => a.agreementType === 'MOA').length
    },
    byPartnerType: {
      Academe: agreements.filter(a => a.partnerType === 'academe').length,
      Industry: agreements.filter(a => a.partnerType === 'industry').length,
      Government: agreements.filter(a => a.partnerType === 'government').length
    }
  };

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
          <div className="counter-card academe">
            <div className="counter-content">
              <span className="counter-value">{counters.byPartnerType.Academe}</span>
              <span className="counter-label">Academe</span>
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