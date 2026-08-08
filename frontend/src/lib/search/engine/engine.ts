import type { IProduct, ICategory, SearchResult, SearchResultItem } from '../types';
import { IntentType } from '../types';
import { SearchConfig } from '../config/config';
import { normalizeQuery } from './normalize';
import { rankCategory, rankProduct } from './ranking';
import { IntentResolver } from '../resolver/IntentResolver';

export class SearchEngine {
  private products: IProduct[];
  private categories: ICategory[];

  constructor(products: IProduct[], categories: ICategory[]) {
    this.products = products;
    this.categories = categories;
  }

  public async search(query: string): Promise<SearchResult> {
    const normalizedQuery = normalizeQuery(query);
    
    // Quick return for empty query
    if (!normalizedQuery || normalizedQuery.length < SearchConfig.minQueryLength) {
      return {
        query,
        intent: IntentType.NONE,
        categories: [],
        products: [],
        suggestions: [],
        popularSearches: SearchConfig.popularSearches,
      };
    }

    // 1. Rank Categories
    const categoryResults: SearchResultItem[] = this.categories
      .map(cat => {
        const score = rankCategory(cat, normalizedQuery);
        return {
          id: cat.id,
          type: 'CATEGORY' as const,
          title: cat.title,
          image: cat.image,
          url: `/category/${cat.slug}`,
          score,
          originalData: cat
        };
      })
      .filter(res => res.score > 0)
      .sort((a, b) => b.score - a.score);

    // 2. Rank Products
    const productResults: SearchResultItem[] = this.products
      .map(prod => {
        // Boost product score if it belongs to a highly ranked category
        let score = rankProduct(prod, normalizedQuery);
        const parentCategoryScore = categoryResults.find(c => (c.originalData as ICategory).slug === prod.category)?.score || 0;
        
        // If the user's intent is clearly a category, surface products in that category
        if (score === 0 && parentCategoryScore >= SearchConfig.weights.categoryMatch) {
          score = parentCategoryScore - 10; // Boost to slightly below category match
        }

        return {
          id: prod.id,
          type: 'PRODUCT' as const,
          title: prod.title,
          subtitle: prod.category.replace('-', ' '),
          image: prod.images[0],
          price: prod.price,
          url: `/product/${prod.slug}`,
          score,
          originalData: prod
        };
      })
      .filter(res => res.score > 0)
      .sort((a, b) => b.score - a.score);

    // 3. Resolve Intent
    const intent = IntentResolver.resolve(categoryResults, productResults);

    // 4. Generate Suggestions (Combine top categories and products)
    const suggestions = [
      ...categoryResults.map(c => c.title),
      ...productResults.map(p => p.title)
    ].slice(0, 5); // top 5 strings

    return {
      query,
      intent,
      categories: categoryResults.slice(0, 3), // Max 3 categories in dropdown
      products: productResults.slice(0, SearchConfig.maxLiveSuggestions),
      suggestions,
      popularSearches: SearchConfig.popularSearches,
    };
  }
}
