/**
 * Formatting Utilities
 */

export const formatNumber = (num: number): string => {
  return parseFloat(num.toString()).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatCurrency = (amount: number): string => {
  return `₹ ${formatNumber(amount)}`;
};

export const formatDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const round = (value: number, decimals: number): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

