import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../molecules/SectionHeader';
import { CategoryTabs } from '../molecules/CategoryTabs';
import { ProductCard } from '../molecules/ProductCard';
import { fetchPublicCategories, type Category } from '../../services/publicCategoryService';
import { publicProductService, type PublicProduct } from '../../services/publicProductService';

export const ProductGridSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchPublicCategories({ homepage: true }).then((cats) => {
      setCategories(cats);
      if (cats.length > 0) {
        setActiveCategoryId(cats[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeCategoryId) return;
    const cat = categories.find(c => c._id === activeCategoryId);
    if (cat) {
      setLoadingProducts(true);
      publicProductService.getProductsByCategorySlug(cat.slug)
        .then((res) => {
          setProducts(res.data || []);
          setLoadingProducts(false);
        })
        .catch(() => {
          setProducts([]);
          setLoadingProducts(false);
        });
    }
  }, [activeCategoryId, categories]);

  if (categories.length === 0) return null;

  const tabs = categories.map((cat) => ({
    id: cat._id,
    label: cat.name.toUpperCase(),
  }));

  const activeCat = categories.find(c => c._id === activeCategoryId);
  const heading = 'Recommended';
  const accent = activeCat ? activeCat.name : '';

  return (
    <section className="py-16 md:py-32 px-4" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        <CategoryTabs
          categories={tabs}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
          className="mb-12"
        />

        <SectionHeader
          subtitle="CURATED"
          title={heading}
          titleAccent={accent}
          actionText="SEE ALL"
          onAction={() => {}}
        />

        {loadingProducts ? (
          <div className="text-center py-10">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => {
              const imageSrc = product.images?.[0]?.secure_url || '';
              return (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  title={product.name}
                  price={product.price}
                  description={product.description || ''}
                  imageSrc={imageSrc}
                  altText={product.name}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
