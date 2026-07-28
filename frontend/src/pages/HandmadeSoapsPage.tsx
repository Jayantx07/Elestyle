import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { CategoryFilterBar } from '../components/molecules/CategoryFilterBar';
import { ListingProductCard } from '../components/molecules/ListingProductCard';
import { Pagination } from '../components/molecules/Pagination';
import { publicProductService, type PublicProduct } from '../services/publicProductService';

// --- MOCK DATA ---
const FILTER_TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'gentle', label: 'GENTLE' },
  { id: 'organic', label: 'ORGANIC' },
  { id: 'scented', label: 'SCENTED' },
];

// Mock data removed

const HandmadeSoapsTemplate: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<string>('all');
  const [currentPage, setCurrentPage] = React.useState(1);

  const [products, setProducts] = React.useState<PublicProduct[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalResults, setTotalResults] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const tag = activeTab !== 'all' ? activeTab : undefined;
        const res = await publicProductService.getProducts({
          category: 'handmade-soaps',
          tag,
          page: currentPage,
          limit: 12,
        });
        if (res.success) {
          setProducts(res.data);
          setTotalPages(res.pages || 1);
          setTotalResults(res.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch handmade soaps:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab, currentPage]);

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
              Pure, slow-made, <em className="italic font-light">kind to skin.</em>
            </h1>
            <p className="font-sans text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              Handmade soaps crafted from natural oils with gentle scents — small-batch and skin-friendly.
            </p>
          </div>
          
          <div className="mb-1">
            <p className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Showing {totalResults} results
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  // ─── 2. Filter Bar ──────────────────────────────────────────────────────────
  const FilterBar = (
    <CategoryFilterBar
      tabs={FILTER_TABS}
      activeId={activeTab}
      onChange={(id) => {
        setActiveTab(id);
        setCurrentPage(1); // reset pagination on filter change
      }}
    />
  );

  // ─── 3. Product Grid ───────────────────────────────────────────────────────
  const ProductGrid = (
    <section className="py-12 md:py-16 px-4 md:px-8" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {loading ? (
            <div className="col-span-full py-20 text-center text-gray-500 font-sans">
              Loading products...
            </div>
          ) : products.length > 0 ? (
            products.map((product) => {
              const featuredImage = product.images?.find((img) => img.isFeatured) || product.images?.[0];
              return (
                <ListingProductCard
                  key={product._id}
                  slug={product.slug}
                  imageSrc={featuredImage?.secure_url || ''}
                  altText={featuredImage?.alt || product.name}
                  title={product.name}
                  category="Handmade Soaps"
                  price={product.price}
                  rating={product.ratingAverage}
                  reviewsCount={product.reviewCount}
                  originalPrice={product.compareAtPrice}
                  discountBadge={product.discount > 0 ? `-${product.discount}%` : undefined}
                />
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center text-gray-500 font-sans">
              No products found for this category.
            </div>
          )}
        </div>
        
        {/* 4. Pagination */}
        <div className="mt-20">
          <Pagination currentPage={currentPage} totalPages={totalPages > 1 ? totalPages : 8} onPageChange={setCurrentPage} />
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

const HandmadeSoapsPage: React.FC = () => {
  return (
    <ThemeProvider category="soaps">
      <HandmadeSoapsTemplate />
    </ThemeProvider>
  );
};

export default HandmadeSoapsPage;
