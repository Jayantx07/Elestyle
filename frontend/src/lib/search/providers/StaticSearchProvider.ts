import { SearchEngine } from '../engine/engine';
import type { ISearchProvider, SearchResult } from '../types';
import { CATEGORIES } from '../../../data/categories';
import { SearchConfig } from '../config/config';
import { PRODUCTS } from '../../../data/products';

export class StaticSearchProvider implements ISearchProvider {
  private engine: SearchEngine;

  constructor() {
    this.engine = new SearchEngine(PRODUCTS, CATEGORIES);
  }

  public async search(query: string): Promise<SearchResult> {
    // We simulate network delay or just return the promise directly.
    // Since it's a static provider, it's very fast, but keeping the signature async
    // guarantees the UI is ready for a real API.
    return this.engine.search(query);
  }

  public async getPopularSearches(): Promise<string[]> {
    return Promise.resolve(SearchConfig.popularSearches);
  }
}
