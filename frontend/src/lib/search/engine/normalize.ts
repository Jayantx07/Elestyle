/**
 * Normalizes a query string by:
 * - Converting to lowercase
 * - Trimming leading/trailing spaces
 * - Replacing multiple spaces with a single space
 * - Removing punctuation
 * - Normalizing basic plurals where appropriate (lightweight)
 */
export function normalizeQuery(query: string): string {
  if (!query) return '';

  let normalized = query.toLowerCase();

  // Remove punctuation (keep alphanumeric and spaces)
  normalized = normalized.replace(/[^\w\s]|_/g, '');

  // Remove duplicate spaces and trim
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Basic stemming/plural normalization for English.
 * In a production setting with a complex dataset, a library like `natural` or stemming could be used.
 * For our dataset, we can handle basic 's' removals for singularization if needed, 
 * but exact exact matching combined with typo tolerance handles most cases.
 */
export function singularize(word: string): string {
  const lowercaseWord = word.toLowerCase();
  
  if (lowercaseWord.endsWith('ies') && lowercaseWord.length > 4) {
    return lowercaseWord.slice(0, -3) + 'y';
  }
  if (lowercaseWord.endsWith('es') && lowercaseWord.length > 3) {
    return lowercaseWord.slice(0, -2);
  }
  if (lowercaseWord.endsWith('s') && lowercaseWord.length > 2) {
    return lowercaseWord.slice(0, -1);
  }
  
  return lowercaseWord;
}
