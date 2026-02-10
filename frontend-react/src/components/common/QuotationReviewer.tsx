/**
 * Quotation Reviewer Component
 * Displays review results and allows applying enhancements
 */

import React, { useState } from 'react';
import type { Quotation } from '@/types';
import {
  reviewAndEnhanceQuotation,
  autoCorrectCalculations,
  type QuotationReviewResult,
} from '@/utils/quotation-reviewer';
import { Button } from '@/components/ui/Button';
import styles from './QuotationReviewer.module.css';

export interface QuotationReviewerProps {
  quotation: Quotation;
  onApplyEnhancements: (enhancedQuotation: Quotation) => void;
  onDismiss?: () => void;
}

export const QuotationReviewer: React.FC<QuotationReviewerProps> = ({
  quotation,
  onApplyEnhancements,
  onDismiss,
}) => {
  const [reviewResult, setReviewResult] = useState<QuotationReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleReview = () => {
    setIsReviewing(true);
    const result = reviewAndEnhanceQuotation(quotation);
    setReviewResult(result);
    setIsReviewing(false);
  };

  const handleApplyEnhancements = () => {
    if (reviewResult) {
      // First auto-correct calculations
      const corrected = autoCorrectCalculations(reviewResult.quotation);
      onApplyEnhancements(corrected);
      setReviewResult(null);
      if (onDismiss) {
        onDismiss();
      }
    }
  };

  const handleAutoCorrect = () => {
    const corrected = autoCorrectCalculations(quotation);
    onApplyEnhancements(corrected);
    setReviewResult(null);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!reviewResult) {
    return (
      <div className={styles.reviewerContainer}>
        <div className={styles.reviewerHeader}>
          <h3 className={styles.reviewerTitle}>Quotation Review</h3>
          <p className={styles.reviewerSubtitle}>
            Review and enhance your quotation for professional presentation
          </p>
        </div>
        <div className={styles.reviewerActions}>
          <Button
            variant="primary"
            size="medium"
            onClick={handleReview}
            disabled={isReviewing}
          >
            {isReviewing ? 'Reviewing...' : 'Review Quotation'}
          </Button>
          <Button
            variant="secondary"
            size="medium"
            onClick={handleAutoCorrect}
          >
            Auto-Correct Calculations
          </Button>
        </div>
      </div>
    );
  }

  const errors = reviewResult.issues.filter(i => i.severity === 'error');
  const warnings = reviewResult.issues.filter(i => i.severity === 'warning');
  const suggestions = reviewResult.issues.filter(i => i.severity === 'suggestion');

  return (
    <div className={styles.reviewerContainer}>
      <div className={styles.reviewerHeader}>
        <h3 className={styles.reviewerTitle}>Review Results</h3>
        <div className={styles.reviewStatus}>
          {reviewResult.isReady ? (
            <span className={styles.statusReady}>✓ Ready for Client</span>
          ) : (
            <span className={styles.statusNotReady}>⚠ Needs Attention</span>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div className={styles.issuesSection}>
          <h4 className={styles.issuesTitle}>Errors ({errors.length})</h4>
          <ul className={styles.issuesList}>
            {errors.map((issue, index) => (
              <li key={index} className={styles.issueItem}>
                <span className={styles.issueIcon}>✗</span>
                <span className={styles.issueMessage}>{issue.message}</span>
                {issue.field && (
                  <span className={styles.issueField}>{issue.field}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className={styles.issuesSection}>
          <h4 className={styles.issuesTitle}>Warnings ({warnings.length})</h4>
          <ul className={styles.issuesList}>
            {warnings.map((issue, index) => (
              <li key={index} className={styles.issueItem}>
                <span className={styles.issueIcon}>⚠</span>
                <span className={styles.issueMessage}>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className={styles.issuesSection}>
          <h4 className={styles.issuesTitle}>Suggestions ({suggestions.length})</h4>
          <ul className={styles.issuesList}>
            {suggestions.map((issue, index) => (
              <li key={index} className={styles.issueItem}>
                <span className={styles.issueIcon}>💡</span>
                <span className={styles.issueMessage}>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reviewResult.suggestions.length > 0 && (
        <div className={styles.suggestionsSection}>
          <h4 className={styles.suggestionsTitle}>Presentation Suggestions</h4>
          <ul className={styles.suggestionsList}>
            {reviewResult.suggestions.map((suggestion, index) => (
              <li key={index} className={styles.suggestionItem}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.reviewerActions}>
        <Button
          variant="primary"
          size="medium"
          onClick={handleApplyEnhancements}
          disabled={errors.length > 0}
        >
          Apply Enhancements
        </Button>
        <Button
          variant="secondary"
          size="medium"
          onClick={() => setReviewResult(null)}
        >
          Review Again
        </Button>
        {onDismiss && (
          <Button
            variant="ghost"
            size="medium"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
};

