import { apiClient } from '@/lib/apiClient';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { fetchPublicCategories, type Category } from '../../services/publicCategoryService';

export const Footer: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchPublicCategories({ homepage: true }).then((cats) => {
      setCategories(cats);
    });
  }, []);

  return (
    <footer className="py-12 px-4 md:px-6 bg-[var(--bg-page)] mt-12 border-t border-[var(--border)]">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12">
          {/* Brand Info & Newsletter alternative */}
          <div className="mb-8 md:mb-0 max-w-md">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <h2 className="font-fraunces text-3xl font-bold" style={{ color: 'var(--accent)' }}>ElleStyle India</h2>
            </Link>

            <h1 className="text-[var(--text-secondary)] mt-4 font-sans text-sm">
              Discover unique, handcrafted items that elevate your personal style.
            </h1>

            <div className="mt-6">
              <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-secondary)' }}>
                STAY UPDATED
              </p>
              <a
                href="mailto:ellestylecom@gmail.com"
                className="font-sans font-medium text-sm transition-colors duration-200"
                style={{ color: 'var(--accent)' }}
              >
                ellestylecom@gmail.com
              </a>
            </div>

            <div className="mt-6">
              <Button variant="outline" className="w-auto" onClick={() => window.open('https://instagram.com/ellestyle', '_blank')}>
                Follow us on Instagram
                <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </Button>
            </div>

            <p className="text-xs mt-8" style={{ color: 'var(--text-secondary)' }}>
              © {new Date().getFullYear()} ELLE STYLE. All rights reserved.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-16">
            <div>
              <h3 className="font-semibold mb-4 font-fraunces text-lg" style={{ color: 'var(--text-primary)' }}>Shop</h3>
              <ul className="space-y-3 font-sans text-sm">
                {categories.slice(0, 5).map((category) => (
                  <li key={category._id}>
                    <Link
                      to={`/category/${category.slug}`}
                      className="transition-colors hover:text-[var(--accent)]"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 font-fraunces text-lg" style={{ color: 'var(--text-primary)' }}>Company</h3>
              <ul className="space-y-3 font-sans text-sm">
                <li>
                  <Link to="/about" className="transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>About Us</Link>
                </li>
                <li>
                  <Link to="/contact" className="transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>Contact</Link>
                </li>
                <li>
                  <Link to="/faq" className="transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>FAQ</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 font-fraunces text-lg" style={{ color: 'var(--text-primary)' }}>Legal</h3>
              <ul className="space-y-3 font-sans text-sm">
                <li>
                  <Link to="/privacy-policy" className="transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/tos" className="transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>Terms of Service</Link>
                </li>
                <li>
                  <Link to="/shipping" className="transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>Shipping & Returns</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Giant Text Logo */}
        <div className="w-full flex mt-12 lg:mt-24 items-center justify-center overflow-hidden">
          <h1
            className="text-center text-5xl sm:text-7xl md:text-[7rem] lg:text-[10rem] font-fraunces font-bold select-none leading-none tracking-tight whitespace-nowrap"
            style={{ color: 'var(--accent)' }}
          >
            ELLE STYLE  <span className="text-3xl sm:text-5xl md:text-[4rem] lg:text-[6rem]">_INDIA</span>
          </h1>
        </div>

      </div>
    </footer>
  );
};

