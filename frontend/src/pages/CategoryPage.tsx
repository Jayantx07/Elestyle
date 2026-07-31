import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPublicCategories, type Category } from '../services/publicCategoryService';
import { publicProductService, type PublicProduct } from '../services/publicProductService';
import { CircularCategoryCarousel } from '../components/organisms/CircularCategoryCarousel';
import { useWishlist } from '../contexts/WishlistContext';

// Icons
const HeartIcon = ({ isFavorite }: { isFavorite?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DividerDecorative = () => (
  <div className="flex items-center justify-center gap-4 my-6 opacity-70">
    <div className="h-[1px] w-16 bg-[#B89B72]"></div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#B89B72"/>
    </svg>
    <div className="h-[1px] w-16 bg-[#B89B72]"></div>
  </div>
);


const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  // Array to hold multiple selected subcategories for the checkboxes
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!categorySlug) return;
    setLoading(true);

    Promise.all([
      fetchPublicCategories().then(cats => cats.find(c => c.slug === categorySlug)),
      publicProductService.getProductsByCategorySlug(categorySlug)
    ])
      .then(([cat, prodRes]) => {
        setCategory(cat || null);
        setProducts(prodRes.data || []);
        setSelectedSubCategories([]); // Reset on category change
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categorySlug]);

  if (loading) return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  if (!category) return <div className="min-h-screen pt-32 text-center">Category not found</div>;

  const handleSubCategoryToggle = (sub: string) => {
    setSelectedSubCategories(prev => {
      if (sub === 'All') {
        return []; // clear all other selections if "All" is clicked
      }
      const newSelection = prev.includes(sub)
        ? prev.filter(s => s !== sub)
        : [...prev, sub];
      return newSelection;
    });
  };

  const isSubCategorySelected = (sub: string) => {
    if (sub === 'All') {
      return selectedSubCategories.length === 0;
    }
    return selectedSubCategories.includes(sub);
  };

  const filteredProducts = selectedSubCategories.length === 0
    ? products
    : products.filter(p => p.subCategory && selectedSubCategories.includes(p.subCategory));

  return (
    <div className="min-h-screen pb-16 transition-colors duration-500 font-sans" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Breadcrumbs */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-28 pb-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        <Link to="/" className="hover:opacity-70">Home</Link>
        <span className="mx-2">&gt;</span>
        <span className="hover:opacity-70 cursor-default">Categories</span>
        <span className="mx-2">&gt;</span>
        <span style={{ color: 'var(--text-primary)' }}>{category.name}</span>
      </div>

      {/* Hero Banner Section */}
      <div className="relative w-full h-[350px] md:h-[450px] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image */}
        {category.bannerImage ? (
          <img 
            src={category.bannerImage} 
            className="absolute inset-0 w-full h-full object-cover" 
            alt={category.name} 
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-[#f8f5f0]" />
        )}
        
        {/* Overlay gradient to ensure text readability */}
        <div className="absolute inset-0 bg-white/30" />

        {/* Text Content */}
        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-fraunces uppercase tracking-wider mb-2" style={{ color: 'var(--text-primary)' }}>
            {category.name}
          </h1>
          
          <DividerDecorative />
          
          <p className="text-[15px] md:text-[17px] max-w-xl leading-relaxed mx-auto font-medium" style={{ color: 'var(--text-primary)' }}>
            {category.description || 'Timeless designs, meticulously handmade to add charm to every you.'}
          </p>
        </div>
      </div>

      {/* Circular Carousel */}
      <CircularCategoryCarousel 
        className="w-full pt-8 pb-6" 
        activeCategorySlug={category.slug} 
      />
      
      {/* Main Content Layout */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-12 mb-24 flex flex-col lg:flex-row gap-12">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-1/4 xl:w-1/5 shrink-0">
          <h2 className="text-[13px] font-bold tracking-[0.15em] uppercase mb-8 pb-4 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
            FILTER BY
          </h2>
          
          {/* Category Accordion */}
          <div className="mb-8">
            <div 
              className="flex justify-between items-center cursor-pointer mb-6"
              onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
            >
              <h3 className="text-[14px] font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--text-primary)' }}>
                CATEGORY
              </h3>
              <span className="text-[20px] leading-none" style={{ color: 'var(--text-primary)' }}>
                {isCategoryFilterOpen ? '−' : '+'}
              </span>
            </div>
            
            {isCategoryFilterOpen && (
              <div className="flex flex-col gap-4 pl-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 border rounded-sm transition-colors" style={{ borderColor: isSubCategorySelected('All') ? '#B89B72' : 'var(--text-secondary)', backgroundColor: isSubCategorySelected('All') ? '#B89B72' : 'transparent' }}>
                    {isSubCategorySelected('All') && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white"><path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    <input type="checkbox" className="absolute opacity-0 cursor-pointer" checked={isSubCategorySelected('All')} onChange={() => handleSubCategoryToggle('All')} />
                  </div>
                  <span className="text-[14px] transition-colors hover:text-black" style={{ color: isSubCategorySelected('All') ? 'var(--text-primary)' : 'var(--text-secondary)' }}>All {category.name}</span>
                </label>
                
                {category.subCategories && category.subCategories.map(sub => (
                  <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-4 h-4 border rounded-sm transition-colors" style={{ borderColor: isSubCategorySelected(sub) ? '#B89B72' : 'var(--text-secondary)', backgroundColor: isSubCategorySelected(sub) ? '#B89B72' : 'transparent' }}>
                      {isSubCategorySelected(sub) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white"><path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      <input type="checkbox" className="absolute opacity-0 cursor-pointer" checked={isSubCategorySelected(sub)} onChange={() => handleSubCategoryToggle(sub)} />
                    </div>
                    <span className="text-[14px] transition-colors hover:text-black" style={{ color: isSubCategorySelected(sub) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{sub}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 text-[14px]">
            <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              Showing 1-{filteredProducts.length} of {products.length} products
            </div>
            
            <div className="flex items-center gap-2 mt-4 sm:mt-0" style={{ color: 'var(--text-primary)' }}>
              <span>Sort by:</span>
              <div className="flex items-center gap-2 cursor-pointer p-2 border rounded-md min-w-[120px] justify-between" style={{ borderColor: 'var(--border)' }}>
                <span className="font-medium text-[13px]">Featured</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <p className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>No products found in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {filteredProducts.map((product) => {
                const imageSrc = product.images?.[0]?.secure_url || '';

                return (
                  <div 
                    key={product._id} 
                    className="group flex flex-col relative"
                  >
                    <div 
                      className="relative aspect-[4/5] mb-4 overflow-hidden rounded-md flex items-center justify-center p-4 transition-all duration-300 group-hover:shadow-md bg-[#f8f6f3] cursor-pointer"
                      onClick={() => navigate(`/product/${product.slug}`)}
                      data-cursor="explore"
                      data-cursor-text="VIEW"
                    >
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                        loading="lazy"
                      />
                      
                      {/* Wishlist Button Overlay */}
                      <button 
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors opacity-100 group-hover:opacity-100 md:opacity-0"
                        style={{ color: isInWishlist(product.slug) ? 'var(--accent)' : 'var(--text-secondary)' }}
                        data-cursor="pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isInWishlist(product.slug)) {
                            removeFromWishlist(product.slug);
                          } else {
                            addToWishlist({
                              id: product.slug,
                              title: product.name,
                              price: product.price,
                              imageSrc: imageSrc,
                            });
                          }
                        }}
                      >
                        <HeartIcon isFavorite={isInWishlist(product.slug)} />
                      </button>
                    </div>
                    
                    <div 
                      className="text-center cursor-pointer"
                      onClick={() => navigate(`/product/${product.slug}`)}
                    >
                      <h3 className="text-[15px] font-sans font-medium mb-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-center gap-3 text-[14px] font-sans">
                        <span style={{ color: 'var(--text-secondary)' }}>Rs. {product.price}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
