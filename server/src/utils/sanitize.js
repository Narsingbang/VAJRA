/**
 * Strips HTML tags, trims, and collapses multiple whitespace characters to single spaces.
 * @param {string} text
 * @returns {string}
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}
