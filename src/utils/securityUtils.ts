/**
 * Sanitizes user input to prevent XSS attacks
 * @param input The input string to sanitize
 * @returns A sanitized string
 */
export const sanitizeInput = (input: string | null | undefined): string | null => {
  if (input === null || input === undefined) {
    return null;
  }

  // Replace potentially dangerous characters with their HTML entities
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\(/g, '&#40;')
    .replace(/\)/g, '&#41;');
};

/**
 * Creates a safe HTML element from a string
 * This is useful when you need to display HTML content that comes from the server
 * and you're sure it's safe (e.g., it's already been sanitized on the server)
 * @param html The HTML string
 * @returns An object with a __html property containing the HTML
 */
export const createSafeHtml = (html: string | null | undefined): { __html: string } => {
  return { __html: html || '' };
};
