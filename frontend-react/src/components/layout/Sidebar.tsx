/**
 * Sidebar Navigation Component - SYNGRID Design
 */

import React, { useState, useEffect } from 'react';
import type { SidebarProps } from '@/types';
import { TabType } from '@/types';
import { apiService } from '@/services/api';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { id: TabType.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
  { id: TabType.QUOTATION, label: 'Quotation', icon: 'description' },
  { id: TabType.CLIENT_PROFILE, label: 'Customers', icon: 'people' },
  { id: TabType.HISTORY, label: 'Users', icon: 'person' },
] as const;

const BOTTOM_NAV_ITEMS = [
  { id: TabType.SETTINGS, label: 'Setting', icon: 'settings' },
  { id: 'profile', label: 'Profile', icon: 'person' },
] as const;

export const Sidebar: React.FC<SidebarProps & {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}> = ({ 
  activeTab, 
  onTabChange, 
  onLogout,
  isAdmin,
  allowedTabs,
  isMobileOpen = false,
  onMobileClose 
}) => {
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // Load company logo from admin panel
  useEffect(() => {
    const loadCompanyLogo = async () => {
      try {
        const data = await apiService.getCompanyLogin();
        if (data.login_logo_url) {
          setCompanyLogo(data.login_logo_url);
        }
      } catch (error) {
        console.error('Error loading company logo:', error);
      }
    };
    loadCompanyLogo();
  }, []);

  const isTabAllowed = (tabId: TabType | string): boolean => {
    // Profile is always allowed (not a main app tab)
    if (tabId === 'profile') return true;

    if (isAdmin) return true;

    if (!allowedTabs || allowedTabs.length === 0) {
      // If no explicit permissions, default to allow dashboard only
      return tabId === TabType.DASHBOARD;
    }

    return allowedTabs.includes(tabId as TabType);
  };

  const handleTabChange = (tabId: TabType | string) => {
    if (!isTabAllowed(tabId)) {
      return;
    }

    if (tabId === 'profile') {
      // Handle profile tab - pass as string to onTabChange
      (onTabChange as (tab: TabType | 'profile') => void)(tabId);
    } else if (typeof tabId === 'string') {
      onTabChange(tabId as TabType);
    } else {
      onTabChange(tabId);
    }
    // Close mobile menu when tab is selected
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className={styles.mobileOverlay} onClick={onMobileClose}></div>
      )}
      
      {/* Desktop Sidebar / Mobile Drawer */}
      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt="SYNGRID Logo" 
                className={styles.logoImage}
              />
            ) : (
              <div className={styles.logoText}>
                <h2 className={styles.sidebarLogo}>SYNGRID</h2>
                <p className={styles.sidebarSubtitle}>Digital Solution Architects</p>
              </div>
            )}
          </div>
          {/* Mobile Close Button */}
          <button 
            className={styles.mobileCloseButton}
            onClick={onMobileClose}
            aria-label="Close menu"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            (() => {
              const disabled = !isTabAllowed(item.id);
              const isActive = activeTab === item.id;
              return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''} ${disabled ? styles.navItemDisabled : ''}`}
              onClick={disabled ? undefined : () => handleTabChange(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              disabled={disabled}
            >
              <span className="material-icons">{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
              );
            })()
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          {BOTTOM_NAV_ITEMS.map((item) => (
            (() => {
              const disabled = item.id !== 'profile' && !isTabAllowed(item.id as TabType);
              const isActive = item.id === 'profile' ? activeTab === 'profile' : activeTab === item.id;
              return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''} ${disabled ? styles.navItemDisabled : ''}`}
              onClick={disabled ? undefined : () => handleTabChange(item.id)}
              aria-label={item.label}
              disabled={disabled}
            >
              <span className="material-icons">{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
              );
            })()
          ))}
          {/* Logout Button */}
          <button
            className={styles.logoutButton}
            onClick={() => {
              if (onLogout) onLogout();
              if (onMobileClose) onMobileClose();
            }}
            aria-label="Logout"
          >
            <span className="material-icons">logout</span>
            <span className={styles.navLabel}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

