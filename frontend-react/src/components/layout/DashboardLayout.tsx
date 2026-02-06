/**
 * Dashboard Layout Component
 * Combines Sidebar and Header for the main dashboard
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { TabType } from '@/types';
import styles from './DashboardLayout.module.css';

export interface DashboardLayoutProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onLogout?: () => void;
  isAdmin?: boolean;
  allowedTabs?: TabType[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  children,
  userName,
  userRole,
  userAvatar,
  onLogout,
  isAdmin,
  allowedTabs,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll content area to top when tab changes
  useEffect(() => {
    if (contentAreaRef.current) {
      // Scroll to top immediately without smooth behavior
      contentAreaRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        onLogout={onLogout}
        isAdmin={isAdmin}
        allowedTabs={allowedTabs}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <div className={styles.mainContent}>
        <Header 
          userName={userName} 
          userRole={userRole} 
          userAvatar={userAvatar}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <div ref={contentAreaRef} className={styles.contentArea}>
          {children}
        </div>
      </div>
    </div>
  );
};

