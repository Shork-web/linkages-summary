import React from 'react';
import './RenewalAgreements.css';

const RenewalAgreements = () => {
  return (
    <div className="agreements-container">
      <div className="agreements-header">
        <div className="header-title">
          <h2>Agreements For Renewal</h2>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search agreements for renewal..."
            />
          </div>
          <div className="filter-group">
            <select defaultValue="">
              <option value="">All Types</option>
              <option value="MOU">MOU</option>
              <option value="MOA">MOA</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="agreements-table">
          {/* Same table structure */}
          <tbody>
            <tr className="empty-table">
              <td colSpan="13">
                <div className="empty-state">
                  <i className="fas fa-history"></i>
                  <p>No agreements for renewal</p>
                  <p className="empty-subtitle">All agreements are up to date</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RenewalAgreements; 