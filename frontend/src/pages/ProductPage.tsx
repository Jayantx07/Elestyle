import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductDetailSection } from '../components/organisms/ProductDetailSection';
import { ProductReviewSection } from '../components/organisms/ProductReviewSection';
import { ProductCard } from '../components/molecules/ProductCard';
import { Typography } from '../components/atoms/Typography';
import { publicProductService, type PublicProduct } from '../services/publicProductService';

const ProductPage: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await publicProductService.getProductBySlug(slug);
        if (res.success && res.data) {
          const p = res.data;
          
          // Map MongoDB product to component structure
          const mappedProduct = {
            id: p._id,
            category: p.category?.name?.toLowerCase().replace(/ /g, '-') || 'default',
            title: p.name,
            price: p.price,
            description: p.description || 'No description available.',
            imageSrc: p.images?.[0]?.secure_url || '',
            thumbnails: p.images?.map((img: any) => img.secure_url) || [],
            mainNotes: p.tags || [],
            reviews: [
              // Keep dummy reviews for now as backend reviews aren't fully implemented
              {
                id: 'r1',
                author: 'Jane Doe',
                avatar: 'https://ui-avatars.com/api/?name=Jane+Doe&background=random',
                date: '1 Week ago',
                rating: 5,
                text: 'Absolutely love this product! The quality is amazing and it looks exactly like the pictures.',
                images: [],
                likes: 12,
                dislikes: 0
              }
            ],
            relatedProducts: [] // We'll set this separately
          };
          
          setProductData(mappedProduct);
          
          // Fetch related products
          const relatedRes = await publicProductService.getRelatedProducts(slug);
          if (relatedRes.success) {
            setRelatedProducts(relatedRes.data);
          }
        } else {
          navigate('/404');
        }
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [slug, navigate]);

  useEffect(() => {
    if (productData?.category) {
      document.documentElement.setAttribute('data-category', productData.category);
      return () => {
        document.documentElement.removeAttribute('data-category');
      };
    }
  }, [productData?.category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <p className="font-sans text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <p className="font-sans text-gray-500">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      
      <div className="max-w-7xl mx-auto w-full px-4 pt-10 pb-2">
        <p className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          &lt; Home / Products / {productData.title}
        </p>
      </div>

      <ProductDetailSection product={productData} />
      
      <ProductReviewSection reviews={productData.reviews} />

      {relatedProducts.length > 0 && (
        <section className="py-16 md:py-24 px-4 w-full" style={{ backgroundColor: 'var(--bg-page)' }}>
          <div className="max-w-7xl mx-auto">
            <Typography variant="h2" className="text-center mb-16">You might also like</Typography>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mb-16">
              {relatedProducts.map((p: any) => {
                const imgUrl = p.images?.find((img: any) => img.isFeatured)?.secure_url || p.images?.[0]?.secure_url || '';
                return (
                  <ProductCard
                    key={p._id}
                    id={p.slug}
                    title={p.name}
                    price={p.price}
                    description={p.description || ''}
                    imageSrc={imgUrl}
                    altText={p.name}
                  />
                );
              })}
            </div>

            <div className="flex justify-center">
              <button className="px-8 py-3 rounded-full border border-black/20 text-[13px] font-sans font-medium transition-colors hover:border-black/50" style={{ color: 'var(--text-primary)' }}>
                See more
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductPage;
