import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>Agreement Manager</h2>
        <button className="toggle-btn" onClick={onToggle}>
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

      <div className="sidebar-footer">
        <button className="nav-item" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 