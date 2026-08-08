import { apiClient } from '@/lib/apiClient';
import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchPublicCategories, type Category } from '../services/publicCategoryService';
import { publicProductService, type PublicProduct } from '../services/publicProductService';
import { publicSubCategoryService, type PublicSubCategory } from '../services/publicSubCategoryService';
import { publicFilterService, type StorefrontFilterConfig, type FacetsData } from '../services/publicFilterService';
import { useWishlist } from '../contexts/WishlistContext';
import { useQuery } from '@tanstack/react-query';
import { categoryKeys, subCategoryKeys, productKeys } from '@/lib/queryKeys';

// Icons
const HeartIcon = ({ isFavorite }: { isFavorite?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DividerDecorative = () => (
  <div className="flex items-center justify-center gap-4 my-5 opacity-70">
    <div className="h-[1px] w-16 bg-[#03989E]"></div>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#03989E"/>
    </svg>
    <div className="h-[1px] w-16 bg-[#03989E]"></div>
  </div>
);

const FilterSectionHeader: React.FC<{ title: string; isOpen: boolean; onToggle: () => void }> = ({ title, isOpen, onToggle }) => (
  <div className="flex justify-between items-center cursor-pointer py-3 select-none border-t border-gray-200/60 first:border-t-0" onClick={onToggle}>
    <h3 className="text-[13px] font-bold tracking-[0.1em] uppercase text-gray-900">{title}</h3>
    <span className="text-lg leading-none text-gray-600 font-light">{isOpen ? '−' : '+'}</span>
  </div>
);

const CategoryPage: React.FC = () => {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // State Management
  const [facetsState, setFacetsState] = useState<FacetsData>({
    colors: [],
    materials: [],
    priceMin: 0,
    priceMax: 10000,
    subCategories: [],
    availability: [],
  });
  
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    subcategory: true,
    color: true,
    price: true,
    material: true,
    availability: false,
    discount: true,
    rating: true,
  });

  // URL parameters as Single Source of Truth
  const activeSubCategories = useMemo(() => {
    const subs = searchParams.getAll('subcategory');
    if (subcategorySlug && !subs.includes(subcategorySlug)) {
      return [...subs, subcategorySlug];
    }
    return subs;
  }, [searchParams, subcategorySlug]);
  const activeColors = useMemo(() => searchParams.getAll('color'), [searchParams]);
  const activeMaterials = useMemo(() => searchParams.getAll('material'), [searchParams]);
  const activePrice = useMemo(() => searchParams.get('price') || '', [searchParams]);
  const activeDiscount = useMemo(() => searchParams.get('discount') || '', [searchParams]);
  const activeRating = useMemo(() => searchParams.get('rating') || '', [searchParams]);
  const activeSort = useMemo(() => searchParams.get('sort') || '-createdAt', [searchParams]);

  const isFilterEnabled = (key: string) => {
    if (!filterConfigs || filterConfigs.length === 0) return true;
    const match = filterConfigs.find((f) => f.key.toLowerCase() === key.toLowerCase() || (key === 'subcategory' && f.key.toLowerCase() === 'subcategories'));
    return match ? match.enabled && match.visible : true;
  };

  const setSingleFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (subcategorySlug && !newParams.getAll('subcategory').includes(subcategorySlug)) {
      newParams.append('subcategory', subcategorySlug);
    }
    if (!value || newParams.get(key) === value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.delete('page');
    navigate(`/category/${categorySlug}?${newParams.toString()}`);
  };

  // Toggle helper for URL params
  const toggleUrlParam = (paramKey: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (subcategorySlug && !newParams.getAll('subcategory').includes(subcategorySlug)) {
      newParams.append('subcategory', subcategorySlug);
    }
    const currentValues = newParams.getAll(paramKey);

    if (value === 'ALL' || (currentValues.includes(value) && currentValues.length === 1)) {
      if (value === 'ALL') {
        newParams.delete(paramKey);
      } else {
        newParams.delete(paramKey);
      }
    } else if (currentValues.includes(value)) {
      const filtered = currentValues.filter((v) => v !== value);
      newParams.delete(paramKey);
      filtered.forEach((v) => newParams.append(paramKey, v));
    } else {
      newParams.append(paramKey, value);
    }
    
    // Reset pagination when filter changes
    newParams.delete('page');
    navigate(`/category/${categorySlug}?${newParams.toString()}`);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    if (searchParams.has('sort')) newParams.set('sort', searchParams.get('sort')!);
    navigate(`/category/${categorySlug}?${newParams.toString()}`);
  };

  const apiParams = new URLSearchParams(searchParams);
  if (subcategorySlug && !apiParams.getAll('subcategory').includes(subcategorySlug)) {
    apiParams.append('subcategory', subcategorySlug);
  }
  const queryString = apiParams.toString();

  const { data: category, isLoading: loadingCategory } = useQuery({
    queryKey: categoryKeys.detail(categorySlug as string),
    queryFn: () => fetchPublicCategories().then((cats) => cats.find((c) => c.slug === categorySlug)),
    enabled: !!categorySlug
  });

  const { data: subCategories = [], isLoading: loadingSubcats } = useQuery({
    queryKey: [...subCategoryKeys.lists(), { category: categorySlug }],
    queryFn: () => publicSubCategoryService.getSubCategories({ category: categorySlug }),
    enabled: !!categorySlug
  });

  const { data: filterConfigs = [] } = useQuery({
    queryKey: ['filters', categorySlug],
    queryFn: () => publicFilterService.getFilterConfigs(categorySlug!),
    enabled: !!categorySlug
  });

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: [...productKeys.lists(), { category: categorySlug, query: queryString }],
    queryFn: () => publicProductService.getProductsByCategorySlug(categorySlug!, queryString),
    enabled: !!categorySlug
  });

  const { data: facetsData } = useQuery({
    queryKey: [...productKeys.lists(), 'facets', { category: categorySlug, query: queryString }],
    queryFn: () => publicProductService.getProductFacets(categorySlug!, queryString),
    enabled: !!categorySlug
  });

  const products = productsData?.data || [];
  const totalProducts = productsData?.total || products.length;
  const facets = { ...facetsState, ...facetsData };
  const loading = loadingCategory || loadingSubcats || loadingProducts;

  const activeFilterCount = activeSubCategories.length + activeColors.length + activeMaterials.length + (activePrice ? 1 : 0) + (activeDiscount ? 1 : 0) + (activeRating ? 1 : 0);

  if (loading && !category) {
    return (
      <div className="min-h-screen pt-36 pb-20 flex flex-col items-center justify-center text-center font-sans">
        <div className="w-10 h-10 border-2 border-[#03989E] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[14px] text-gray-500 tracking-wider uppercase font-medium">Curating Collection...</span>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen pt-36 pb-20 text-center font-sans">
        <h2 className="text-2xl font-serif text-gray-800 mb-2">Category Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">We could not locate the collection you are looking for.</p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-[#1F1F1F] text-white text-xs font-medium uppercase tracking-wider rounded">Return Home</Link>
      </div>
    );
  }

  // Determine subcategory name for breadcrumb if exactly one is active
  const selectedSubCatObj = activeSubCategories.length === 1 
    ? subCategories.find((sc) => sc.slug === activeSubCategories[0] || sc.name === activeSubCategories[0]) 
    : null;

  return (
    <div className="min-h-screen pb-20 transition-colors duration-500 font-sans" style={{ backgroundColor: 'var(--bg-page, #FAF8F5)' }}>
      {/* 1. Hero Banner Section (Moved up below header without breadcrumbs!) */}
      <div className="relative w-full h-[300px] md:h-[380px] mt-[76px] md:mt-[84px] flex flex-col items-center justify-center overflow-hidden bg-[#EFECE6]">
        {selectedSubCatObj && selectedSubCatObj.bannerImage ? (
          <img src={selectedSubCatObj.bannerImage} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700" alt={selectedSubCatObj.name} />
        ) : category.bannerImage ? (
          <img src={category.bannerImage} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700" alt={category.name} />
        ) : null}
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />

        <div className="relative z-10 text-center px-6 flex flex-col items-center max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-serif text-white uppercase tracking-widest font-normal drop-shadow-md">
            {selectedSubCatObj ? selectedSubCatObj.name : category.name}
          </h1>
          
          <DividerDecorative />

          <p className="text-[14px] md:text-[16px] text-white/95 leading-relaxed max-w-2xl font-light drop-shadow">
            {selectedSubCatObj && selectedSubCatObj.description
              ? selectedSubCatObj.description
              : category.description || 'Timeless designs, meticulously handmade to add elegance and charm to your sanctuary.'}
          </p>
        </div>
      </div>

      {/* 2. Top Circular SubCategory Carousel (Synchronized with URL State & Sidebar!) */}
      {subCategories.length > 0 && (
        <div className="w-full bg-white/70 border-y border-gray-200/70 py-6 shadow-sm overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-start justify-start md:justify-center gap-8 min-w-max mx-auto px-4 pt-3 pb-3">
              {/* All Collection Circle */}
              <button
                onClick={() => toggleUrlParam('subcategory', 'ALL')}
                className="flex flex-col items-center gap-2 group shrink-0 w-24 md:w-28 cursor-pointer focus:outline-none"
              >
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-sm transition-all duration-300 flex items-center justify-center bg-gray-100 ring-2 ring-offset-4 ring-offset-[#FAF8F5] shrink-0 ${
                  activeSubCategories.length === 0 ? 'ring-[#03989E] bg-[#FAF8F5]' : 'ring-transparent group-hover:ring-gray-300'
                }`}>
                  <span className={`text-[13px] md:text-[15px] font-serif uppercase tracking-widest font-semibold ${activeSubCategories.length === 0 ? 'text-[#03989E]' : 'text-gray-700'}`}>
                    All
                  </span>
                </div>
                <div className="flex flex-col items-center text-center leading-tight mt-1">
                  <span className={`text-[13px] font-medium line-clamp-1 transition-colors ${activeSubCategories.length === 0 ? 'text-[#03989E] font-semibold' : 'text-gray-800'}`}>
                    All {category.name}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono mt-0.5">({totalProducts})</span>
                </div>
              </button>

              <div className="h-20 w-[1px] bg-gray-200 mx-1 shrink-0 self-center" />

              {/* SubCategory Relational Circles */}
              {subCategories.map((sub) => {
                const isActive = activeSubCategories.includes(sub.slug) || activeSubCategories.includes(sub.name);
                const circleImg = sub.image || sub.icon || category.image || 'https://images.unsplash.com/photo-1584992236310-6edddc085ffb?w=200';
                const count = sub.productCount !== undefined ? sub.productCount : 0;

                return (
                  <button
                    key={sub._id}
                    onClick={() => toggleUrlParam('subcategory', sub.slug)}
                    className="flex flex-col items-center gap-2 group shrink-0 w-24 md:w-28 cursor-pointer focus:outline-none"
                  >
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-sm transition-all duration-300 relative shrink-0 ring-2 ring-offset-4 ring-offset-[#FAF8F5] ${
                      isActive ? 'ring-[#03989E] shadow-md' : 'ring-transparent group-hover:ring-[#03989E]/50'
                    }`}>
                      <img
                        src={circleImg}
                        alt={sub.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                      />
                      {isActive && <div className="absolute inset-0 bg-[#03989E]/15 pointer-events-none" />}
                    </div>
                    <div className="flex flex-col items-center text-center leading-tight mt-1">
                      <span className={`text-[13px] font-medium line-clamp-1 transition-colors ${isActive ? 'text-[#03989E] font-bold' : 'text-gray-800'}`}>
                        {sub.name}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono mt-0.5">({count})</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Catalog Content & Sidebar Filtering Layout */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-12 flex flex-col lg:flex-row gap-12">
        
        {/* Left Sidebar (Server-Side Filter Controls & Live Aggregations) */}
        <aside className="w-full lg:w-1/4 xl:w-1/5 shrink-0">
          <div className="sticky top-28 bg-white p-6 rounded-lg border border-gray-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-[12px] font-bold tracking-[0.15em] uppercase text-gray-900">Filter By</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-medium text-[#03989E] hover:underline uppercase tracking-wider"
                >
                  Reset ({activeFilterCount})
                </button>
              )}
            </div>

            {/* SubCategories Accordion (Synchronized with Carousel!) */}
            {subCategories.length > 0 && isFilterEnabled('subcategory') && (
              <div className="py-2">
                <FilterSectionHeader
                  title="Collection"
                  isOpen={openSections.subcategory}
                  onToggle={() => setOpenSections((prev) => ({ ...prev, subcategory: !prev.subcategory }))}
                />
                
                {openSections.subcategory && (
                  <div className="flex flex-col gap-3 mt-3 pl-0.5">
                    {subCategories.map((sub) => {
                      const isChecked = activeSubCategories.includes(sub.slug) || activeSubCategories.includes(sub.name);
                      const count = sub.productCount !== undefined ? sub.productCount : 0;

                      return (
                        <label key={sub._id} className="flex items-center justify-between cursor-pointer group text-[13px] select-none">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#03989E] border-[#03989E]' : 'border-gray-300 group-hover:border-[#03989E]'}`}>
                              {isChecked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white"><path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              <input
                                type="checkbox"
                                className="absolute opacity-0 pointer-events-none"
                                checked={isChecked}
                                onChange={() => toggleUrlParam('subcategory', sub.slug)}
                              />
                            </div>
                            <span className={`transition-colors ${isChecked ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                              {sub.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-gray-400">({count})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Color Swatch Filter Group */}
            {facets.colors && facets.colors.length > 0 && isFilterEnabled('color') && (
              <div className="py-2">
                <FilterSectionHeader
                  title="Color Swatches"
                  isOpen={openSections.color}
                  onToggle={() => setOpenSections((prev) => ({ ...prev, color: !prev.color }))}
                />
                {openSections.color && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {facets.colors.map((col) => {
                      const isSelected = activeColors.includes(col.name);
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => toggleUrlParam('color', col.name)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                            isSelected ? 'bg-[#03989E]/15 border-[#03989E] text-gray-900 font-bold shadow-xs' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                          title={`${col.name} (${col.count} items)`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-inner" style={{ backgroundColor: col.hex }}></span>
                          <span>{col.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">({col.count})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Price Range Filter Group */}
            {isFilterEnabled('price') && (
              <div className="py-2">
                <FilterSectionHeader
                  title="Price Range"
                  isOpen={openSections.price}
                  onToggle={() => setOpenSections((prev) => ({ ...prev, price: !prev.price }))}
                />
                {openSections.price && (
                  <div className="flex flex-col gap-2.5 mt-3 pl-0.5">
                    {[
                      { label: 'Under ₹500', value: '0-500' },
                      { label: '₹500 - ₹1,000', value: '500-1000' },
                      { label: '₹1,000 - ₹2,500', value: '1000-2500' },
                      { label: '₹2,500 & Above', value: '2500-100000' },
                    ].map((range) => {
                      const isSelected = activePrice === range.value;
                      return (
                        <label key={range.value} onClick={() => setSingleFilter('price', range.value)} className="flex items-center gap-3 cursor-pointer group text-[13px] select-none text-gray-600 hover:text-gray-900">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-[#03989E] bg-[#03989E]' : 'border-gray-300 group-hover:border-[#03989E]'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={isSelected ? 'font-semibold text-gray-900' : ''}>{range.label}</span>
                        </label>
                      );
                    })}
                    <div className="pt-2 mt-2 border-t border-gray-100 flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min ₹"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="w-1/2 h-8 px-2 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:border-[#03989E]"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Max ₹"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="w-1/2 h-8 px-2 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:border-[#03989E]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const min = minPriceInput || '0';
                          const max = maxPriceInput || '100000';
                          setSingleFilter('price', `${min}-${max}`);
                        }}
                        className="h-8 px-3 bg-[#1F1F1F] text-white text-[11px] rounded uppercase font-semibold hover:bg-gray-800 transition-colors shrink-0"
                      >
                        Go
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Material Filter Group */}
            {facets.materials && facets.materials.length > 0 && isFilterEnabled('material') && (
              <div className="py-2">
                <FilterSectionHeader
                  title="Material"
                  isOpen={openSections.material}
                  onToggle={() => setOpenSections((prev) => ({ ...prev, material: !prev.material }))}
                />
                {openSections.material && (
                  <div className="flex flex-col gap-3 mt-3 pl-0.5">
                    {facets.materials.map((mat) => {
                      const isChecked = activeMaterials.includes(mat.name);
                      return (
                        <label key={mat.name} className="flex items-center justify-between cursor-pointer group text-[13px] select-none">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#03989E] border-[#03989E]' : 'border-gray-300 group-hover:border-[#03989E]'}`}>
                              {isChecked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white"><path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              <input
                                type="checkbox"
                                className="absolute opacity-0 pointer-events-none"
                                checked={isChecked}
                                onChange={() => toggleUrlParam('material', mat.name)}
                              />
                            </div>
                            <span className={`transition-colors ${isChecked ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{mat.name}</span>
                          </div>
                          <span className="text-xs font-mono text-gray-400">({mat.count})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Availability Filter Group */}
            {facets.availability && facets.availability.length > 0 && isFilterEnabled('availability') && (
              <div className="py-2">
                <FilterSectionHeader
                  title="Availability"
                  isOpen={openSections.availability}
                  onToggle={() => setOpenSections((prev) => ({ ...prev, availability: !prev.availability }))}
                />
                {openSections.availability && (
                  <div className="flex flex-col gap-3 mt-3 pl-0.5">
                    {facets.availability.map((avail) => (
                      <div key={avail.status} className="flex items-center justify-between text-[13px] text-gray-600">
                        <span>{avail.status || 'In Stock'}</span>
                        <span className="text-xs font-mono text-gray-400">({avail.count})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Discount Filter Group */}
            {isFilterEnabled('discount') && (
              <div className="py-2">
                <FilterSectionHeader
                  title="Discount"
                  isOpen={openSections.discount}
                  onToggle={() => setOpenSections((prev) => ({ ...prev, discount: !prev.discount }))}
                />
                {openSections.discount && (
                  <div className="flex flex-col gap-2.5 mt-3 pl-0.5">
                    {[
                      { label: '10% & Above', value: '10' },
                      { label: '20% & Above', value: '20' },
                      { label: '30% & Above', value: '30' },
                      { label: '50% & Above', value: '50' },
                    ].map((disc) => {
                      const isSelected = activeDiscount === disc.value;
                      return (
                        <label key={disc.value} onClick={() => setSingleFilter('discount', disc.value)} className="flex items-center gap-3 cursor-pointer group text-[13px] select-none text-gray-600 hover:text-gray-900">
                          <div className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#03989E] border-[#03989E]' : 'border-gray-300 group-hover:border-[#03989E]'}`}>
                            {isSelected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white"><path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className={isSelected ? 'font-semibold text-gray-900' : ''}>{disc.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Customer Rating Filter Group */}
            {isFilterEnabled('rating') && (
              <div className="py-2">
                <FilterSectionHeader
                  title="Customer Rating"
                  isOpen={openSections.rating}
                  onToggle={() => setOpenSections((prev) => ({ ...prev, rating: !prev.rating }))}
                />
                {openSections.rating && (
                  <div className="flex flex-col gap-2.5 mt-3 pl-0.5">
                    {[
                      { label: '4★ & Above ⭐⭐⭐⭐', value: '4' },
                      { label: '3★ & Above ⭐⭐⭐', value: '3' },
                      { label: '2★ & Above ⭐⭐', value: '2' },
                    ].map((rate) => {
                      const isSelected = activeRating === rate.value;
                      return (
                        <label key={rate.value} onClick={() => setSingleFilter('rating', rate.value)} className="flex items-center gap-3 cursor-pointer group text-[13px] select-none text-gray-600 hover:text-gray-900">
                          <div className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#03989E] border-[#03989E]' : 'border-gray-300 group-hover:border-[#03989E]'}`}>
                            {isSelected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white"><path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className={isSelected ? 'font-semibold text-gray-900' : ''}>{rate.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Server-Side Dynamic Filtering</span>
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">v2</span>
            </div>
          </div>
        </aside>

        {/* Right Main Content (Product Catalog Grid) */}
        <div className="flex-1">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-8 border-b border-gray-200/60 text-[13px]">
            <div className="text-gray-700 font-medium mb-2 sm:mb-0">
              Showing <span className="font-semibold text-gray-900">{products.length}</span> of <span className="font-semibold text-gray-900">{totalProducts}</span> timeless creations
              {activeFilterCount > 0 && <span className="text-[#03989E] font-semibold ml-2">({activeFilterCount} filters active)</span>}
            </div>
            
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Sort By:</span>
              <select
                value={activeSort}
                onChange={(e) => {
                  const p = new URLSearchParams(searchParams);
                  p.set('sort', e.target.value);
                  setSearchParams(p);
                }}
                className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#03989E] shadow-2xs"
              >
                <option value="-createdAt">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-discount">Biggest Discount</option>
                <option value="-ratingAverage">Customer Favorites ⭐</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 items-center">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 mr-1">Selected:</span>
              {activeSubCategories.map((sc) => (
                <span key={sc} onClick={() => toggleUrlParam('subcategory', sc)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#03989E]/15 text-gray-900 border border-[#03989E]/40 font-medium cursor-pointer hover:bg-[#03989E]/25">
                  {subCategories.find((s) => s.slug === sc || s.name === sc)?.name || sc} <span className="text-red-700 font-bold ml-1">×</span>
                </span>
              ))}
              {activeColors.map((col) => (
                <span key={col} onClick={() => toggleUrlParam('color', col)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-pink-50 text-pink-900 border border-pink-200 font-medium cursor-pointer hover:bg-pink-100">
                  Color: {col} <span className="text-red-700 font-bold ml-1">×</span>
                </span>
              ))}
              {activeMaterials.map((mat) => (
                <span key={mat} onClick={() => toggleUrlParam('material', mat)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#03989E]/10 text-gray-900 border border-[#03989E]/30 font-medium cursor-pointer hover:bg-[#03989E]/20">
                  Material: {mat} <span className="text-red-700 font-bold ml-1">×</span>
                </span>
              ))}
              {activePrice && (
                <span onClick={() => setSingleFilter('price', '')} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-green-50 text-green-900 border border-green-200 font-medium cursor-pointer hover:bg-green-100">
                  Price: ₹{activePrice} <span className="text-red-700 font-bold ml-1">×</span>
                </span>
              )}
              {activeDiscount && (
                <span onClick={() => setSingleFilter('discount', '')} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-purple-50 text-purple-900 border border-purple-200 font-medium cursor-pointer hover:bg-purple-100">
                  Discount: {activeDiscount}%+ <span className="text-red-700 font-bold ml-1">×</span>
                </span>
              )}
              {activeRating && (
                <span onClick={() => setSingleFilter('rating', '')} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-yellow-50 text-yellow-900 border border-yellow-200 font-medium cursor-pointer hover:bg-yellow-100">
                  Rating: {activeRating}★+ <span className="text-red-700 font-bold ml-1">×</span>
                </span>
              )}
            </div>
          )}

          {/* Product Cards Grid */}
          {products.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200/80 p-16 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-lg font-serif text-gray-800 mb-1">No matching creations found</h3>
              <p className="text-gray-500 text-xs mb-6 max-w-sm mx-auto">We could not find any products matching your specific combination of filters in this collection.</p>
              <button onClick={clearAllFilters} className="px-6 py-2 bg-[#1F1F1F] text-white rounded text-xs font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors">
                Clear Active Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
              {products.map((product) => {
                const imageSrc = product.images?.[0]?.secure_url || 'https://images.unsplash.com/photo-1584992236310-6edddc085ffb?w=500';

                return (
                  <div key={product._id} className="group flex flex-col relative bg-white rounded-lg p-3 border border-gray-100/80 shadow-2xs hover:shadow-md hover:border-[#03989E]/50 transition-all duration-300">
                    <div
                      className="relative aspect-[4/5] mb-3.5 overflow-hidden rounded-md flex items-center justify-center bg-[#FAF8F5] cursor-pointer"
                      onClick={() => navigate(`/product/${product.slug}`)}
                    >
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Discount Badge */}
                      {product.discount > 0 && (
                        <span className="absolute top-3 left-3 bg-[#1F1F1F] text-white px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider shadow-sm">
                          {product.discount}% OFF
                        </span>
                      )}

                      {/* Wishlist Heart Overlay */}
                      <button
                        className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-sm hover:bg-white transition-colors text-gray-700 hover:text-red-500"
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

                    <div className="px-1 flex flex-col flex-1 justify-between cursor-pointer" onClick={() => navigate(`/product/${product.slug}`)}>
                      <div>
                        {/* SubCategory chip label */}
                        {product.subCategory && (
                          <span className="text-[11px] uppercase tracking-wider text-[#03989E] font-semibold block mb-1">
                            {typeof product.subCategory === 'object' ? product.subCategory.name : product.subCategory}
                          </span>
                        )}
                        <h3 className="text-[15px] font-sans font-medium text-gray-900 group-hover:text-[#03989E] transition-colors line-clamp-1 mb-1">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-gray-900">₹{product.price}</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-xs text-gray-400 line-through">₹{product.compareAtPrice}</span>
                          )}
                        </div>

                        {/* Color Swatch Dots Preview on Card */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center gap-1">
                            {product.colors.slice(0, 3).map((c, i) => (
                              <span key={i} className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} title={c.name} />
                            ))}
                            {product.colors.length > 3 && <span className="text-[10px] text-gray-400 font-mono">+{product.colors.length - 3}</span>}
                          </div>
                        )}
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
