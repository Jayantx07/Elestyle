import type { IProduct, ICategory } from '../types';
import { SearchConfig } from '../config/config';
import { normalizeQuery, singularize } from './normalize';
import { hasAnyMatch, hasAllMatches } from './matcher';

export function rankCategory(category: ICategory, normalizedQuery: string): number {
  if (!normalizedQuery) return 0;
  
  const queryWords = normalizedQuery.split(' ').map(singularize);
  const titleWords = normalizeQuery(category.title).split(' ');
  const keywordWords = category.keywords.map(normalizeQuery);
  const synonymWords = category.synonyms.map(normalizeQuery);

  let score = 0;

  // 1. Title Match
  if (hasAllMatches(queryWords, titleWords)) {
    score = Math.max(score, SearchConfig.weights.partialTitleMatch); // 90
    // Exact match boost
    if (normalizedQuery === normalizeQuery(category.title)) {
      score = 100; // Exact Category Match (treat as exact)
    }
  }

  // 2. Keywords / Synonyms Match
  if (score === 0) {
    if (hasAllMatches(queryWords, keywordWords) || hasAllMatches(queryWords, synonymWords)) {
      score = Math.max(score, SearchConfig.weights.categoryMatch); // 80
    }
  }

  // 3. Partial Keyword Match
  if (score === 0) {
    if (hasAnyMatch(queryWords, keywordWords) || hasAnyMatch(queryWords, titleWords)) {
      score = Math.max(score, SearchConfig.weights.categoryMatch - 10); // 70
    }
  }

  return score;
}

export function rankProduct(product: IProduct, normalizedQuery: string): number {
  if (!normalizedQuery) return 0;

  const queryWords = normalizedQuery.split(' ').map(singularize);
  
  const titleWords = normalizeQuery(product.title).split(' ');
  const keywordWords = product.searchKeywords.map(normalizeQuery);
  const synonymWords = product.synonyms.map(normalizeQuery);
  const tagWords = product.tags.map(normalizeQuery);
  const descWords = normalizeQuery(product.description).split(' ');

  let score = 0;

  // 1. Exact ID match (rare, but useful)
  if (normalizedQuery === product.id.toLowerCase()) {
    return SearchConfig.weights.exactProductMatch; // 100
  }

  // 2. Exact Title Match
  if (normalizedQuery === normalizeQuery(product.title)) {
    return SearchConfig.weights.exactProductMatch; // 100
  }

  // 3. Partial Title Match (all words match)
  if (hasAllMatches(queryWords, titleWords)) {
    score = Math.max(score, SearchConfig.weights.partialTitleMatch); // 90
  }

  // 4. Keyword / Synonym Match
  if (hasAllMatches(queryWords, keywordWords) || hasAllMatches(queryWords, synonymWords)) {
    score = Math.max(score, SearchConfig.weights.keywordMatch); // 70
  }

  // 5. Tag Match
  if (hasAllMatches(queryWords, tagWords)) {
    score = Math.max(score, SearchConfig.weights.tagMatch); // 60
  }

  // 6. Description Match
  if (hasAllMatches(queryWords, descWords)) {
    score = Math.max(score, SearchConfig.weights.descriptionMatch); // 30
  }

  // Fallbacks: If not all words match, check if ANY word matches for a lower score
  if (score === 0) {
    if (hasAnyMatch(queryWords, titleWords)) {
      score = Math.max(score, 50);
    } else if (hasAnyMatch(queryWords, keywordWords) || hasAnyMatch(queryWords, synonymWords)) {
      score = Math.max(score, 40);
    } else if (hasAnyMatch(queryWords, tagWords)) {
      score = Math.max(score, 35);
    } else if (hasAnyMatch(queryWords, descWords)) {
      score = Math.max(score, 20);
    }
  }

  return score;
}
