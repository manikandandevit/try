/**
 * Instant Update Pattern Matcher
 * Handles real-time quotation updates from natural language commands
 */

import type { Quotation, InstantUpdateResult } from '@/types';
import { recalculateTotals } from './quotation-calculator';
import { round } from './format';
import { generateKeyFeatures } from './key-features-generator';

export const tryInstantUpdate = (
  message: string,
  currentQuotation: Quotation | null
): InstantUpdateResult => {
  // Initialize quotation if it doesn't exist
  if (!currentQuotation) {
    currentQuotation = {
      services: [],
      subtotal: 0,
      gst_percentage: 0,
      gst_amount: 0,
      grand_total: 0,
    };
  }

  if (!currentQuotation.services) {
    currentQuotation.services = [];
  }

  const lowerMessage = message.toLowerCase().trim();
  let updated = false;
  let quotation = { ...currentQuotation };

  // Pattern 1: Add service with quantity and price
  const addServiceWithDetailsPatterns = [
    /add\s+service\s+(.+?)\s+(?:quantity|qty)\s+(\d+)\s+(?:and\s+)?(?:price|rate)\s+(\d+(?:\.\d+)?)/i,
    /add\s+(.+?)\s+(?:quantity|qty)\s+(\d+)\s+(?:and\s+)?(?:price|rate)\s+(\d+(?:\.\d+)?)/i,
    /add\s+(?:service\s+)?(.+?)\s+with\s+(?:quantity|qty)\s+(\d+)\s+(?:and\s+)?(?:price|rate)\s+(\d+(?:\.\d+)?)/i,
  ];

  for (const pattern of addServiceWithDetailsPatterns) {
    const match = message.match(pattern);
    if (match) {
      let serviceName = match[1]?.trim() || '';
      serviceName = serviceName.replace(/\s+service\s*$/i, '').trim();
      serviceName = serviceName.replace(/\s+(?:quantity|qty)\s*$/i, '').trim();
      
      const quantity = parseInt(match[2] || '0', 10);
      const price = parseFloat(match[3] || '0');

      if (serviceName && serviceName.length > 0 && !isNaN(quantity) && !isNaN(price)) {
        const existingIndex = quotation.services.findIndex(
          (s) => s.service_name.toLowerCase() === serviceName.toLowerCase()
        );

        if (existingIndex === -1) {
          quotation.services.push({
            service_name: serviceName,
            quantity,
            unit_price: price,
            amount: round(quantity * price, 2),
            key_features: generateKeyFeatures(serviceName),
          });
          updated = true;
        } else {
          const existingService = quotation.services[existingIndex];
          quotation.services[existingIndex] = {
            service_name: existingService.service_name,
            quantity,
            unit_price: price,
            amount: round(quantity * price, 2),
            // Generate key features if not already present
            key_features: existingService.key_features || generateKeyFeatures(serviceName),
          };
          updated = true;
        }
      }
      break;
    }
  }

  // Pattern 2: Add service (simple)
  if (!updated) {
    const addServicePatterns = [
      /^add\s+service\s+(.+)$/i,
      /^add\s+(.+?)(?:\s+service)?$/i,
    ];

    for (const pattern of addServicePatterns) {
      const match = lowerMessage.match(pattern);
      if (match) {
        let serviceName = match[1]?.trim() || '';
        serviceName = serviceName.replace(/\s+service\s*$/i, '').trim();

        if (serviceName && !serviceName.match(/\b(?:quantity|qty|price|rate)\b/i)) {
          const existingIndex = quotation.services.findIndex(
            (s) => s.service_name.toLowerCase() === serviceName.toLowerCase()
          );

          if (existingIndex === -1) {
            quotation.services.push({
              service_name: serviceName,
              quantity: 1,
              unit_price: 0,
              amount: 0,
              key_features: generateKeyFeatures(serviceName),
            });
            updated = true;
          }
        }
        break;
      }
    }
  }

  // Pattern 3: Change service name
  const changeNamePatterns = [
    /change\s+(?:the\s+)?service\s+name\s+(.+?)\s+to\s+(.+)/i,
    /change\s+(?:the\s+)?(.+?)\s+service\s+name\s+to\s+(.+)/i,
    /change\s+(?:existing\s+)?service\s+(.+?)\s+to\s+(.+)/i,
    /change\s+(?:the\s+)?(.+?)\s+to\s+(.+)/i,
    /rename\s+(?:the\s+)?(.+?)\s+(?:service\s+)?(?:to|into)\s+(.+)/i,
  ];

  for (const pattern of changeNamePatterns) {
    const match = lowerMessage.match(pattern);
    if (match && quotation.services.length > 0) {
      let oldName = match[1]?.trim() || '';
      let newName = match[2]?.trim() || '';

      oldName = oldName.replace(/\s+service\s*$/i, '').trim();
      newName = newName.replace(/\s+service\s*$/i, '').trim();

      if (oldName && newName && oldName.toLowerCase() !== newName.toLowerCase()) {
        const serviceIndex = quotation.services.findIndex((service) => {
          const serviceNameLower = service.service_name.toLowerCase();
          const oldNameLower = oldName.toLowerCase();
          return (
            serviceNameLower === oldNameLower ||
            serviceNameLower.includes(oldNameLower) ||
            oldNameLower.includes(serviceNameLower)
          );
        });

        if (serviceIndex !== -1) {
          const existingService = quotation.services[serviceIndex];
          quotation.services[serviceIndex] = {
            service_name: newName,
            quantity: existingService.quantity,
            unit_price: existingService.unit_price,
            amount: existingService.amount,
            // Regenerate key features since service name changed
            key_features: generateKeyFeatures(newName),
          };
          updated = true;
        }
      }
      break;
    }
  }

  // Pattern 4: Change price
  const pricePatterns = [
    /change\s+(?:the\s+)?(?:price\s+)?amount\s+(\d+(?:\.\d+)?)\s+(?:into|to)\s+(\d+(?:\.\d+)?)/i,
    /change\s+(?:price|rate)\s+(?:to|to\s+)?(\d+(?:\.\d+)?)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = lowerMessage.match(pattern);
    if (match && quotation.services.length > 0) {
      if (match[2]) {
        // Change specific price amount
        const oldPrice = parseFloat(match[1] || '0');
        const newPrice = parseFloat(match[2] || '0');

        const serviceIndex = quotation.services.findIndex((service) => {
          const servicePrice = service.unit_price || service.price || service.unit_rate || 0;
          return Math.abs(servicePrice - oldPrice) < 0.01;
        });

        if (serviceIndex !== -1) {
          const service = quotation.services[serviceIndex];
          quotation.services[serviceIndex] = {
            service_name: service.service_name,
            quantity: service.quantity,
            unit_price: newPrice,
            price: newPrice,
            unit_rate: newPrice,
            amount: round(service.quantity * newPrice, 2),
            key_features: service.key_features,
          };
          updated = true;
        }
      } else {
        // Change last service price
        const newPrice = parseFloat(match[1] || '0');
        const lastService = quotation.services[quotation.services.length - 1];
        if (lastService) {
          quotation.services[quotation.services.length - 1] = {
            service_name: lastService.service_name,
            quantity: lastService.quantity,
            unit_price: newPrice,
            price: newPrice,
            unit_rate: newPrice,
            amount: round(lastService.quantity * newPrice, 2),
            key_features: lastService.key_features,
          };
          updated = true;
        }
      }
      break;
    }
  }

  // Pattern 5: Change GST
  const gstPatterns = [
    /change\s+(?:the\s+)?gst\s+percentage\s+(\d+(?:\.\d+)?)\s+(?:to|into)\s+(\d+(?:\.\d+)?)/i,
    /change\s+(?:the\s+)?gst\s+(?:percentage\s+)?(?:to|to\s+)?(\d+(?:\.\d+)?)/i,
  ];

  for (const pattern of gstPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      const newGst = parseFloat(match[2] || match[1] || '0');
      quotation.gst_percentage = newGst;
      updated = true;
      break;
    }
  }

  // Pattern 6: Change quantity
  const quantityMatch = lowerMessage.match(/change\s+quantity\s+(?:to|to\s+)?(\d+)/i);
  if (quantityMatch && quotation.services.length > 0) {
    const newQuantity = parseInt(quantityMatch[1] || '0', 10);
    const lastService = quotation.services[quotation.services.length - 1];
    if (lastService) {
      const unitPrice = lastService.unit_price || lastService.price || lastService.unit_rate || 0;
      quotation.services[quotation.services.length - 1] = {
        service_name: lastService.service_name,
        quantity: newQuantity,
        unit_price: lastService.unit_price,
        amount: round(unitPrice * newQuantity, 2),
        key_features: lastService.key_features,
      };
      updated = true;
    }
  }

  // Pattern 7: Remove service
  const removePatterns = [
    /(?:remove|delete)\s+(.+?)\s+(?:quantity|qty)\s+\d+/i,
    /(?:remove|delete)\s+(.+)/i,
  ];

  for (const pattern of removePatterns) {
    const match = lowerMessage.match(pattern);
    if (match && quotation.services.length > 0) {
      let toRemove = match[1]?.trim() || '';
      toRemove = toRemove.replace(/\s+(?:quantity|qty|price|rate).*$/i, '').trim();
      toRemove = toRemove.replace(/\s+(?:works?|service)\s*$/i, '').trim();

      const index = quotation.services.findIndex((service) => {
        const serviceNameLower = service.service_name.toLowerCase();
        const toRemoveLower = toRemove.toLowerCase();
        return (
          serviceNameLower === toRemoveLower ||
          serviceNameLower.includes(toRemoveLower) ||
          toRemoveLower.includes(serviceNameLower)
        );
      });

      if (index !== -1) {
        quotation.services.splice(index, 1);
        updated = true;
      }
      break;
    }
  }

  if (updated) {
    quotation = recalculateTotals(quotation);
  }

  return {
    updated,
    quotation: updated ? quotation : null,
  };
};

