import React from 'react';
import './AllAgreements.css';

const AllAgreements = () => {
  return (
    <div className="agreements-container">
      <div className="agreements-header">
        <div className="header-title">
          <h2>All Agreements</h2>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search agreements..."
            />
          </div>
          <div className="filter-group">
            <select defaultValue="">
              <option value="">All Types</option>
              <option value="MOU">MOU</option>
              <option value="MOA">MOA</option>
            </select>
            <select defaultValue="">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="renewed">Renewed</option>
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
                  <i className="fas fa-file-contract"></i>
                  <p>No agreements found</p>
                  <p className="empty-subtitle">Add a new agreement to get started</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="pagination">
          <button className="page-btn" disabled><i className="fas fa-chevron-left"></i></button>
          <button className="page-btn active">1</button>
          <button className="page-btn" disabled><i className="fas fa-chevron-right"></i></button>
        </div>
      </div>
    </div>
  );
};

export default AllAgreements; 