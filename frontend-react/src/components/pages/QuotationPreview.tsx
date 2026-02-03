/**
 * Quotation Preview Component
 */

import React, { useRef, useEffect, useState } from 'react';
import type { QuotationPreviewProps, Quotation } from '@/types';
import { Button } from '@/components/ui/Button';
import { QuotationTable } from '@/components/common/QuotationTable';
import { QuotationReviewer } from '@/components/common/QuotationReviewer';
import styles from './QuotationPreview.module.css';

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  quotation,
  companyInfo,
  onDownloadPdf,
  onQuotationUpdate,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [showReviewer, setShowReviewer] = useState(false);
  const hasServices = quotation && quotation.services && quotation.services.length > 0;

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
            <Button
              variant="primary"
              size="small"
              icon="download"
              onClick={onDownloadPdf}
              className={styles.downloadButton}
              title="Download PDF"
            >
            </Button>
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
        <QuotationTable quotation={quotation} companyInfo={companyInfo} />
      </div>
    </div>
  );
};

