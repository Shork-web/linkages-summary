import React from 'react';
import './ActiveAgreements.css';

const ActiveAgreements = () => {
  return (
    <div className="agreements-container">
      <div className="agreements-header">
        <div className="header-title">
          <h2>Active Agreements</h2>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search active agreements..."
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
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Signed By</th>
              <th>Designation</th>
              <th>Agreement Type</th>
              <th>Date Signed</th>
              <th>Validity</th>
              <th>Date Expired</th>
              <th>For Renewal</th>
              <th>Status</th>
              <th>Description</th>
              <th>Links</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="empty-table">
              <td colSpan="13">
                <div className="empty-state">
                  <i className="fas fa-check-circle"></i>
                  <p>No active agreements</p>
                  <p className="empty-subtitle">Create a new agreement to get started</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveAgreements; 