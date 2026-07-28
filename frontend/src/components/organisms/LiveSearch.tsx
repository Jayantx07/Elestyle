import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { SearchResult } from '../../lib/search/types';
import { IntentResolver } from '../../lib/search/resolver/IntentResolver';

interface LiveSearchProps {
  query: string;
  isSearching: boolean;
  result: SearchResult;
  onClose: () => void;
  onSelectResult?: () => void;
}

export const LiveSearch: React.FC<LiveSearchProps> = ({ query, isSearching, result, onClose, onSelectResult }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSeeAll = () => {
    if (onSelectResult) onSelectResult();
    const url = IntentResolver.getNavigationUrl(result.intent, result.query, result.products[0], result.categories[0]);
    navigate(url);
    onClose();
  };

  const hasResults = result.products.length > 0 || result.categories.length > 0;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full mt-2 w-full left-0 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col max-h-[80vh]"
      style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
    >
      <div className="overflow-y-auto overscroll-contain p-2">
        {isSearching ? (
          <div className="p-8 text-center text-gray-400 text-sm">Searching...</div>
        ) : query.length > 0 ? (
          <>
            {/* NO RESULTS */}
            {!hasResults && (
              <div className="p-8 text-center">
                <p className="text-gray-900 font-medium mb-1">No results for "{query}"</p>
                <p className="text-gray-500 text-sm mb-6">Try checking your spelling or using more general terms.</p>
                
                {result.popularSearches.length > 0 && (
                  <div className="text-left">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Popular Searches</h4>
                    <div className="flex flex-wrap gap-2 px-2">
                      {result.popularSearches.map(pop => (
                        <Link
                          key={pop}
                          to={`/search?q=${encodeURIComponent(pop)}`}
                          onClick={onClose}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-700 transition-colors"
                        >
                          {pop}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CATEGORY MATCHES */}
            {result.categories.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-2">Categories</h4>
                <ul className="flex flex-col">
                  {result.categories.map(cat => (
                    <li key={cat.id}>
                      <Link 
                        to={cat.url}
                        onClick={() => { if (onSelectResult) onSelectResult(); onClose(); }}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900">{cat.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PRODUCT MATCHES */}
            {result.products.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-2">Products</h4>
                <ul className="flex flex-col">
                  {result.products.map(prod => (
                    <li key={prod.id}>
                      <Link 
                        to={prod.url}
                        onClick={() => { if (onSelectResult) onSelectResult(); onClose(); }}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors rounded-xl"
                      >
                        {prod.image && (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-semibold text-gray-900 line-clamp-1">{prod.title}</span>
                          <span className="text-xs text-gray-500 capitalize">{prod.subtitle}</span>
                        </div>
                        {prod.price && (
                          <span className="text-sm font-medium text-gray-900">₹{prod.price}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          /* EMPTY QUERY STATE (Show popular searches) */
          <div className="p-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Popular Searches</h4>
            <ul className="flex flex-col">
              {result.popularSearches.map(pop => (
                <li key={pop}>
                  <Link
                    to={`/search?q=${encodeURIComponent(pop)}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 transition-colors rounded-lg text-sm text-gray-700"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    {pop}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SEE ALL RESULTS BUTTON */}
      {query.length > 0 && hasResults && (
        <div className="p-2 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={handleSeeAll}
            className="w-full py-2.5 text-sm font-medium text-[var(--accent)] hover:text-gray-900 bg-transparent hover:bg-white rounded-xl transition-all"
          >
            See all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
};
