import { useState, useEffect, useCallback } from 'react';
import type { ISearchProvider, SearchResult } from '../lib/search/types';
import { IntentType } from '../lib/search/types';
import { SearchConfig } from '../lib/search/config/config';
import { debounce } from '../lib/search/utils';

// We inject the provider here. In a real app, this could come from a React Context
// so we can swap it out globally. For now, we instantiate it directly or pass it in.
import { ApiSearchProvider } from '../lib/search/providers/ApiSearchProvider';

// Singleton instance for the hook
const defaultProvider = new ApiSearchProvider();

const initialResult: SearchResult = {
  query: '',
  intent: IntentType.NONE,
  categories: [],
  products: [],
  suggestions: [],
  popularSearches: SearchConfig.popularSearches,
};

export function useSearch(provider: ISearchProvider = defaultProvider) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult>(initialResult);

  // Load popular searches on mount
  useEffect(() => {
    provider.getPopularSearches().then(popularSearches => {
      setResult(prev => ({ ...prev, popularSearches }));
    });
  }, [provider]);

  // Debounced search execution
  const executeSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.trim().length < SearchConfig.minQueryLength) {
        setResult(prev => ({ ...initialResult, popularSearches: prev.popularSearches, query: searchQuery }));
        setIsSearching(false);
        return;
      }

      try {
        const searchResult = await provider.search(searchQuery);
        setResult(searchResult);
      } catch (error) {
        console.error('Search failed', error);
        // Fallback gracefully
        setResult(prev => ({ ...initialResult, popularSearches: prev.popularSearches, query: searchQuery }));
      } finally {
        setIsSearching(false);
      }
    }, SearchConfig.debounceDelayMs),
    [provider]
  );

  // Update query immediately for controlled inputs, but debounce the actual search
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setIsSearching(true);
    executeSearch(newQuery);
  };

  const clearSearch = () => {
    setQuery('');
    setResult(prev => ({ ...initialResult, popularSearches: prev.popularSearches }));
    setIsSearching(false);
  };

  return {
    query,
    isSearching,
    result,
    handleQueryChange,
    clearSearch,
  };
}
