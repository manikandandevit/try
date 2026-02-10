/**
 * Header Component with User Profile and Notifications
 */

import React, { useState } from 'react';
import styles from './Header.module.css';

export interface HeaderProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Chinnapandi N',
  userRole = 'Admin user',
  userAvatar,
  onMenuToggle,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount] = useState(1); // You can make this dynamic

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Mobile Menu Button */}
        {onMenuToggle && (
          <button 
            className={styles.mobileMenuButton}
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <span className="material-icons">menu</span>
          </button>
        )}
        {/* Right side - User Profile and Notifications */}
        <div className={styles.headerRight}>
          {/* Notification Bell */}
          <div className={styles.notificationContainer}>
            <button
              className={styles.notificationButton}
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {notificationCount > 0 && (
                <span className={styles.notificationBadge}>{notificationCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <div className={styles.notificationHeader}>
                  <h3>Notifications</h3>
                  <button onClick={() => setShowNotifications(false)}>×</button>
                </div>
                <div className={styles.notificationList}>
                  <div className={styles.notificationItem}>
                    <p>You have a new message</p>
                    <span className={styles.notificationTime}>2 min ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className={styles.userProfile}>
            <div className={styles.avatarContainer}>
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>{userRole}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

