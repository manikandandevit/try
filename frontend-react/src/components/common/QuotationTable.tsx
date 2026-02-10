/**
 * Quotation Table Component
 * Displays quotation in a formatted table
 * Single source of truth - services data drives everything
 */

import React, { useEffect } from 'react';
import type { QuotationTableProps, Client } from '@/types';
import { formatCurrency, formatDate, escapeHtml } from '@/utils/format';
import styles from './QuotationTable.module.css';

const DEFAULT_COMPANY_INFO = {
  company_name: 'SYNGRID',
  tagline: 'MY_COMPANY',
  website: 'https://syngrid.com/',
  phone_number: '9342590533',
  email: 'contact@syngrid.com',
  address: 'TRI@TCE, Thiruparankundaram, Madurai – 625 015',
  logo_url: null,
};

export const QuotationTable: React.FC<QuotationTableProps> = ({
  quotation,
  companyInfo,
  selectedClient,
}) => {
  const company = companyInfo || DEFAULT_COMPANY_INFO;
  const currentDate = formatDate(new Date());

  const getServicePrice = (service: typeof quotation.services[0]): number => {
    return service.unit_price || service.price || service.unit_rate || 0;
  };

  // Convert relative logo URL to absolute URL if needed
  const getLogoUrl = (): string | null => {
    if (!company.logo_url) {
      return null;
    }
    
    const logoUrl = company.logo_url.trim();
    
    // If already absolute URL (from backend), return as is
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('data:')) {
      return logoUrl;
    }
    
    // If relative URL starting with /, make it absolute
    if (logoUrl.startsWith('/')) {
      // Use the backend URL directly (via proxy in dev, or same origin in production)
      return `${window.location.origin}${logoUrl}`;
    }
    
    // If it's a media URL without leading slash, add it
    if (logoUrl.includes('media/') || logoUrl.includes('company_logos/')) {
      const cleanUrl = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
      return `${window.location.origin}${cleanUrl}`;
    }
    
    // Otherwise return as is
    return logoUrl;
  };

  const logoUrl = getLogoUrl();
  
  // Debug: Log logo URL for troubleshooting
  useEffect(() => {
    if (logoUrl) {
      console.log('Logo URL for preview:', logoUrl);
    } else if (company.logo_url) {
      console.log('Logo URL exists but failed to convert:', company.logo_url);
    } else {
      console.log('No logo URL in company info');
    }
  }, [logoUrl, company.logo_url]);

  return (
    <div id="quotation-preview" className={styles.quotationPreview}>
      {/* Content Wrapper - expands to fill space */}
      <div className={styles.quotationContentWrapper} data-content-wrapper="true">
        {/* Header Banner */}
        <div className={styles.previewHeaderBanner}>
        <table className={styles.previewHeaderTable}>
          <tbody>
            <tr>
              <td className={styles.previewHeaderLogo}>
                <div className={styles.previewLogoBox}>
                  {logoUrl ? (
                    <>
                      <img
                        key={logoUrl}
                        src={logoUrl}
                        alt="Company Logo"
                        className={styles.previewLogoImg}
                        crossOrigin="anonymous"
                        loading="eager"
                        referrerPolicy="no-referrer"
                        onLoad={() => {
                          console.log('✅ Logo image loaded successfully:', logoUrl);
                        }}
                        onError={(e) => {
                          console.error('❌ Logo image failed to load:', logoUrl);
                          console.error('Error details:', e);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.parentElement?.querySelector(`.${styles.logoPlaceholder}`) as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                      <div className={styles.logoPlaceholder} style={{ display: 'none' }}>
                        <span className="material-icons">business</span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.logoPlaceholder}>
                      <span className="material-icons">business</span>
                    </div>
                  )}
                </div>
              </td>
              <td className={styles.previewHeaderCompany}>
                <div className={styles.previewCompanyName}>
                  {escapeHtml(company.company_name)}
                </div>
                <div className={styles.previewCompanyTagline}>
                  {escapeHtml(company.tagline)}
                </div>
              </td>
              <td className={styles.previewHeaderContact}>
                <div className={styles.previewContactItem}>
                  {escapeHtml(company.phone_number)}
                </div>
                <div className={styles.previewContactItem}>
                  {escapeHtml(company.email)}
                </div>
                <div className={styles.previewContactItem}>
                  {escapeHtml(company.address)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Date Section - At Top */}
      <div className={styles.dateSection}>
        <p>Date: {currentDate}</p>
      </div>

      {/* Quotation By and Quotation To Section */}
      <div className={styles.quotationInfoSection}>
        {/* Left Column - Quotation By (Company Info) */}
        <div className={styles.quotationBySection}>
          <div className={styles.quotationByLabel}>Quotation by</div>
          <div className={styles.quotationByDetails}>
            <div className={styles.detailItem}>
              <strong>{escapeHtml(company.company_name)}</strong>
            </div>
            {company.address && (
              <div className={styles.detailItem}>
                {escapeHtml(company.address)}
              </div>
            )}
            {company.phone_number && (
              <div className={styles.detailItem}>
                {escapeHtml(company.phone_number)}
              </div>
            )}
            {company.email && (
              <div className={styles.detailItem}>
                {escapeHtml(company.email)}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quotation To (Client Info) */}
        <div className={styles.quotationToSection}>
          <div className={styles.quotationToLabel}>Quotation To</div>
          {selectedClient ? (
            <div className={styles.quotationToDetails}>
              <div className={styles.detailItem}>
                <strong>{escapeHtml(selectedClient.customer_name)}</strong>
              </div>
              {selectedClient.company_name && (
                <div className={styles.detailItem}>
                  {escapeHtml(selectedClient.company_name)}
                </div>
              )}
              {selectedClient.address && (
                <div className={styles.detailItem}>
                  {escapeHtml(selectedClient.address)}
                </div>
              )}
              {selectedClient.phone_number && (
                <div className={styles.detailItem}>
                  {escapeHtml(selectedClient.phone_number)}
                </div>
              )}
              {selectedClient.email && (
                <div className={styles.detailItem}>
                  {escapeHtml(selectedClient.email)}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.quotationToDetails}>
              <div className={styles.detailItemPlaceholder}>
                Select a client from the dropdown above
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quotation Table */}
      <div className={styles.quotationTableContainer}>
        <table className={styles.quotationTable}>
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Quantity</th>
              <th>Price (₹)</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {quotation.services.map((service, index) => (
              <tr key={index}>
                <td>{escapeHtml(service.service_name)}</td>
                <td className={styles.textRight}>{service.quantity}</td>
                <td className={styles.textRight}>
                  {formatCurrency(getServicePrice(service))}
                </td>
                <td className={styles.textRight}>
                  {formatCurrency(service.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className={styles.totalsSection}>
          <table className={styles.totalsTable}>
            <tbody>
              <tr>
                <td className={styles.label}>Subtotal:</td>
                <td className={styles.amount}>
                  {formatCurrency(quotation.subtotal || 0)}
                </td>
              </tr>
              {quotation.gst_percentage > 0 && (
                <tr>
                  <td className={styles.label}>
                    GST ({quotation.gst_percentage}%):
                  </td>
                  <td className={styles.amount}>
                    {formatCurrency(quotation.gst_amount || 0)}
                  </td>
                </tr>
              )}
              <tr className={styles.grandTotalRow}>
                <td className={styles.label}>Grand Total:</td>
                <td className={styles.amount}>
                  {formatCurrency(quotation.grand_total || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Key Features Section - After Grand Total */}
        {quotation.services.some(service => service.key_features && service.key_features.length > 0) && (
          <div className={styles.keyFeaturesSection}>
            <div className={styles.keyFeaturesTitle}>Key Features:</div>
            <div className={styles.keyFeaturesList}>
              {quotation.services.map((service, index) => {
                if (service.key_features && service.key_features.length > 0) {
                  const featuresText = service.key_features.join(', ');
                  return (
                    <div key={index} className={styles.keyFeatureItem}>
                      <span className={styles.serviceName}>{escapeHtml(service.service_name)}:</span>
                      <span className={styles.featuresText}>{escapeHtml(featuresText)}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Footer */}
      <div className={styles.footer} data-footer="true">
        <div className={styles.footerContent}>
          {logoUrl && (
            <div className={styles.footerLogo}>
              <img
                src={logoUrl}
                alt="Company Logo"
                className={styles.footerLogoImg}
                crossOrigin="anonymous"
              />
            </div>
          )}
          <div className={styles.footerLinks}>
            {company.website ? (
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.footerWebsiteLink}
              >
                {escapeHtml(company.website)}
              </a>
            ) : null}
          </div>
        </div>
        <div className={styles.footerCopyright}>
          © Copyright Reserved {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

