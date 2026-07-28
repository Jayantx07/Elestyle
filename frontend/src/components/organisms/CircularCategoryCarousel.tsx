import React from 'react';
import { Link } from 'react-router-dom';

export const CATEGORIES = [
  { id: '1', slug: 'home-furnishing', label: 'Home Furnishing', imgSrc: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop' },
  { id: '2', slug: 'rajasthani-vibes', label: 'Rajasthani Vibes', imgSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_u6p0zm.jpg' },
  { id: '3', slug: 'handmade-earrings', label: 'Handmade Earrings', imgSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg' },
  { id: '4', slug: 'macrame-bags', label: 'Macrame Bags', imgSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg' },
  { id: '5', slug: 'handmade-soaps', label: 'Handmade Soaps', imgSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg' },
  { id: '6', slug: 'wedding-giveaway', label: 'Wedding Giveaway', imgSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg' },
];

export const CircularCategoryCarousel: React.FC = () => {
  return (
    <div
      className="w-full pt-28 md:pt-[128px] pb-6"
      style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-start justify-start md:justify-center gap-4 md:gap-8 min-w-max mx-auto pb-4 mt-2 md:mt-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`/shop/${category.slug}`}
              className="flex flex-col items-center gap-3 group shrink-0 w-24 md:w-32"
              aria-label={`Browse ${category.label}`}
              data-cursor="explore"
              data-cursor-text="VIEW"
            >
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 ring-2 ring-transparent group-hover:ring-[var(--accent)] transition-shadow">
                <img
                  src={category.imgSrc}
                  alt={`${category.label} category`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <span
                className="font-sans font-semibold text-[11px] md:text-sm text-center leading-tight transition-colors duration-200"
                style={{ color: 'var(--text-primary)' }}
              >
                {category.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

