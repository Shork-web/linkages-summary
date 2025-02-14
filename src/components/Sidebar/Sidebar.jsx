import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>Agreement Manager</h2>
        <button className="toggle-btn" onClick={toggleSidebar}>
          <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-file-contract"></i>
            <span>New Agreement</span>
          </NavLink>
          
          <NavLink to="/agreements" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-list"></i>
            <span>All Agreements</span>
          </NavLink>
          
          <NavLink to="/pending" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-clock"></i>
            <span>Pending</span>
          </NavLink>
          
          <NavLink to="/active" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-check-circle"></i>
            <span>Active</span>
          </NavLink>
          
          <NavLink to="/renewal" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-history"></i>
            <span>For Renewal</span>
          </NavLink>
          
          <NavLink to="/expired" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-times-circle"></i>
            <span>Expired</span>
          </NavLink>
          
          <NavLink to="/partners" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-handshake"></i>
            <span>Partners</span>
          </NavLink>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 