import type { ISearchProvider, SearchResult, SearchResultItem } from '../types';
import { IntentType } from '../types';
import { publicProductService } from '../../../services/publicProductService';
import { CATEGORIES } from '../../../data/categories';
import { normalizeQuery } from '../engine/normalize';
import { rankCategory, rankProduct } from '../engine/ranking';
import { IntentResolver } from '../resolver/IntentResolver';
import { SearchConfig } from '../config/config';

export class ApiSearchProvider implements ISearchProvider {
  public async search(query: string): Promise<SearchResult> {
    try {
      const normalizedQuery = normalizeQuery(query);
      
      // 1. Rank Categories locally
      const categoryResults: SearchResultItem[] = CATEGORIES
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

      // 2. Fetch Products from Backend
      const res = await publicProductService.getProducts({ search: query, limit: SearchConfig.maxLiveSuggestions });
      
      const productResults: SearchResultItem[] = res.data.map((p: any) => {
        const iProduct = {
          id: p._id,
          title: p.name,
          slug: p.slug,
          category: p.category?.slug || '',
          description: p.description || '',
          price: p.price,
          images: p.images?.map((img: any) => img.secure_url) || [],
          tags: p.tags || [],
          searchKeywords: p.searchKeywords || [],
          synonyms: [],
        };
        
        let score = rankProduct(iProduct, normalizedQuery);
        
        const parentCategoryScore = categoryResults.find(c => c.id === p.category?._id || c.url.includes(p.category?.slug))?.score || 0;
        if (score === 0 && parentCategoryScore >= SearchConfig.weights.categoryMatch) {
          score = parentCategoryScore - 10;
        }
        if (score === 0) score = 10;

        return {
          id: p._id,
          slug: p.slug,
          type: 'PRODUCT' as const,
          title: p.name,
          subtitle: p.category?.name || 'Uncategorized',
          image: p.images?.find((img: any) => img.isFeatured)?.secure_url || p.images?.[0]?.secure_url || '',
          price: p.price,
          url: `/product/${p.slug || p._id}`,
          score,
          originalData: p as any, 
        };
      }).sort((a: SearchResultItem, b: SearchResultItem) => b.score - a.score);

      // 3. Resolve Intent
      const intent = IntentResolver.resolve(categoryResults, productResults);

      return {
        query,
        intent,
        categories: categoryResults.slice(0, 3), 
        products: productResults,
        suggestions: [],
        popularSearches: ['table', 'soaps', 'earrings', 'giveaways']
      };
    } catch (error) {
      console.error('API Search error:', error);
      return {
        query,
        intent: IntentType.NONE,
        categories: [],
        products: [],
        suggestions: [],
        popularSearches: ['table', 'soaps', 'earrings', 'giveaways']
      };
    }
  }

  public async getPopularSearches(): Promise<string[]> {
    return Promise.resolve(['table', 'soaps', 'earrings', 'giveaways']);
  }
}
