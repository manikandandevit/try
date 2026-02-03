/**
 * Sidebar Navigation Component
 */

import React from 'react';
import type { SidebarProps } from '@/types';
import { TabType } from '@/types';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { id: TabType.QUOTATION, label: 'Quotation', icon: 'description' },
  { id: TabType.CLIENT_PROFILE, label: 'Client Profile', icon: 'person' },
  { id: TabType.HISTORY, label: 'History', icon: 'history' },
  { id: TabType.SETTINGS, label: 'Settings', icon: 'settings' },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarLogo}>SynQuot</h2>
        <p className={styles.sidebarSubtitle}>AI Quotation System</p>
      </div>
      <nav className={styles.sidebarNav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => onTabChange(item.id)}
            aria-label={item.label}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            <span className="material-icons">{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

