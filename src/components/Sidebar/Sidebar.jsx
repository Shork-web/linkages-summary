import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import LogoutConfirmation from '../LogoutConfirmation/LogoutConfirmation';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsAuthenticated(!!user);
      
      if (user) {
        try {
          // Get user role from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserRole(userSnap.data().role || 'user');
          } else {
            setUserRole('user'); // Default to user role if not specified
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user'); // Default to user role on error
        }
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Define which sections and items should be accessible when logged in as a regular user
  const allowedSections = ['MOA LIST'];
  const allowedItems = ['New Company MOA', 'Department List'];

  // Function to check if a section or item is allowed based on user role
  const isAllowed = (type, name) => {
    // If not authenticated or loading, everything is allowed
    if (!isAuthenticated || loading) return true;
    
    // Admin and superadmin can access everything
    if (userRole === 'admin' || userRole === 'superadmin') return true;
    
    // For regular users, check against allowed lists
    if (type === 'section') {
      return allowedSections.includes(name);
    } else {
      return allowedItems.includes(name) || 
             allowedSections.includes(
               // Find the parent section of this item
               Array.from(document.querySelectorAll('.section-title'))
                 .find(el => el.parentNode.contains(document.querySelector(`[title="${name}"]`)))
                 ?.textContent || ''
             );
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
            <NavLink 
              to="/new-agreement" 
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${!isAllowed('item', 'New Agreement') ? 'disabled' : ''}`
              } 
              title="New Agreement"
              onClick={(e) => !isAllowed('item', 'New Agreement') && e.preventDefault()}
            >
              <i className="fas fa-file-contract"></i>
              <span className={!isAllowed('item', 'New Agreement') ? 'disabled-text' : ''}>
                New Agreement
                {isAuthenticated && !isAllowed('item', 'New Agreement') && <span className="locked-icon">🔒</span>}
              </span>
            </NavLink>
            
            <NavLink 
              to="/agreements" 
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${!isAllowed('item', 'All Agreements') ? 'disabled' : ''}`
              } 
              title="All Agreements"
              onClick={(e) => !isAllowed('item', 'All Agreements') && e.preventDefault()}
            >
              <i className="fas fa-list"></i>
              <span className={!isAllowed('item', 'All Agreements') ? 'disabled-text' : ''}>
                All Agreements
                {isAuthenticated && !isAllowed('item', 'All Agreements') && <span className="locked-icon">🔒</span>}
              </span>
            </NavLink>
            
            <NavLink 
              to="/pending" 
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${!isAllowed('item', 'Pending') ? 'disabled' : ''}`
              } 
              title="Pending"
              onClick={(e) => !isAllowed('item', 'Pending') && e.preventDefault()}
            >
              <i className="fas fa-clock"></i>
              <span className={!isAllowed('item', 'Pending') ? 'disabled-text' : ''}>
                Pending
                {isAuthenticated && !isAllowed('item', 'Pending') && <span className="locked-icon">🔒</span>}
              </span>
            </NavLink>
            
            <NavLink 
              to="/active" 
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${!isAllowed('item', 'Active') ? 'disabled' : ''}`
              } 
              title="Active"
              onClick={(e) => !isAllowed('item', 'Active') && e.preventDefault()}
            >
              <i className="fas fa-check-circle"></i>
              <span className={!isAllowed('item', 'Active') ? 'disabled-text' : ''}>
                Active
                {isAuthenticated && !isAllowed('item', 'Active') && <span className="locked-icon">🔒</span>}
              </span>
            </NavLink>
            
            <NavLink 
              to="/renewal" 
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${!isAllowed('item', 'For Renewal') ? 'disabled' : ''}`
              } 
              title="For Renewal"
              onClick={(e) => !isAllowed('item', 'For Renewal') && e.preventDefault()}
            >
              <i className="fas fa-history"></i>
              <span className={!isAllowed('item', 'For Renewal') ? 'disabled-text' : ''}>
                For Renewal
                {isAuthenticated && !isAllowed('item', 'For Renewal') && <span className="locked-icon">🔒</span>}
              </span>
            </NavLink>
            
            <NavLink 
              to="/expired" 
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${!isAllowed('item', 'Expired') ? 'disabled' : ''}`
              } 
              title="Expired"
              onClick={(e) => !isAllowed('item', 'Expired') && e.preventDefault()}
            >
              <i className="fas fa-times-circle"></i>
              <span className={!isAllowed('item', 'Expired') ? 'disabled-text' : ''}>
                Expired
                {isAuthenticated && !isAllowed('item', 'Expired') && <span className="locked-icon">🔒</span>}
              </span>
            </NavLink>
          </div>

          {/* MOA LIST Section - This section should remain accessible for all roles */}
          <div className="nav-section">
            <div className="section-title">MOA LIST</div>
            <NavLink 
              to="/company-moa" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} 
              title="New Company MOA"
            >
              <i className="fas fa-file-signature"></i>
              <span>New Company MOA</span>
            </NavLink>
            
            <NavLink 
              to="/company-list" 
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${!isAllowed('item', 'Company List') ? 'disabled' : ''}`
              } 
              title="Company List"
              onClick={(e) => !isAllowed('item', 'Company List') && e.preventDefault()}
            >
              <i className="fas fa-building"></i>
              <span className={!isAllowed('item', 'Company List') ? 'disabled-text' : ''}>
                Company List
                {isAuthenticated && !isAllowed('item', 'Company List') && <span className="locked-icon">🔒</span>}
              </span>
            </NavLink>
            
            <NavLink 
              to="/departments" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} 
              title="Department List"
            >
              <i className="fas fa-university"></i>
              <span>Department List</span>
            </NavLink>
          </div>
          
          {/* Others Section */}
          <div className="nav-section">
            <div className="section-title">OTHERS</div>
            <NavLink 
              to="/partners" 
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${!isAllowed('item', 'Partners') ? 'disabled' : ''}`
              } 
              title="Partners"
              onClick={(e) => !isAllowed('item', 'Partners') && e.preventDefault()}
            >
              <i className="fas fa-handshake"></i>
              <span className={!isAllowed('item', 'Partners') ? 'disabled-text' : ''}>
                Partners
                {isAuthenticated && !isAllowed('item', 'Partners') && <span className="locked-icon">🔒</span>}
              </span>
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