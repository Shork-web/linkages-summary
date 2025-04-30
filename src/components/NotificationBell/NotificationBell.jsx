import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAgreementNotifications from '../../hooks/useAgreementNotifications';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications, loading, error, formatRemainingTime } = useAgreementNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const navigateToItem = (item) => {
    if (item.type === 'company') {
      // Navigate to company list
      navigate('/company-list');
    } else {
      // Navigate to agreements
      navigate('/agreements');
    }
    setIsOpen(false);
  };

  // Determine if we have any critical notifications
  const hasCriticalNotifications = !loading && notifications.some(
    notification => notification.urgency === 'critical' || notification.urgency === 'expired'
  );

  if (error) {
    console.error('Error loading notifications:', error);
  }

  // Group notifications by type for better organization
  const getGroupedNotifications = () => {
    if (!notifications.length) return [];
    
    const agreements = notifications.filter(item => item.type === 'agreement');
    const companies = notifications.filter(item => item.type === 'company');
    
    return [
      ...(agreements.length ? [{ type: 'header', title: 'Agreements' }, ...agreements] : []),
      ...(companies.length ? [{ type: 'header', title: 'Companies' }, ...companies] : [])
    ];
  };

  const groupedNotifications = getGroupedNotifications();

  return (
    <div className="notification-bell-container" ref={bellRef}>
      <div className={`bell-icon ${hasCriticalNotifications ? 'critical-alert' : ''}`} onClick={toggleDropdown}>
        <i className="fas fa-bell"></i>
        {!loading && notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Items Expiring Soon</h4>
          </div>
          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              groupedNotifications.map((item, index) => (
                item.type === 'header' ? (
                  <div key={`header-${item.title}-${index}`} className="notification-group-header">
                    {item.title}
                  </div>
                ) : (
                  <div 
                    key={`${item.type}-${item.id}`} 
                    className={`notification-item urgency-${item.urgency}`}
                    onClick={() => navigateToItem(item)}
                  >
                    <div className="notification-content">
                      <h5>{item.name || item.companyName}</h5>
                      <p className="notification-type">
                        {item.agreementType} • {item.partnerType}
                        {item.type === 'company' && ' (Company MOA)'}
                      </p>
                      <p className={`notification-expiry urgency-text-${item.urgency}`}>
                        <i className="fas fa-clock"></i> {formatRemainingTime(item.dateExpired)}
                      </p>
                    </div>
                  </div>
                )
              ))
            ) : (
              <div className="no-notifications">
                <p>No items expiring soon</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 