/**
 * Main App Component
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { TabType } from '@/types';
import { TabType as TabTypeEnum } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatSection } from '@/components/pages/ChatSection';
import { QuotationPreview } from '@/components/pages/QuotationPreview';
import { ClientDashboard } from '@/components/pages/ClientDashboard';
import { LoginPage } from '@/components/pages/LoginPage';
import { useQuotation } from '@/hooks/useQuotation';
import { useChat } from '@/hooks/useChat';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { generatePdf } from '@/utils/pdf';
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
  const [activeTab, setActiveTab] = useState<TabType>(TabTypeEnum.QUOTATION);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status on mount
  useEffect(() => {
    // Check if user is authenticated (you can also check session/localStorage)
    const checkAuth = async () => {
      try {
        // Check if there's a session (you might want to add an endpoint to verify session)
        // For now, we'll check localStorage
        const authStatus = localStorage.getItem('isAuthenticated');
        if (authStatus === 'true') {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    // Set authentication status
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case TabTypeEnum.QUOTATION:
        return <QuotationPage />;
      case TabTypeEnum.CLIENT_PROFILE:
        return <ClientDashboard />;
      case TabTypeEnum.HISTORY:
        return <TabPage title="History" description="View your quotation history here." />;
      case TabTypeEnum.SETTINGS:
        return <TabPage title="Settings" description="Configure your application settings here." />;
      default:
        return <QuotationPage />;
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show main app if authenticated
  return (
    <div className={styles.appContainer}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className={styles.mainWrapper}>
        {renderTabContent()}
      </main>
    </div>
  );
};

