import React from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

const LOGO_URL =
  'https://res.cloudinary.com/gc1qeznc/image/upload/v1784531072/logo_ellestyle_ierdp3.jpg';

export const Footer: React.FC = () => {
  return (
    <footer className="pt-20 pb-10 px-8 md:px-16 rounded-[3rem] md:rounded-[4rem] mx-2 md:mx-4 mb-4 shadow-sm" style={{ backgroundColor: 'white' }}>
      <div className="max-w-7xl mx-auto">

        {/* Top section: Newsletter */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 pb-16">
          <div className="max-w-xl">
            <h2
              className="font-fraunces font-medium text-3xl md:text-4xl leading-tight mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Stay updated with ELLE STYLE
            </h2>
            <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
              Login to receive new arrivals, exclusive offers, and product updates.
            </p>
          </div>

          <form className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-[320px]">
              <Input type="email" placeholder="Enter your email" required className="!bg-[#FDFBF7] !border-none shadow-inner" />
            </div>
            <Button variant="primary" type="submit" className="w-full sm:w-auto !px-8">
              SUBSCRIBE
            </Button>
          </form>
        </div>

        <div className="w-full h-px" style={{ backgroundColor: 'var(--border)' }} />

        {/* Middle section: Large Text Logo */}
        <div className="py-20 md:py-32 flex justify-center items-center">
          <h1 
            className="font-fraunces font-medium text-6xl sm:text-8xl md:text-[140px] lg:text-[180px] leading-none tracking-tight whitespace-nowrap text-center"
            style={{ color: 'var(--text-primary)' }}
          >
            ELLE STYLE
          </h1>
        </div>

        <div className="w-full h-px mb-12" style={{ backgroundColor: 'var(--border)' }} />

        {/* Bottom section: Links & Social */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div>
            <p
              className="font-sans font-semibold text-[10px] uppercase tracking-[0.2em] mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              EMAIL
            </p>
            <a
              href="mailto:ellestylecom@gmail.com"
              className="font-sans font-medium text-sm transition-colors duration-200"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              ellestylecom@gmail.com
            </a>
          </div>

          <div className="flex flex-col items-center gap-3 w-full md:w-auto">
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                { label: 'Macrame Bags', to: '/category/macrame-bags' },
                { label: 'Handmade Candles', to: '/category/handmade-candles' },
                { label: 'Handmade Earrings', to: '/category/handmade-earrings' },
                { label: 'Rajasthani Vibes', to: '/category/rajasthani-vibes' },
                { label: 'Wedding Giveaways', to: '/category/wedding-giveaway' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-sans text-xs transition-colors duration-200"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <nav className="flex items-center justify-center gap-6">
              <a href="#" className="font-sans text-xs transition-colors duration-200" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}>
                Privacy Policy
              </a>
              <a href="#" className="font-sans text-xs transition-colors duration-200" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}>
                Contact Us
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Instagram */}
            <a
              href="#"
              aria-label="ElleStyle on Instagram"
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:bg-gray-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* Facebook */}
            <a
              href="#"
              aria-label="ElleStyle on Facebook"
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:bg-gray-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="text-center pt-16">
          <p className="font-sans text-xs" style={{ color: 'var(--text-secondary)' }}>
            © 2026 ELLE STYLE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

