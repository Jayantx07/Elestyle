import { apiClient } from '@/lib/apiClient';
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import type { SearchResult } from '../lib/search/types';

import { ListingProductCard } from '../components/molecules/ListingProductCard';
import { Typography } from '../components/atoms/Typography';

import { publicProductService } from '../services/publicProductService';

export default function SearchPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setQuery(q);
  }, [location.search]);

  useEffect(() => {
    if (!query) {
      setResult(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    
    publicProductService.getProducts({ search: query, limit: 20 })
      .then(res => {
        if (isMounted) {
          const mappedProducts = res.data.map((p: any) => ({
            id: p._id,
            slug: p.slug,
            title: p.name,
            subtitle: p.category?.name || '',
            image: p.images?.find((img: any) => img.isFeatured)?.secure_url || p.images?.[0]?.secure_url || '',
            price: p.price,
            rating: p.ratingAverage || 0,
            reviewsCount: p.reviewCount || 0
          }));

          setResult({
            query,
            intent: 'PRODUCT',
            categories: [], // Optional: add real categories later
            products: mappedProducts as any,
            suggestions: [],
            popularSearches: []
          });
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Search error:', err);
        if (isMounted) {
          setIsLoading(false);
          setResult({
            query,
            intent: 'PRODUCT',
            categories: [],
            products: [],
            suggestions: [],
            popularSearches: []
          });
        }
      });

    return () => { isMounted = false; };
  }, [query]);

  // Combine categories and products for popular state if empty
  const [popularSearches] = useState<string[]>(['table', 'soaps', 'earrings', 'giveaways']);


  const hasResults = result && (result.products.length > 0 || result.categories.length > 0);

  return (
    <div className="pt-32 pb-16 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <header className="mb-8 md:mb-12">
          <Typography variant="h2" className="mb-2">
            Search Results
          </Typography>
          <p className="text-gray-600">
            {isLoading 
              ? `Searching for "${query}"...` 
              : query 
                ? `Showing results for "${query}"` 
                : 'Enter a search term to find products'}
          </p>
        </header>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !query ? (
          /* Empty Initial State */
          <div className="py-12 bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-center px-4">
            <Typography variant="h3" className="mb-4 text-gray-400">Search Elestyle</Typography>
            <div className="flex flex-wrap justify-center gap-3 max-w-lg">
              {popularSearches.map(pop => (
                <Link
                  key={pop}
                  to={`/search?q=${encodeURIComponent(pop)}`}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  {pop}
                </Link>
              ))}
            </div>
          </div>
        ) : hasResults ? (
          /* Results Found */
          <div className="flex flex-col gap-12">
            {/* Category Matches */}
            {result?.categories.length ? (
              <section>
                <Typography variant="h4" className="mb-6 uppercase tracking-wider text-sm text-gray-500">
                  Matching Categories
                </Typography>
                <div className="flex flex-wrap gap-4">
                  {result.categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={cat.url}
                      className="group relative flex items-center justify-center overflow-hidden rounded-2xl aspect-[3/1] w-full sm:w-[280px] bg-gray-100"
                    >
                      {cat.image && (
                        <img src={cat.image} alt={cat.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                      <span className="relative text-white font-medium text-lg">{cat.title}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Product Matches */}
            {result?.products.length ? (
              <section>
                <div className="flex justify-between items-end mb-6">
                  <Typography variant="h4" className="uppercase tracking-wider text-sm text-gray-500">
                    Products ({result.products.length})
                  </Typography>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {result.products.map(prod => (
                    <ListingProductCard
                      key={prod.id}
                      slug={prod.slug || prod.id}
                      imageSrc={prod.image || ''}
                      altText={prod.title}
                      title={prod.title}
                      category={prod.subtitle || ''}
                      price={prod.price || 0}
                      rating={4.8} // Mock
                      reviewsCount={12} // Mock
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          /* Zero Results State */
          <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl px-4 border border-gray-100">
            <div className="w-16 h-16 mb-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <Typography variant="h3" className="mb-2 text-gray-900">No results found for "{query}"</Typography>
            <p className="text-gray-500 mb-8 max-w-md">We couldn't find anything matching your search. Try checking your spelling or using more general terms.</p>
            
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-[var(--accent)] text-white rounded-full font-medium hover:bg-opacity-90 transition-all"
            >
              Continue Shopping
            </Link>
            
            <div className="mt-12 pt-8 border-t border-gray-200 w-full max-w-2xl text-left">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Try these popular searches instead:</h4>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map(pop => (
                  <Link
                    key={pop}
                    to={`/search?q=${encodeURIComponent(pop)}`}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gray-300 transition-colors"
                  >
                    {pop}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
