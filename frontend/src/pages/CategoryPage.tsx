import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicCategories, type Category } from '../services/publicCategoryService';
import { publicProductService, type PublicProduct } from '../services/publicProductService';
import { ProductCard } from '../components/molecules/ProductCard';

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

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
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categorySlug]);

  if (loading) return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  if (!category) return <div className="min-h-screen pt-32 text-center">Category not found</div>;

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: 'var(--bg-page)' }}>
      {category.bannerImage && (
        <div className="w-full h-64 md:h-96 relative pt-[70px]">
          <img src={category.bannerImage} alt={category.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
             <h1 className="text-white text-4xl md:text-6xl font-fraunces">{category.name}</h1>
          </div>
        </div>
      )}
      {!category.bannerImage && (
        <div className="pt-32 pb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-fraunces" style={{ color: 'var(--text-primary)' }}>
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">{category.description}</p>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-12">
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products found in this category.</p>
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
    </div>
  );
};

export default CategoryPage;
