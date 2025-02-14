import React from 'react';
import './Partners.css';

const Partners = () => {
  return (
    <div className="agreements-container">
      <div className="agreements-header">
        <div className="header-title">
          <h2>Partners</h2>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search partners..."
            />
          </div>
          <div className="filter-group">
            <select defaultValue="">
              <option value="">All Types</option>
              <option value="Academic">Academic</option>
              <option value="Industry">Industry</option>
              <option value="Government">Government</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="agreements-table">
          <thead>
            <tr>
              <th>Partner Name</th>
              <th>Type</th>
              <th>Address</th>
              <th>Contact Person</th>
              <th>Contact Number</th>
              <th>Email</th>
              <th>Active Agreements</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="empty-table">
              <td colSpan="8">
                <div className="empty-state">
                  <i className="fas fa-handshake"></i>
                  <p>No partners found</p>
                  <p className="empty-subtitle">Add partners through agreements</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Partners; 