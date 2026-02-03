/**
 * Validation Utilities
 */

import type { Service, Quotation } from '@/types';

export const isValidService = (service: Service): boolean => {
  if (!service.service_name || service.service_name.trim().length === 0) {
    return false;
  }

  const name = service.service_name.toLowerCase();
  // Remove services that have quantity/price keywords in the name (invalid parsing)
  return !name.match(/\b(?:quantity|qty|price|rate)\s+\d+/);
};

export const cleanInvalidServices = (services: Service[]): Service[] => {
  return services.filter(isValidService);
};

export const validateQuotation = (quotation: Quotation | null): boolean => {
  if (!quotation) return false;
  if (!quotation.services || !Array.isArray(quotation.services)) return false;
  
  // Clean invalid services
  quotation.services = cleanInvalidServices(quotation.services);
  
  return true;
};

export const normalizeQuotation = (quotation: Quotation | null): Quotation => {
  if (!quotation) {
    return {
      services: [],
      subtotal: 0,
      gst_percentage: 0,
      gst_amount: 0,
      grand_total: 0,
    };
  }

  return {
    services: cleanInvalidServices(quotation.services),
    subtotal: quotation.subtotal || 0,
    gst_percentage: quotation.gst_percentage || 0,
    gst_amount: quotation.gst_amount || 0,
    grand_total: quotation.grand_total || 0,
  };
};

