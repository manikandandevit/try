/**
 * Quotation Calculation Utilities
 */

import type { Quotation, Service } from '@/types';
import { round } from './format';

export const calculateServiceAmount = (service: Service): number => {
  const price = service.unit_price || service.price || service.unit_rate || 0;
  const quantity = service.quantity || 0;
  return round(price * quantity, 2);
};

export const recalculateTotals = (quotation: Quotation): Quotation => {
  if (!quotation.services || quotation.services.length === 0) {
    return {
      ...quotation,
      subtotal: 0,
      gst_amount: 0,
      grand_total: 0,
    };
  }

  // Recalculate amounts for each service first
  const servicesWithAmounts = quotation.services.map((service) => ({
    ...service,
    amount: calculateServiceAmount(service),
  }));

  // Calculate subtotal
  const subtotal = servicesWithAmounts.reduce((sum, service) => {
    return sum + (parseFloat(service.amount.toString()) || 0);
  }, 0);

  const calculatedSubtotal = round(subtotal, 2);

  // Calculate GST
  const gstPercentage = parseFloat(quotation.gst_percentage.toString()) || 0;
  const gstAmount = gstPercentage > 0 
    ? round((calculatedSubtotal * gstPercentage) / 100, 2)
    : 0;

  // Calculate grand total
  const grandTotal = round(calculatedSubtotal + gstAmount, 2);

  return {
    ...quotation,
    services: servicesWithAmounts,
    subtotal: calculatedSubtotal,
    gst_amount: gstAmount,
    grand_total: grandTotal,
  };
};

