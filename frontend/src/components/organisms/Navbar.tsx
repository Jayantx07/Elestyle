import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

const LOGO_URL =
  'https://res.cloudinary.com/gc1qeznc/image/upload/v1784531072/logo_ellestyle_ierdp3.jpg';

const NAV_LINKS = [
  { label: 'Macrame Bags', href: '/category/macrame-bags' },
  { label: 'Handmade Candles', href: '/category/handmade-candles' },
  { label: 'Handmade Earrings', href: '/category/handmade-earrings' },
  { label: 'Rajasthani Vibes', href: '/category/rajasthani-vibes' },
  { label: 'Wedding Giveaways', href: '/category/wedding-giveaway' },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 rounded-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white shadow-sm'
        }`}
        style={{ borderBottom: `1px solid var(--border)` }}
      >
        {/* Logo */}
        <Link to="/" className="flex-shrink-0" aria-label="ElleStyle — Home">
          <img
            src={LOGO_URL}
            alt="ElleStyle logo"
            className="h-10 md:h-12 w-auto object-contain rounded-sm"
            loading="eager"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              className={({ isActive }) =>
                `font-sans text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'font-semibold' : 'hover:opacity-70'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent)' : 'var(--text-primary)',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search */}
          <button
            aria-label="Search"
            className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Cart */}
          <button
            aria-label="Shopping bag"
            className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>

          {/* Account — desktop only */}
          <button
            aria-label="Account"
            className="hidden sm:flex w-11 h-11 rounded-full items-center justify-center hover:bg-gray-100 transition-colors duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {/* Mobile hamburger */}
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="lg:hidden w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
            style={{ color: 'var(--text-primary)' }}
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

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          className="lg:hidden max-w-7xl mx-auto mt-2 rounded-2xl overflow-hidden shadow-lg"
          style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border)', border: '1px solid var(--border)' }}
        >
          <nav className="flex flex-col py-4" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
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

