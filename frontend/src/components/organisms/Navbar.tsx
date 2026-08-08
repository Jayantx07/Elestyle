import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useSearch } from '../../hooks/useSearch';
import { LiveSearch } from './LiveSearch';
import { IntentResolver } from '../../lib/search/resolver/IntentResolver';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '@/lib/utils';

const LOGO_URL =
  'https://res.cloudinary.com/gc1qeznc/image/upload/v1784531072/logo_ellestyle_ierdp3.jpg';

type CategoryGroup = {
  label: string;
  href: string;
  subcategories?: { label: string; href: string }[];
};

const desktopNavLinkClass = (isActive: boolean) =>
  `font-sans text-[14px] transition-colors duration-200 ${isActive ? 'font-semibold text-gray-900' : 'font-medium text-gray-700 hover:text-gray-900'}`;

const mobileNavLinkClass = (isActive: boolean) =>
  `px-6 py-4 font-sans text-sm transition-colors duration-200 ${isActive ? 'font-semibold text-[var(--text-primary)] bg-gray-50' : 'font-medium text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)]'}`;

const iconButtonStyle = { color: 'var(--text-primary)', transformOrigin: 'center' } as React.CSSProperties;

const MAIN_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
];

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: 'Royal Rajasthani Living',
    href: '/category/royal-rajasthani-living',
    subcategories: [
      { label: 'Handcrafted cushion covers', href: '/category/royal-rajasthani-living/handcrafted-cushion-covers' },
      { label: 'Round table mats', href: '/category/royal-rajasthani-living/round-table-mats' },
      { label: 'Patchwork runners', href: '/category/royal-rajasthani-living/patchwork-runners' },
      { label: 'Patchwork runners & mat set', href: '/category/royal-rajasthani-living/patchwork-runners-and-mat-set' },
    ],
  },
  {
    label: 'Bag Collection',
    href: '/category/bag-collection',
    subcategories: [
      { label: 'Handcrafted Banjara Boko bags', href: '/category/bag-collection/handcrafted-banjara-boko-bags' },
      { label: 'Handcrafted Banjara Zari bag', href: '/category/bag-collection/handcrafted-banjara-zari-bag' },
      { label: 'Ethnic patchwork colorful clutch bags', href: '/category/bag-collection/ethnic-patchwork-colorful-clutch-bags' },
      { label: 'Matka Banjara bags', href: '/category/bag-collection/matka-banjara-bags' },
      { label: 'Macrame bags', href: '/category/bag-collection/macrame-bags' },
    ],
  },
  {
    label: 'Jewelry Collection',
    href: '/category/jewelry-collection',
    subcategories: [
      { label: 'Handmade earrings', href: '/category/jewelry-collection/handmade-earrings' },
      { label: 'Rajasthani earrings', href: '/category/jewelry-collection/rajasthani-earrings' },
      { label: 'Floral thread jewelry', href: '/category/jewelry-collection/floral-thread-jewelry' },
    ],
  },
  {
    label: 'Artisans Candles',
    href: '/category/artisans-candles',
  },
  {
    label: 'Wedding Collections',
    href: '/category/wedding-collections',
  },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavbarHovered, setIsNavbarHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesPanelRef = useRef<HTMLDivElement>(null);
  
  const { itemCount: cartItemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const { user } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();

  const { scrollY } = useScroll({ target: shellRef, offset: ['start start', 'end start'] });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 20);
  });

  const { query, isSearching, result, handleQueryChange, clearSearch } = useSearch();

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (categoriesPanelRef.current && !categoriesPanelRef.current.contains(target)) {
        setIsCategoriesOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCategoriesOpen(false);
        setIsSearchOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
    setIsCategoriesOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const isShopSectionActive = location.pathname.startsWith('/category/');
  const isCategoriesPageActive = location.pathname === '/categories';

  return (
    <header ref={headerRef} className="fixed left-0 right-0 top-6 z-50 pointer-events-none">
      <div
        ref={shellRef}
        className="mx-auto relative max-w-[1180px] px-3 transition-[max-width,padding] duration-300 md:max-w-[1220px] md:px-4 lg:hover:max-w-[1260px] lg:hover:px-5"
      >
        <motion.div
          animate={{
            backgroundColor: isScrolled || isNavbarHovered ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,1)',
            boxShadow: isScrolled || isNavbarHovered
              ? '0 12px 30px rgba(27,42,46,0.08)'
              : '0 4px 14px rgba(27,42,46,0.04)',
            paddingLeft: isNavbarHovered ? 36 : 28,
            paddingRight: isNavbarHovered ? 36 : 28,
            height: isNavbarHovered ? 72 : 64,
          }}
          transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          onMouseEnter={() => setIsNavbarHovered(true)}
          onMouseLeave={() => setIsNavbarHovered(false)}
          className={cn('pointer-events-auto flex items-center justify-between rounded-full border border-gray-100 backdrop-blur-md sm:px-6 md:h-[66px] md:px-8')}
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
          <div className="hidden lg:flex flex-1 justify-center px-8">
            <nav className="flex items-center gap-5 xl:gap-7" aria-label="Main navigation">
              <NavLink
                to="/"
                end
                className={({ isActive }) => desktopNavLinkClass(isActive)}
              >
                Home
              </NavLink>

              <div
                className="relative flex items-center gap-1"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <NavLink
                  to="/categories"
                  className={`font-sans text-[14px] transition-colors duration-200 ${isCategoriesPageActive || isShopSectionActive ? 'font-semibold text-black' : 'font-medium text-black hover:text-gray-800'}`}
                >
                  Categories
                </NavLink>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isCategoriesOpen}
                  onClick={() => setIsCategoriesOpen((open) => !open)}
                  className="-mr-1 rounded-full p-1 text-black/45 transition-colors hover:text-black"
                  aria-label="Open categories menu"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              <NavLink
                to="/about"
                className={({ isActive }) => desktopNavLinkClass(isActive)}
              >
                About Us
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) => desktopNavLinkClass(isActive)}
              >
                Contact Us
              </NavLink>
            </nav>

            <AnimatePresence>
              {isCategoriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute left-1/2 top-[calc(100%+12px)] z-50 w-[min(90vw,1440px)] -translate-x-1/2 rounded-[30px] border border-[var(--border)] bg-white px-8 py-8 shadow-[0_24px_60px_rgba(27,42,46,0.12)] lg:px-10 lg:py-10"
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                >
                  <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-5 xl:gap-x-12">
                    {CATEGORY_GROUPS.map((group) => (
                      <div key={group.label} className="min-w-0 space-y-4">
                        <NavLink
                          to={group.href}
                          className={({ isActive }) =>
                            `block text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ${isActive ? 'text-[#03989E]' : 'text-[#03989E] hover:text-[#027a7e]'}`
                          }
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          {group.label}
                        </NavLink>

                        {group.subcategories && group.subcategories.length > 0 ? (
                          <ul className="space-y-3 border-l border-[var(--border)] pl-4">
                            {group.subcategories.map((subcategory) => (
                              <li key={subcategory.label}>
                                <Link
                                  to={subcategory.href}
                                  onClick={() => setIsCategoriesOpen(false)}
                                  className="block text-sm leading-7 text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent)]"
                                >
                                  {subcategory.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Link
                            to={group.href}
                            onClick={() => setIsCategoriesOpen(false)}
                            className="inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                          >
                            View collection
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
                  style={iconButtonStyle}
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
              className="relative w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-150"
              style={iconButtonStyle}
            >
              <svg width="20" height="20" className="md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-150"
              style={iconButtonStyle}
            >
              <svg width="20" height="20" className="md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlistItemCount > 0 && (
                <span className="absolute top-1 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              to={user ? '/profile' : '/login'}
              aria-label={user ? `Profile (${user.name})` : 'Sign In'}
              title={user ? user.name : 'Sign In'}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 hover:scale-105 transition-transform duration-150"
              style={iconButtonStyle}
            >
              {user ? (
                <img
                  src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <svg width="20" height="20" className="md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-transform duration-150"
              style={iconButtonStyle}
              onClick={() => setMenuOpen((prev) => {
                const next = !prev;
                if (!next) {
                  setIsCategoriesOpen(false);
                }
                return next;
              })}
            >
              {menuOpen ? (
                <IconX size={20} />
              ) : (
                <IconMenu2 size={20} />
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          className="lg:hidden max-w-7xl mx-auto mt-2 rounded-2xl overflow-hidden shadow-lg"
          style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border)', border: '1px solid var(--border)' }}
        >
          <nav className="flex flex-col py-3" aria-label="Mobile navigation">
            <NavLink
              to="/"
              end
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => mobileNavLinkClass(isActive)}
            >
              Home
            </NavLink>

            <NavLink
              to="/categories"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => mobileNavLinkClass(isActive)}
            >
              Categories
            </NavLink>

            <button
              type="button"
              className="flex items-center justify-between px-6 py-4 text-left font-sans text-sm font-medium text-[var(--text-primary)] hover:bg-gray-50"
              onClick={() => setIsCategoriesOpen((open) => !open)}
            >
              <span>Categories</span>
              <span className="text-xs text-[var(--text-secondary)]">{isCategoriesOpen ? 'Hide' : 'Show'}</span>
            </button>

            {isCategoriesOpen && (
              <div className="border-t border-[var(--border)] bg-white px-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {CATEGORY_GROUPS.map((group) => (
                    <div key={group.label} className="rounded-2xl border border-[var(--border)] p-4">
                      <Link
                        to={group.href}
                        onClick={() => {
                          setMenuOpen(false);
                          setIsCategoriesOpen(false);
                        }}
                        className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]"
                      >
                        {group.label}
                      </Link>
                      {group.subcategories && group.subcategories.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {group.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.label}
                              to={subcategory.href}
                              onClick={() => {
                                setMenuOpen(false);
                                setIsCategoriesOpen(false);
                              }}
                              className="block text-sm leading-6 text-[var(--text-secondary)]"
                            >
                              {subcategory.label}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">View the full collection.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {MAIN_NAV_LINKS.slice(1).map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => mobileNavLinkClass(isActive)}
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

