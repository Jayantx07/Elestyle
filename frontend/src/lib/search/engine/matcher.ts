import { SearchConfig } from '../config/config';
import { levenshteinDistance } from '../utils';

/**
 * Checks if a search term matches a target string.
 * It uses strict substring matching first, then falls back to typo-tolerant 
 * Levenshtein distance matching if configured.
 * 
 * @param queryWord The individual word searched by the user (normalized)
 * @param targetWord The word in the product/category data (normalized)
 * @returns true if it matches within acceptable bounds
 */
export function isMatch(queryWord: string, targetWord: string): boolean {
  if (!queryWord || !targetWord) return false;

  // 1. Exact or Substring Match (e.g., query "bag" matches target "bags" or "handbag")
  if (targetWord.includes(queryWord)) {
    return true;
  }

  // 2. Typo Tolerance (Levenshtein Distance)
  // Only apply typo tolerance for words of a reasonable length
  if (queryWord.length >= SearchConfig.minQueryLength + 2) {
    const distance = levenshteinDistance(queryWord, targetWord);
    
    // Accept up to 1 typo for words length 4-5, 2 typos for 6+
    const allowedTypos = queryWord.length > 5 ? SearchConfig.typoThreshold : 1;

    if (distance <= allowedTypos) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if ANY word in the query array matches ANY word in the target array
 */
export function hasAnyMatch(queryWords: string[], targetWords: string[]): boolean {
  return queryWords.some(qWord => targetWords.some(tWord => isMatch(qWord, tWord)));
}

/**
 * Checks if ALL words in the query array match AT LEAST ONE word in the target array
 */
export function hasAllMatches(queryWords: string[], targetWords: string[]): boolean {
  if (queryWords.length === 0) return false;
  return queryWords.every(qWord => targetWords.some(tWord => isMatch(qWord, tWord)));
}
