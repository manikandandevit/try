/**
 * Main App Component
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { TabType } from '@/types';
import { TabType as TabTypeEnum } from '@/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatSection } from '@/components/pages/ChatSection';
import { QuotationPreview } from '@/components/pages/QuotationPreview';
import { ClientDashboard } from '@/components/pages/ClientDashboard';
import { UserDashboard } from '@/components/pages/UserDashboard';
import { LoginPage } from '@/components/pages/LoginPage';
import { Dashboard } from '@/components/pages/Dashboard';
import { useQuotation } from '@/hooks/useQuotation';
import { useChat } from '@/hooks/useChat';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { generatePdf } from '@/utils/pdf';
import { apiService } from '@/services/api';
import styles from './App.module.css';

const QuotationPage: React.FC = () => {
  const {
    quotation,
    updateQuotation,
    resetQuotation,
    syncQuotation,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useQuotation();
  const { companyInfo } = useCompanyInfo();
  const chat = useChat(quotation, updateQuotation, syncQuotation);

  const handleDownloadPdf = useCallback(async () => {
    if (!quotation || !quotation.services || quotation.services.length === 0) {
      alert('No quotation to download. Please create a quotation first.');
      return;
    }

    try {
      await generatePdf('quotation-preview');
    } catch (error) {
      alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [quotation]);

  const handleReset = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear everything? This will clear the conversation and quotation preview.')) {
      return;
    }
    
    // Reset quotation first (clears backend session), then reset chat (syncs empty conversation)
    // This ensures backend quotation is cleared before syncing conversation history
    // The sync_conversation_history will also clear quotation if conversation has only welcome message
    await resetQuotation();
    await chat.resetChat();
  }, [resetQuotation, chat]);

  // Keyboard shortcuts for undo/redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      }
      // Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z for redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <ChatSection
          messages={chat.messages}
          isLoading={chat.isLoading}
          onSendMessage={chat.sendMessage}
          onReset={handleReset}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <QuotationPreview
          quotation={quotation}
          companyInfo={companyInfo}
          onDownloadPdf={handleDownloadPdf}
          onQuotationUpdate={updateQuotation}
        />
      </div>
    </div>
  );
};

const TabPage: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <div className={styles.tabPage}>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabTypeEnum.DASHBOARD);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [companyEmail, setCompanyEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Load company email
  useEffect(() => {
    const loadCompanyEmail = async () => {
      try {
        const companyData = await apiService.getCompanyLogin();
        if (companyData.email) {
          setCompanyEmail(companyData.email);
          localStorage.setItem('companyEmail', companyData.email);
        }
      } catch (error) {
        console.error('Error loading company email:', error);
        // Try to get from localStorage as fallback
        const storedCompanyEmail = localStorage.getItem('companyEmail');
        if (storedCompanyEmail) {
          setCompanyEmail(storedCompanyEmail);
        }
      }
    };
    loadCompanyEmail();
  }, []);

  // Check authentication status on mount using backend API
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check backend session using API
        const authStatus = await apiService.checkAuth();
        if (authStatus.authenticated) {
          // Backend session is valid - user is authenticated
          localStorage.setItem('isAuthenticated', 'true');
          setIsAuthenticated(true);
          // Store user email
          if (authStatus.user_email) {
            setUserEmail(authStatus.user_email);
            localStorage.setItem('userEmail', authStatus.user_email);
          }
          // Store role and permissions
          const adminFlag = !!authStatus.is_admin;
          const perms = Array.isArray(authStatus.permissions) ? authStatus.permissions : [];
          setIsAdmin(adminFlag);
          setPermissions(perms);
          localStorage.setItem('isAdmin', adminFlag ? 'true' : 'false');
          localStorage.setItem('permissions', JSON.stringify(perms));
        } else {
          // No valid backend session - user is not authenticated
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('permissions');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsAuthenticated(false);
          setUserEmail(null);
          setIsAdmin(false);
          setPermissions([]);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // On error, check localStorage as fallback
        const localAuth = localStorage.getItem('isAuthenticated');
        const storedEmail = localStorage.getItem('userEmail');
          const storedIsAdmin = localStorage.getItem('isAdmin');
          const storedPermissions = localStorage.getItem('permissions');
        if (localAuth === 'true') {
          setIsAuthenticated(true);
          if (storedEmail) {
            setUserEmail(storedEmail);
          }
          setIsAdmin(storedIsAdmin === 'true');
          if (storedPermissions) {
            try {
              const parsed = JSON.parse(storedPermissions);
              if (Array.isArray(parsed)) {
                setPermissions(parsed);
              }
            } catch {
              setPermissions([]);
            }
          }
        } else {
          // Clear all auth data on error
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('permissions');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsAuthenticated(false);
          setUserEmail(null);
          setIsAdmin(false);
          setPermissions([]);
        }
      }
    };
    checkAuth();
  }, []);

  // Poll authentication status every 5 seconds when user is authenticated
  // This detects if user is deleted by admin and automatically logs out
  useEffect(() => {
    // Only poll if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    const pollAuthStatus = async () => {
      try {
        const authStatus = await apiService.checkAuth();
        if (!authStatus.authenticated) {
          // User was deleted or account is inactive - automatically log out
          console.log('User account deleted or inactive. Logging out...');
          
          // Clear all authentication data
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('permissions');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          // Update state to trigger logout
          setIsAuthenticated(false);
          setUserEmail(null);
          setIsAdmin(false);
          setPermissions([]);
          
          // Optionally show a message to the user
          alert('Your account has been deleted or deactivated. You have been logged out.');
        } else {
          // User still exists - update permissions/admin status in case they changed
          const adminFlag = !!authStatus.is_admin;
          const perms = Array.isArray(authStatus.permissions) ? authStatus.permissions : [];
          setIsAdmin(adminFlag);
          setPermissions(perms);
          localStorage.setItem('isAdmin', adminFlag ? 'true' : 'false');
          localStorage.setItem('permissions', JSON.stringify(perms));
        }
      } catch (error) {
        // On error, don't log out (could be network issue)
        // Just log the error
        console.error('Error polling authentication status:', error);
      }
    };

    // Poll every 5 seconds (5000ms)
    const intervalId = setInterval(pollAuthStatus, 5000);

    // Cleanup interval on unmount or when authentication changes
    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  const handleLogin = async () => {
    // Set authentication status
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    // Get user email and role from auth check (now that token is stored)
    try {
      const authStatus = await apiService.checkAuth();
      if (authStatus.user_email) {
        setUserEmail(authStatus.user_email);
        localStorage.setItem('userEmail', authStatus.user_email);
      }
      const adminFlag = !!authStatus.is_admin;
      const perms = Array.isArray(authStatus.permissions) ? authStatus.permissions : [];
      setIsAdmin(adminFlag);
      setPermissions(perms);
      localStorage.setItem('isAdmin', adminFlag ? 'true' : 'false');
      localStorage.setItem('permissions', JSON.stringify(perms));
    } catch (error) {
      console.error('Error getting auth status:', error);
      // On error, try to get from localStorage as fallback
      const storedIsAdmin = localStorage.getItem('isAdmin');
      const storedPermissions = localStorage.getItem('permissions');
      setIsAdmin(storedIsAdmin === 'true');
      if (storedPermissions) {
        try {
          const parsed = JSON.parse(storedPermissions);
          if (Array.isArray(parsed)) {
            setPermissions(parsed);
          }
        } catch {
          setPermissions([]);
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout API to clear session
      const response = await apiService.logout();
      
      if (response.success) {
        // Backend session cleared successfully
        console.log('Logout successful:', response.message);
      } else {
        // Log error but continue with logout
        console.warn('Logout API returned error:', response.error);
      }
    } catch (error: any) {
      // Log error but continue with logout (client-side cleanup)
      console.error('Logout API error:', error);
    } finally {
      // Always clear local authentication and redirect to login page
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('permissions');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
      setUserEmail(null);
      setIsAdmin(false);
      setPermissions([]);
      // The component will automatically show login page when isAuthenticated is false
    }
  };

  // Get display name from user email (always show user name, not "Admin")
  const getDisplayName = (): string => {
    if (userEmail) {
      const namePart = userEmail.split('@')[0];
      if (namePart) {
        // Capitalize first letter of each word
        return namePart
          .split(/[._-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
    }
    return isAdmin ? 'Admin' : 'User';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case TabTypeEnum.DASHBOARD:
        return <Dashboard />;
      case TabTypeEnum.QUOTATION:
        return <QuotationPage />;
      case TabTypeEnum.CLIENT_PROFILE:
        return <ClientDashboard />;
      case TabTypeEnum.HISTORY:
        return <UserDashboard />;
      case TabTypeEnum.SETTINGS:
        return <TabPage title="Settings" description="Configure your application settings here." />;
      default:
        return <Dashboard />;
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show main app if authenticated
  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userName={getDisplayName()}
      userRole={isAdmin ? 'Admin' : 'User'}
      onLogout={handleLogout}
      isAdmin={isAdmin}
      allowedTabs={permissions as TabType[]}
    >
      {renderTabContent()}
    </DashboardLayout>
  );
};


