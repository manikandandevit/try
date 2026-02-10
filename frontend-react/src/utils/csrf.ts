/**
 * CSRF Token Utility
 * Handles CSRF token retrieval for Django backend
 */

export const getCsrfToken = (): string => {
  // Try to get from meta tag first
  const metaTag = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.content;
  }

  // Try to get from hidden input
  const csrfInput = document.querySelector<HTMLInputElement>('[name=csrfmiddlewaretoken]');
  if (csrfInput) {
    return csrfInput.value;
  }

  // Fallback to cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken' && value) {
      return decodeURIComponent(value);
    }
  }

  return '';
};

