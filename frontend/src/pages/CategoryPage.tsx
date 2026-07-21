import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORY_THEMES } from '../config/categoryThemes';
import type { CategorySlug } from '../config/categoryThemes';
import { ThemeProvider } from '../contexts/ThemeContext';
import { CategoryFilterBar } from '../components/molecules/CategoryFilterBar';
import { ListingProductCard } from '../components/molecules/ListingProductCard';
import { Pagination } from '../components/molecules/Pagination';

// ─── Inner template — receives resolved category config ───────────────────────
const CategoryTemplate: React.FC<{ slug: CategorySlug }> = ({ slug }) => {
  const theme = CATEGORY_THEMES[slug];

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  // ─── 1. Category Hero Header ─────────────────────────────────────────────────
  const HeroHeader = (
    <section
      className="pt-28 md:pt-32 pb-4 px-4 md:px-8"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col justify-end">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-8">
          <Link
            to="/"
            className="font-sans text-[13px] font-medium transition-colors duration-200 hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            Home
          </Link>
          <span style={{ color: 'var(--text-secondary)' }} className="font-sans text-[13px] font-medium">
            /
          </span>
          <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Shop
          </span>
        </nav>

        {/* Title and Results count row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div className="flex flex-col gap-3">
            <h1 className="font-fraunces font-medium text-4xl md:text-5xl lg:text-6xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {theme.heroHeading}
            </h1>
            <p className="font-sans text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              {theme.heroDescription}
            </p>
          </div>
          
          <div className="mb-1">
            <p className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Showing 1-12 of 86 results
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  // ─── 2. Filter Bar ──────────────────────────────────────────────────────────
  const FilterBar = (
    <CategoryFilterBar tabs={[{ id: 'all', label: 'All' }, ...theme.filterTabs]} />
  );

  // ─── 3. Product Grid ───────────────────────────────────────────────────────
  const ProductGrid = (
    <section className="py-12 md:py-16 px-4 md:px-8" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {theme.products.map((product) => (
            <ListingProductCard
              key={product.id}
              id={product.id}
              imageSrc={product.imageSrc}
              altText={product.altText}
              title={product.title}
              category={theme.displayName}
              price={product.price}
              rating={4.8}
              reviewsCount={Math.floor(Math.random() * 50) + 10}
              originalPrice={Math.random() > 0.7 ? product.price + 100 : undefined}
              discountBadge={Math.random() > 0.7 ? '-15%' : undefined}
            />
          ))}
          {/* Duplicate products to show grid layout filling up if less than 8 */}
          {theme.products.map((product) => (
            <ListingProductCard
              key={product.id + '-dup'}
              id={product.id}
              imageSrc={product.imageSrc}
              altText={product.altText}
              title={product.title}
              category={theme.displayName}
              price={product.price}
              rating={4.5}
              reviewsCount={Math.floor(Math.random() * 50) + 10}
            />
          ))}
        </div>
        
        {/* 4. Pagination */}
        <div className="mt-20">
          <Pagination currentPage={1} totalPages={8} onPageChange={() => {}} />
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      {HeroHeader}
      {FilterBar}
      {ProductGrid}
    </div>
  );
};

// ─── Page wrapper — resolves slug and sets category theme ─────────────────────
const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const theme = slug ? CATEGORY_THEMES[slug as CategorySlug] : null;

  if (!theme) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        <h1 className="font-fraunces font-medium text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
          Collection not found
        </h1>
        <p className="font-sans text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
          The collection you're looking for doesn't exist yet.
        </p>
        <Link
          to="/"
          className="font-sans font-semibold text-[13px] uppercase tracking-[0.075em] px-6 py-3 rounded-full text-white min-h-[44px] flex items-center"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <ThemeProvider category={theme.themeKey}>
      <CategoryTemplate slug={slug as CategorySlug} />
    </ThemeProvider>
  );
};

export default CategoryPage;
