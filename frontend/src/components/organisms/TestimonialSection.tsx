import React from 'react';
import { SectionHeader } from '../molecules/SectionHeader';
import { ReviewTextCard } from '../molecules/ReviewTextCard';
import { ReviewVisualCard } from '../molecules/ReviewVisualCard';

export const TestimonialSection: React.FC = () => {
  const reviews = [
    {
      id: '1',
      badge: 'HANDMADE EARRINGS',
      hasVideo: false,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg',
    },
    {
      id: '2',
      badge: 'MACRAME BAGS',
      hasVideo: true,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg',
    },
    {
      id: '3',
      badge: 'HANDMADE CANDLES',
      hasVideo: false,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
    },
    {
      id: '4',
      badge: 'RAJASTHANI VIBES',
      hasVideo: false,
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_cover_qeu8de.jpg',
    },
  ];

  return (
    <section className="py-16 md:py-32 px-4 overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          subtitle="OUR REVIEWS"
          title="Loved by our customers,"
          titleAccent="trusted for our quality."
          rightContent={
            <div className="flex flex-col items-end gap-6 text-right w-full md:max-w-md ml-auto">
              <p className="font-sans text-[15px] leading-relaxed m-0" style={{ color: 'var(--text-secondary)' }}>
                Real stories from real people. Every review is an unfiltered look at the pieces our community brings into their homes and everyday lives.
              </p>
              <div className="flex gap-3">
                <button aria-label="Previous review" className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition-colors bg-transparent cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <button aria-label="Next review" className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition-colors bg-transparent cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {reviews.map((review) => (
            <ReviewVisualCard
              key={`visual-${review.id}`}
              imageSrc={review.imageSrc}
              badgeLabel={review.badge}
              hasVideo={review.hasVideo}
              className="aspect-[4/5] md:aspect-[3/4]"
            />
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-12">
          <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D1D5DB' }} />
        </div>
      </div>
    </section>
  );
};
