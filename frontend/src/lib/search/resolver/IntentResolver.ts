import type { SearchResultItem } from '../types';
import { IntentType } from '../types';
import { SearchConfig } from '../config/config';

export class IntentResolver {
  /**
   * Resolves the primary intent based on the ranked results.
   */
  public static resolve(categoryResults: SearchResultItem[], productResults: SearchResultItem[]): IntentType {
    const topProduct = productResults.length > 0 ? productResults[0] : null;
    const topCategory = categoryResults.length > 0 ? categoryResults[0] : null;

    if (!topProduct && !topCategory) {
      return IntentType.NONE;
    }

    // Rule 1: Exact Product Match
    if (topProduct && topProduct.score >= SearchConfig.weights.exactProductMatch) {
      return IntentType.PRODUCT;
    }

    // Rule 2: Strong Category Intent
    if (topCategory && topCategory.score >= SearchConfig.weights.categoryMatch) {
      // If there's an exact product match, we still return Product, but if product is < exact match,
      // a strong category match implies Category Intent
      if (!topProduct || topProduct.score < SearchConfig.weights.exactProductMatch) {
        return IntentType.CATEGORY;
      }
    }

    // Rule 3: Multiple Products / Mixed Intent
    // If we have some products but they are just partial matches or keyword matches
    if (productResults.length > 0) {
      // Check if they mostly belong to one category (not strictly required by user, but nice)
      return IntentType.MIXED;
    }

    return IntentType.NONE;
  }

  /**
   * Determines the final URL to navigate to when the user presses "Enter" without selecting a specific dropdown item.
   */
  public static getNavigationUrl(intent: IntentType, query: string, topProduct?: SearchResultItem, topCategory?: SearchResultItem): string {
    switch (intent) {
      case IntentType.PRODUCT:
        return topProduct ? topProduct.url : `/search?q=${encodeURIComponent(query)}`;
      case IntentType.CATEGORY:
        return topCategory ? topCategory.url : `/search?q=${encodeURIComponent(query)}`;
      case IntentType.MIXED:
      case IntentType.NONE:
      default:
        return `/search?q=${encodeURIComponent(query)}`;
    }
  }
}
