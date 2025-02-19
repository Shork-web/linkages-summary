import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import LogoutConfirmation from '../LogoutConfirmation/LogoutConfirmation';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

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
        {!isCollapsed && <h2>Agreement Manager</h2>}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className={`fas fa-${isCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {/* Agreements Section */}
          <div className="nav-section">
            <div className="section-title">AGREEMENTS</div>
            <NavLink to="/new-agreement" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="New Agreement">
              <i className="fas fa-file-contract"></i>
              <span>New Agreement</span>
            </NavLink>
            
            <NavLink to="/agreements" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="All Agreements">
              <i className="fas fa-list"></i>
              <span>All Agreements</span>
            </NavLink>
            
            <NavLink to="/pending" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Pending">
              <i className="fas fa-clock"></i>
              <span>Pending</span>
            </NavLink>
            
            <NavLink to="/active" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Active">
              <i className="fas fa-check-circle"></i>
              <span>Active</span>
            </NavLink>
            
            <NavLink to="/renewal" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="For Renewal">
              <i className="fas fa-history"></i>
              <span>For Renewal</span>
            </NavLink>
            
            <NavLink to="/expired" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Expired">
              <i className="fas fa-times-circle"></i>
              <span>Expired</span>
            </NavLink>
          </div>

          {/* Updated MOA List Section */}
          <div className="nav-section">
            <div className="section-title">MOA LIST</div>
            <NavLink to="/company-moa" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="New Company MOA">
              <i className="fas fa-file-signature"></i>
              <span>New Company MOA</span>
            </NavLink>
            
            <NavLink to="/company-list" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Company List">
              <i className="fas fa-building"></i>
              <span>Company List</span>
            </NavLink>
          </div>
          
          {/* Others Section */}
          <div className="nav-section">
            <div className="section-title">OTHERS</div>
            <NavLink to="/partners" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Partners">
              <i className="fas fa-handshake"></i>
              <span>Partners</span>
            </NavLink>
          </div>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={() => setShowLogoutConfirmation(true)} title="Logout">
          <i className="fas fa-sign-out-alt"></i>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {showLogoutConfirmation && (
        <LogoutConfirmation
          onConfirm={() => {
            handleLogout();
            setShowLogoutConfirmation(false);
          }}
          onCancel={() => setShowLogoutConfirmation(false)}
        />
      )}
    </div>
  );
};

export default Sidebar; 