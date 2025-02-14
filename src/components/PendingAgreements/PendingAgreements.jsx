import React from 'react';
import './PendingAgreements.css';

const PendingAgreements = () => {
  return (
    <div className="agreements-container">
      <div className="agreements-header">
        <div className="header-title">
          <h2>Pending Agreements</h2>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search pending agreements..."
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
                  <i className="fas fa-clock"></i>
                  <p>No pending agreements</p>
                  <p className="empty-subtitle">All agreements are currently processed</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingAgreements; 