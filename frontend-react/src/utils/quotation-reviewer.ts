/**
 * Quotation Reviewer & Professional Formatter
 * Reviews and enhances quotations to be professional, clear, and client-ready
 */

import type { Quotation, Service } from '@/types';

export interface QuotationReviewResult {
  quotation: Quotation;
  issues: ReviewIssue[];
  suggestions: string[];
  isReady: boolean;
}

export interface ReviewIssue {
  type: 'calculation' | 'formatting' | 'grammar' | 'legal' | 'presentation';
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  field?: string;
}

/**
 * Review and enhance a quotation to be professional and client-ready
 */
export const reviewAndEnhanceQuotation = (quotation: Quotation): QuotationReviewResult => {
  const issues: ReviewIssue[] = [];
  const suggestions: string[] = [];
  let enhancedQuotation = { ...quotation };

  // 1. Check formatting & readability
  const formattingIssues = checkFormatting(enhancedQuotation);
  issues.push(...formattingIssues);

  // 2. Review pricing & calculations
  const calculationIssues = verifyCalculations(enhancedQuotation);
  issues.push(...calculationIssues);

  // 3. Improve grammar & phrasing
  enhancedQuotation = improveGrammarAndPhrasing(enhancedQuotation);

  // 4. Legal & disclaimers
  const legalIssues = checkLegalCompleteness();
  issues.push(...legalIssues);

  // 5. Presentation suggestions
  const presentationSuggestions = getPresentationSuggestions(enhancedQuotation);
  suggestions.push(...presentationSuggestions);

  // 6. Final verification
  const isReady = issues.filter(i => i.severity === 'error').length === 0;

  return {
    quotation: enhancedQuotation,
    issues,
    suggestions,
    isReady,
  };
};

/**
 * Check formatting and readability
 */
const checkFormatting = (quotation: Quotation): ReviewIssue[] => {
  const issues: ReviewIssue[] = [];

  if (!quotation.services || quotation.services.length === 0) {
    issues.push({
      type: 'formatting',
      severity: 'error',
      message: 'No services found in quotation. Please add at least one service.',
    });
    return issues;
  }

  // Check service names
  quotation.services.forEach((service, index) => {
    const serviceName = service.service_name?.trim() || '';
    
    if (!serviceName) {
      issues.push({
        type: 'formatting',
        severity: 'error',
        message: `Service ${index + 1} has no name.`,
        field: `services[${index}].service_name`,
      });
    } else {
      // Check capitalization consistency
      const firstChar = serviceName[0];
      if (firstChar && firstChar === firstChar.toLowerCase()) {
        issues.push({
          type: 'formatting',
          severity: 'suggestion',
          message: `Service "${serviceName}" should start with a capital letter.`,
          field: `services[${index}].service_name`,
        });
      }

      // Check for proper spacing
      if (serviceName.includes('  ') || serviceName.trim() !== serviceName) {
        issues.push({
          type: 'formatting',
          severity: 'suggestion',
          message: `Service "${serviceName}" has spacing issues.`,
          field: `services[${index}].service_name`,
        });
      }
    }

    // Check quantity
    if (service.quantity <= 0) {
      issues.push({
        type: 'formatting',
        severity: 'error',
        message: `Service "${serviceName}" has invalid quantity (${service.quantity}).`,
        field: `services[${index}].quantity`,
      });
    }

    // Check unit price
    if (service.unit_price < 0) {
      issues.push({
        type: 'formatting',
        severity: 'error',
        message: `Service "${serviceName}" has negative unit price.`,
        field: `services[${index}].unit_price`,
      });
    }
  });

  return issues;
};

/**
 * Verify pricing calculations
 */
const verifyCalculations = (quotation: Quotation): ReviewIssue[] => {
  const issues: ReviewIssue[] = [];

  if (!quotation.services || quotation.services.length === 0) {
    return issues;
  }

  // Verify each service amount
  quotation.services.forEach((service, index) => {
    const expectedAmount = (service.quantity || 0) * (service.unit_price || 0);
    const actualAmount = service.amount || 0;
    const difference = Math.abs(expectedAmount - actualAmount);

    if (difference > 0.01) { // Allow for floating point precision
      issues.push({
        type: 'calculation',
        severity: 'error',
        message: `Service "${service.service_name}" amount mismatch. Expected: ₹${expectedAmount.toFixed(2)}, Actual: ₹${actualAmount.toFixed(2)}`,
        field: `services[${index}].amount`,
      });
    }
  });

  // Verify subtotal
  const expectedSubtotal = quotation.services.reduce((sum, service) => {
    return sum + (service.amount || 0);
  }, 0);
  const actualSubtotal = quotation.subtotal || 0;
  const subtotalDifference = Math.abs(expectedSubtotal - actualSubtotal);

  if (subtotalDifference > 0.01) {
    issues.push({
      type: 'calculation',
      severity: 'error',
      message: `Subtotal mismatch. Expected: ₹${expectedSubtotal.toFixed(2)}, Actual: ₹${actualSubtotal.toFixed(2)}`,
      field: 'subtotal',
    });
  }

  // Verify GST
  if (quotation.gst_percentage < 0 || quotation.gst_percentage > 100) {
    issues.push({
      type: 'calculation',
      severity: 'error',
      message: `Invalid GST percentage: ${quotation.gst_percentage}%. Must be between 0 and 100.`,
      field: 'gst_percentage',
    });
  } else {
    const expectedGstAmount = (expectedSubtotal * quotation.gst_percentage) / 100;
    const actualGstAmount = quotation.gst_amount || 0;
    const gstDifference = Math.abs(expectedGstAmount - actualGstAmount);

    if (gstDifference > 0.01) {
      issues.push({
        type: 'calculation',
        severity: 'error',
        message: `GST amount mismatch. Expected: ₹${expectedGstAmount.toFixed(2)}, Actual: ₹${actualGstAmount.toFixed(2)}`,
        field: 'gst_amount',
      });
    }
  }

  // Verify grand total
  const expectedGrandTotal = expectedSubtotal + (quotation.gst_amount || 0);
  const actualGrandTotal = quotation.grand_total || 0;
  const grandTotalDifference = Math.abs(expectedGrandTotal - actualGrandTotal);

  if (grandTotalDifference > 0.01) {
    issues.push({
      type: 'calculation',
      severity: 'error',
      message: `Grand total mismatch. Expected: ₹${expectedGrandTotal.toFixed(2)}, Actual: ₹${actualGrandTotal.toFixed(2)}`,
      field: 'grand_total',
    });
  }

  return issues;
};

/**
 * Improve grammar and phrasing of service names
 */
const improveGrammarAndPhrasing = (quotation: Quotation): Quotation => {
  const enhanced = { ...quotation };
  
  if (!enhanced.services) {
    return enhanced;
  }

  enhanced.services = enhanced.services.map(service => {
    let serviceName = service.service_name?.trim() || '';
    
    if (!serviceName) {
      return service;
    }

    // Capitalize first letter
    serviceName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);

    // Fix common grammar issues
    serviceName = serviceName
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\s*,\s*/g, ', ') // Proper comma spacing
      .replace(/\s*\.\s*/g, '. ') // Proper period spacing
      .trim();

    // Ensure proper capitalization for common terms
    const commonTerms: Record<string, string> = {
      'website': 'Website',
      'web': 'Web',
      'app': 'App',
      'api': 'API',
      'ui': 'UI',
      'ux': 'UX',
      'seo': 'SEO',
      'gst': 'GST',
      'vat': 'VAT',
    };

    Object.entries(commonTerms).forEach(([lower, proper]) => {
      const regex = new RegExp(`\\b${lower}\\b`, 'gi');
      serviceName = serviceName.replace(regex, proper);
    });

    return {
      ...service,
      service_name: serviceName,
    };
  });

  return enhanced;
};

/**
 * Check legal completeness
 */
const checkLegalCompleteness = (): ReviewIssue[] => {
  const issues: ReviewIssue[] = [];

  issues.push({
    type: 'legal',
    severity: 'suggestion',
    message: 'Verify that GST/tax information is clearly stated and accurate.',
  });

  return issues;
};

/**
 * Get presentation suggestions
 */
const getPresentationSuggestions = (quotation: Quotation): string[] => {
  const suggestions: string[] = [];

  if (!quotation.services || quotation.services.length === 0) {
    return suggestions;
  }

  // Check for free/complimentary services
  const freeServices = quotation.services.filter(s => (s.unit_price || 0) === 0 && (s.quantity || 0) > 0);
  if (freeServices.length > 0) {
    suggestions.push(`Consider clearly marking ${freeServices.length} free/complimentary service(s) in the quotation.`);
  }

  // Check for high-value items
  const highValueServices = quotation.services.filter(s => (s.amount || 0) > 100000);
  if (highValueServices.length > 0) {
    suggestions.push(`Consider highlighting ${highValueServices.length} high-value service(s) for better visibility.`);
  }

  // Check service count
  if (quotation.services.length > 10) {
    suggestions.push('Consider grouping similar services for better readability.');
  }

  // Check for round numbers (might indicate estimates)
  const estimatedServices = quotation.services.filter(s => {
    const price = s.unit_price || 0;
    return price > 0 && price % 1000 === 0;
  });
  if (estimatedServices.length === quotation.services.length && estimatedServices.length > 0) {
    suggestions.push('All prices appear to be rounded. Consider if more precise pricing is needed.');
  }

  return suggestions;
};

/**
 * Format service name professionally
 */
export const formatServiceName = (serviceName: string): string => {
  if (!serviceName) return '';

  let formatted = serviceName.trim();

  // Capitalize first letter
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  // Fix spacing
  formatted = formatted.replace(/\s+/g, ' ').trim();

  // Common professional formatting
  const replacements: Record<string, string> = {
    'website': 'Website',
    'web': 'Web',
    'app': 'App',
    'api': 'API',
    'ui': 'UI',
    'ux': 'UX',
    'seo': 'SEO',
  };

  Object.entries(replacements).forEach(([lower, proper]) => {
    const regex = new RegExp(`\\b${lower}\\b`, 'gi');
    formatted = formatted.replace(regex, proper);
  });

  return formatted;
};

/**
 * Auto-correct quotation calculations
 */
export const autoCorrectCalculations = (quotation: Quotation): Quotation => {
  const corrected = { ...quotation };

  if (!corrected.services) {
    return corrected;
  }

  // Correct service amounts
  corrected.services = corrected.services.map(service => ({
    ...service,
    amount: (service.quantity || 0) * (service.unit_price || 0),
  }));

  // Correct subtotal
  corrected.subtotal = corrected.services.reduce((sum, service) => {
    return sum + (service.amount || 0);
  }, 0);

  // Correct GST amount
  if (corrected.gst_percentage >= 0 && corrected.gst_percentage <= 100) {
    corrected.gst_amount = (corrected.subtotal * corrected.gst_percentage) / 100;
  } else {
    corrected.gst_amount = 0;
  }

  // Correct grand total
  corrected.grand_total = corrected.subtotal + corrected.gst_amount;

  // Round to 2 decimal places
  corrected.subtotal = Math.round(corrected.subtotal * 100) / 100;
  corrected.gst_amount = Math.round(corrected.gst_amount * 100) / 100;
  corrected.grand_total = Math.round(corrected.grand_total * 100) / 100;

  // Round service amounts
  corrected.services = corrected.services.map(service => ({
    ...service,
    amount: Math.round(service.amount * 100) / 100,
  }));

  return corrected;
};

