import React from 'react';
import './ExpiredAgreements.css';

const ExpiredAgreements = () => {
  return (
    <div className="agreements-container">
      <div className="agreements-header">
        <div className="header-title">
          <h2>Expired Agreements</h2>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search expired agreements..."
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
                  <i className="fas fa-times-circle"></i>
                  <p>No expired agreements</p>
                  <p className="empty-subtitle">All agreements are currently valid</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpiredAgreements; 