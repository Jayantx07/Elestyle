import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductDetailSection } from '../components/organisms/ProductDetailSection';
import { ProductReviewSection } from '../components/organisms/ProductReviewSection';
import { ProductCard } from '../components/molecules/ProductCard';
import { Typography } from '../components/atoms/Typography';

// Dummy data for the PDP
const getDummyProduct = (id?: string) => {
  // Determine category based on prefix for theme testing
  let category = 'home-furnishing';
  if (id?.startsWith('mb')) category = 'bags';
  if (id?.startsWith('he')) category = 'jewelry';
  if (id?.startsWith('hc')) category = 'homemade-soaps';
  if (id?.startsWith('wg')) category = 'wedding-giveaways';

  return {
    id: id || 'default',
    category,
    title: 'Alpha Male',
    price: 240.99,
    description: 'Alpha Male by Arona is a Aromatic Fougere fragrance for men. It was launched in 2015. The nose behind this fragrance is François Demachy.',
    imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg',
    thumbnails: [
      'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg',
      'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
      'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg'
    ],
    mainNotes: ['Fresh Spicy', 'Amber', 'Citrus', 'Aromatic', 'Musky', 'Woody', 'Lavender', 'Herbal', 'Warm Spicy'],
    reviews: [
      {
        id: 'r1',
        author: 'Obayedul Islam',
        avatar: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg',
        date: '2 Weeks ago',
        rating: 5,
        text: 'I am thoroughly impressed with the service provided by this real estate team also offered exceptionally professional.',
        images: [
          'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg',
          'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
          'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg'
        ],
        likes: 10,
        dislikes: 16
      },
      {
        id: 'r2',
        author: 'Rayhan Islam',
        avatar: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
        date: '2 Weeks ago',
        rating: 5,
        text: 'I am thoroughly impressed with the service provided by this real estate team also offered exceptionally professional.',
        images: [
          'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg',
          'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg',
          'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/macrame_bags_waokfv.jpg'
        ],
        likes: 10,
        dislikes: 16
      }
    ],
    relatedProducts: [
      { id: 'hc1', title: 'Vko perfume', price: 120.00, description: 'Fresh scent', imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg' },
      { id: 'hc2', title: 'White wood', price: 210.00, description: 'Woody notes', imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg' },
      { id: 'wg1', title: 'Ryva', price: 220.00, description: 'Floral blend', imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg' },
      { id: 'wg2', title: 'Senfeur', price: 320.00, description: 'Elegant fragrance', imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_cover_yha9rn.jpg' },
      { id: 'he1', title: 'Roza Perfume', price: 220.00, description: 'Rose infused', imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg' },
      { id: 'he2', title: 'Hiva Fragrance', price: 130.00, description: 'Sweet notes', imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg' },
      { id: 'mb1', title: 'Sweet Girl', price: 321.00, description: 'Fruity mix', imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg' },
      { id: 'mb2', title: 'One Choice', price: 312.00, description: 'Musk base', imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg' }
    ]
  };
};

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = getDummyProduct(id);

  // Scroll to top on id change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  // Set category for theme variables
  useEffect(() => {
    document.documentElement.setAttribute('data-category', product.category);
    return () => {
      // Optional: reset when unmounting, but usually you want it to persist or be overridden by next page
      document.documentElement.removeAttribute('data-category');
    };
  }, [product.category]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      
      {/* Breadcrumb Area (Optional placeholder for spacing based on design) */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-10 pb-2">
        <p className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          &lt; Home / Products
        </p>
      </div>

      <ProductDetailSection product={product} />
      
      <ProductReviewSection reviews={product.reviews} />

      {/* You Might Also Like Section */}
      <section className="py-16 md:py-24 px-4 w-full" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="max-w-7xl mx-auto">
          <Typography variant="h2" className="text-center mb-16">You might also like</Typography>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mb-16">
            {product.relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                price={p.price}
                description={p.description}
                imageSrc={p.imageSrc}
                altText={p.title}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <button className="px-8 py-3 rounded-full border border-black/20 text-[13px] font-sans font-medium transition-colors hover:border-black/50" style={{ color: 'var(--text-primary)' }}>
              See more
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ProductPage;
