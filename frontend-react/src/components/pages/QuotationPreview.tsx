/**
 * Quotation Preview Component
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { QuotationPreviewProps, Quotation, Client } from '@/types';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { QuotationTable } from '@/components/common/QuotationTable';
import { QuotationReviewer } from '@/components/common/QuotationReviewer';
import { generatePdfAsBlob } from '@/utils/pdf';
import styles from './QuotationPreview.module.css';

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  quotation,
  companyInfo,
  onDownloadPdf,
  onQuotationUpdate,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showReviewer, setShowReviewer] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const hasServices = quotation && quotation.services && quotation.services.length > 0;

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const customerName = (client.customer_name || '').toLowerCase();
    const companyName = (client.company_name || '').toLowerCase();
    return customerName.includes(query) || companyName.includes(query);
  });

  // Load clients
  const loadClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const response = await apiService.listClients();
      setClients(response.clients);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setIsLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery(''); // Clear search when closing
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isDropdownOpen) {
      setSearchQuery('');
    }
  }, [isDropdownOpen]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setIsDropdownOpen(false);
    setSearchQuery(''); // Clear search after selection
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent dropdown from closing when typing
    e.stopPropagation();
  };

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target as Node)) {
        setIsShareDropdownOpen(false);
      }
    };

    if (isShareDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShareDropdownOpen]);

  const handleDownload = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
    }
    setIsShareDropdownOpen(false);
  };

  const handleEmailShare = async () => {
    if (selectedClient && quotation && selectedClient.email) {
      setIsGeneratingPdf(true);
      try {
        // Generate PDF as blob
        const pdfBlob = await generatePdfAsBlob('quotation-preview');
        
        // Ensure pdfBlob is a Blob
        if (!(pdfBlob instanceof Blob)) {
          throw new Error('PDF generation failed: Invalid blob type');
        }
        
        const fileName = `quotation_${selectedClient.customer_name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
        
        // Send email via API
        await apiService.sendQuotationEmail(
          selectedClient.email,
          selectedClient.customer_name,
          pdfBlob,
          fileName
        );
        
        alert(`Quotation sent successfully to ${selectedClient.email}`);
        setIsShareDropdownOpen(false);
      } catch (error: any) {
        console.error('Error sending email:', error);
        const errorMessage = error?.data?.error || error?.message || 'Failed to send email. Please try again.';
        alert(errorMessage);
      } finally {
        setIsGeneratingPdf(false);
      }
    } else {
      alert('Please select a client with an email address to send quotation');
    }
  };


  const handleApplyEnhancements = (enhancedQuotation: Quotation) => {
    if (onQuotationUpdate) {
      onQuotationUpdate(enhancedQuotation);
    }
    setShowReviewer(false);
  };

  useEffect(() => {
    // Scroll to top when quotation updates
    if (previewRef.current) {
      previewRef.current.scrollTop = 0;
    }
  }, [quotation]);

  if (!hasServices) {
    return (
      <div className={styles.quotationSection}>
        <div className={styles.quotationHeader}>
          <div className={styles.headerContent}>
            <h2>Quotation Preview</h2>
            <p className={styles.headerSubtitle}>Real-time quotation preview</p>
          </div>
        </div>
        <div className={styles.quotationPreview} ref={previewRef}>
          <div className={styles.emptyQuotation}>
            <p>Start a conversation to create your quotation!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.quotationSection}>
      <div className={styles.quotationHeader}>
        <div className={styles.headerContent}>
          <h2>Quotation Preview</h2>
          <p className={styles.headerSubtitle}>Real-time quotation preview</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.actionGroup}>
            {/* Client Dropdown */}
            <div className={styles.clientDropdownWrapper} ref={dropdownRef}>
              <button
                className={styles.clientDropdownButton}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                title="Select Client"
              >
                <span className="material-icons">people</span>
                {selectedClient ? (
                  <span className={styles.selectedClientName}>
                    {selectedClient.customer_name}
                  </span>
                ) : (
                  <span className={styles.dropdownPlaceholder}>Select Client</span>
                )}
                <span className={`material-icons ${styles.dropdownArrow} ${isDropdownOpen ? styles.open : ''}`}>
                  arrow_drop_down
                </span>
              </button>
              
              {isDropdownOpen && (
                <div className={styles.clientDropdownMenu}>
                  {/* Search Input */}
                  <div className={styles.dropdownSearch}>
                    <span className="material-icons">search</span>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search by customer or company name..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKeyDown}
                      className={styles.searchInput}
                    />
                    {searchQuery && (
                      <button
                        className={styles.clearSearchButton}
                        onClick={() => setSearchQuery('')}
                        title="Clear search"
                      >
                        <span className="material-icons">close</span>
                      </button>
                    )}
                  </div>

                  {/* Client List */}
                  {isLoadingClients ? (
                    <div className={styles.dropdownLoading}>Loading clients...</div>
                  ) : filteredClients.length === 0 ? (
                    <div className={styles.dropdownEmpty}>
                      {searchQuery ? 'No clients found matching your search' : 'No clients found'}
                    </div>
                  ) : (
                    <div className={styles.dropdownList}>
                      {filteredClients.map((client) => (
                        <button
                          key={client.id}
                          className={`${styles.dropdownItem} ${selectedClient?.id === client.id ? styles.selected : ''}`}
                          onClick={() => handleClientSelect(client)}
                        >
                          <div className={styles.clientInfo}>
                            <span className={styles.clientName}>{client.customer_name}</span>
                            {client.company_name && (
                              <span className={styles.clientCompany}>{client.company_name}</span>
                            )}
                            {client.email && (
                              <span className={styles.clientEmail}>{client.email}</span>
                            )}
                          </div>
                          {selectedClient?.id === client.id && (
                            <span className="material-icons">check</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Share Button with Dropdown - Only show when client is selected */}
            {selectedClient && (
              <div 
                className={styles.shareButtonWrapper}
                ref={shareDropdownRef}
                onMouseEnter={() => setIsShareDropdownOpen(true)}
                onMouseLeave={() => setIsShareDropdownOpen(false)}
              >
                <button
                  className={styles.shareButton}
                  title={`Share with ${selectedClient.customer_name}`}
                >
                  <span className="material-icons">share</span>
                  <span className={styles.shareButtonText}>Share</span>
                  <span className={`material-icons ${styles.shareDropdownArrow} ${isShareDropdownOpen ? styles.open : ''}`}>
                    arrow_drop_down
                  </span>
                </button>
                
                {isShareDropdownOpen && (
                  <div className={styles.shareDropdownMenu}>
                    <button
                      className={styles.shareDropdownItem}
                      onClick={handleEmailShare}
                      title={`Email to ${selectedClient.email}`}
                    >
                      <span className="material-icons">email</span>
                      <span>Email</span>
                    </button>
                    <button
                      className={styles.shareDropdownItem}
                      onClick={handleDownload}
                      title="Download PDF"
                    >
                      <span className="material-icons">download</span>
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              className={styles.reviewLink}
              onClick={() => setShowReviewer(!showReviewer)}
              title={showReviewer ? 'Hide Review' : 'Review Quotation'}
            >
              <span className="material-icons">verified</span>
            </button>
          </div>
        </div>
      </div>
      <div className={styles.quotationPreview} ref={previewRef}>
        {showReviewer && quotation && (
          <QuotationReviewer
            quotation={quotation}
            onApplyEnhancements={handleApplyEnhancements}
            onDismiss={() => setShowReviewer(false)}
          />
        )}
        <QuotationTable 
          quotation={quotation} 
          companyInfo={companyInfo}
          selectedClient={selectedClient}
        />
      </div>
    </div>
  );
};

