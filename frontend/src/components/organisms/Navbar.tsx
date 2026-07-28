import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import { LiveSearch } from './LiveSearch';
import { IntentResolver } from '../../lib/search/resolver/IntentResolver';
import { fetchPublicCategories } from '../../services/publicCategoryService';

const LOGO_URL =
  'https://res.cloudinary.com/gc1qeznc/image/upload/v1784531072/logo_ellestyle_ierdp3.jpg';

// Dynamic navigation links are fetched from the API

export const Navbar: React.FC = () => {
  const [navLinks, setNavLinks] = useState<{label: string, href: string}[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const loadCategories = () => {
      fetchPublicCategories({ navbar: true }).then((cats) => {
        setNavLinks(cats.map(c => ({ label: c.name, href: `/shop/${c.slug}` })));
      });
    };
    
    // Initial load
    loadCategories();

    // Listen for cross-tab or cross-component updates
    const channel = new BroadcastChannel('category_updates');
    channel.onmessage = (event) => {
      if (event.data === 'updated') {
        loadCategories();
      }
    };

    return () => {
      channel.close();
    };
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const { query, isSearching, result, handleQueryChange, clearSearch } = useSearch();

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle enter key for search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim().length > 0) {
      const url = IntentResolver.getNavigationUrl(result.intent, query, result.products[0], result.categories[0]);
      navigate(url);
      setIsSearchOpen(false);
      clearSearch();
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed left-0 right-0 top-6 z-50 pointer-events-none">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div
          className={`pointer-events-auto h-[64px] md:h-[70px] flex items-center justify-between px-4 sm:px-6 md:px-8 rounded-full transition-all duration-300 border border-gray-100 ${
            isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'
          }`}
        >
        {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0" aria-label="ElleStyle — Home">
            <img
              src={LOGO_URL}
              alt="ElleStyle logo"
              className="h-10 md:h-[46px] w-auto object-contain rounded-md"
              loading="eager"
            />
          </Link>

        {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-8" aria-label="Main navigation">
            <ul className="flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <NavLink
                    to={link.href}
                    className={({ isActive }) =>
                      `font-sans text-[14px] ${isActive ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'} transition-all duration-200 hover:text-gray-900`
                    }
                  >
                    <span>
                      {link.label}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

        {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 ml-auto">
          {/* Search */}
          <div className="relative flex items-center" ref={searchContainerRef}>
            {isSearchOpen ? (
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 md:py-2 transition-all w-[200px] sm:w-[250px] md:w-[300px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-2 flex-shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="bg-transparent border-none outline-none w-full text-sm text-gray-900 placeholder-gray-500"
                />
                <button onClick={() => { setIsSearchOpen(false); clearSearch(); }} className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                aria-label="Search"
                className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:bg-gray-100 transition-transform duration-150"
                style={{ color: 'var(--text-primary)', transformOrigin: 'center' }}
                onClick={() => setIsSearchOpen(true)}
              >
                <svg width="20" height="20" className="md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            )}
            
            {/* Live Search Dropdown */}
            {isSearchOpen && (
              <LiveSearch
                query={query}
                isSearching={isSearching}
                result={result}
                onClose={() => setIsSearchOpen(false)}
                onSelectResult={() => { setIsSearchOpen(false); clearSearch(); }}
              />
            )}
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            aria-label="Shopping bag"
            className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-150"
            style={{ color: 'var(--text-primary)', transformOrigin: 'center' }}
          >
            <svg width="20" height="20" className="md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </Link>

          {/* Account */}
          <Link
            to="/profile"
            aria-label="Account"
            className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-150"
            style={{ color: 'var(--text-primary)', transformOrigin: 'center' }}
          >
            <svg width="20" height="20" className="md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>

          {/* Mobile hamburger */}
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-transform duration-150"
            style={{ color: 'var(--text-primary)', transformOrigin: 'center' }}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          className="lg:hidden max-w-7xl mx-auto mt-2 rounded-2xl overflow-hidden shadow-lg"
          style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border)', border: '1px solid var(--border)' }}
        >
          <nav className="flex flex-col py-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-6 py-4 font-sans text-sm font-medium transition-colors duration-200 hover:bg-gray-50"
                style={{ color: 'var(--text-primary)' }}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

