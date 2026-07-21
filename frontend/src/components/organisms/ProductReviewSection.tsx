import React from 'react';
import { Typography } from '../atoms/Typography';

export interface ProductReviewSectionProps {
  reviews: {
    id: string;
    author: string;
    avatar: string;
    date: string;
    rating: number;
    text: string;
    images: string[];
    likes: number;
    dislikes: number;
  }[];
}

export const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({ reviews }) => {
  return (
    <section className="py-16 md:py-24 px-4 w-full border-t" style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header: Rating Summary & Write Review CTA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
          
          {/* Left: Rating Summary */}
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
            <div className="flex flex-col">
              <Typography variant="h3" className="mb-2">Rating & Reviews</Typography>
              <div className="flex items-baseline gap-2">
                <span className="font-sans font-bold text-7xl md:text-[96px] leading-none" style={{ color: 'var(--text-primary)' }}>4.5</span>
                <span className="font-sans font-medium text-2xl" style={{ color: 'var(--text-secondary)' }}>/5</span>
              </div>
              <p className="font-sans text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>(50 New Reviews)</p>
            </div>
            
            {/* Rating Bars */}
            <div className="flex flex-col gap-2 pt-2">
              {[5, 4, 3, 2, 1].map((star, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-6">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#FACC15" className="text-yellow-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span className="font-sans font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{star}</span>
                  </div>
                  <div className="w-32 md:w-48 h-1.5 rounded-full bg-black/10 overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: star === 5 ? '85%' : star === 4 ? '15%' : '0%',
                        backgroundColor: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Write Review */}
          <div className="flex flex-col items-start md:items-end text-left md:text-right w-full md:w-auto p-6 rounded-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <Typography variant="h5" className="mb-1">Review this product</Typography>
            <p className="font-sans text-[13px] mb-5" style={{ color: 'var(--text-secondary)' }}>Share your thoughts with other customers</p>
            <button className="px-6 py-2.5 rounded-full border border-black/20 text-[13px] font-sans font-medium transition-colors hover:border-black/50" style={{ color: 'var(--text-primary)' }}>
              Write a customer review
            </button>
          </div>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-3xl p-6 md:p-8 flex flex-col" style={{ backgroundColor: 'var(--surface-card)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-black/5">
                    <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-[14px]" style={{ color: 'var(--text-primary)' }}>{review.author}</span>
                    <span className="font-sans text-[12px]" style={{ color: 'var(--text-secondary)' }}>Buyer</span>
                  </div>
                </div>
                <span className="font-sans text-[12px]" style={{ color: 'var(--text-secondary)' }}>{review.date}</span>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < review.rating ? '#1B2A2E' : 'none'} stroke="#1B2A2E" strokeWidth={i < review.rating ? 0 : 2}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p className="font-sans text-[13px] leading-relaxed mb-6 flex-1" style={{ color: 'var(--text-secondary)' }}>
                "{review.text}"
              </p>

              {/* Images */}
              {review.images.length > 0 && (
                <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide pb-2">
                  {review.images.map((img, i) => (
                    <div key={i} className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-black/5">
                      <img src={img} alt="Review attachment" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center gap-4 mt-auto">
                <button className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                  <span className="font-sans text-[12px]" style={{ color: 'var(--text-secondary)' }}>{review.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                  </svg>
                  <span className="font-sans text-[12px]" style={{ color: 'var(--text-secondary)' }}>{review.dislikes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center">
          <button className="px-8 py-3 rounded-full border border-black/20 text-[13px] font-sans font-medium transition-colors hover:border-black/50" style={{ color: 'var(--text-primary)' }}>
            Load more
          </button>
        </div>

      </div>
    </section>
  );
};
