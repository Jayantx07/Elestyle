import { apiClient } from '@/lib/apiClient';
import React, { useState } from 'react';
import { Typography } from '../atoms/Typography';

export interface ProductReviewSectionProps {
  productId: string;
  ratingAverage: number;
  reviewCount: number;
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

import { publicProductService } from '../../services/publicProductService';

export const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({ productId, ratingAverage, reviewCount, reviews: initialReviews }) => {
  const [isWriting, setIsWriting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [reviewsList, setReviewsList] = useState(initialReviews);
  const [votedSet, setVotedSet] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    setReviewsList(initialReviews);
  }, [initialReviews]);

  const handleVote = async (reviewId: string, type: 'like' | 'dislike') => {
    if (votedSet.has(reviewId)) return;
    
    // optimistic update
    setReviewsList(prev => prev.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          likes: type === 'like' ? r.likes + 1 : r.likes,
          dislikes: type === 'dislike' ? r.dislikes + 1 : r.dislikes,
        };
      }
      return r;
    }));
    setVotedSet(prev => new Set(prev).add(reviewId));

    try {
      await publicProductService.voteReview(reviewId, type);
    } catch (e) {
      console.error('Failed to vote', e);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient(`/api/v1/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, customerEmail, rating, comment })
      });
      const data = res;
      if (data.success) {
        setSubmitMessage('Review submitted successfully. It is pending approval.');
        setCustomerName(''); setCustomerEmail(''); setComment(''); setRating(5);
        setTimeout(() => { setIsWriting(false); setSubmitMessage(''); }, 3000);
      } else {
        setSubmitMessage(data.message || 'Error submitting review');
      }
    } catch (error) {
      setSubmitMessage('Network error');
    }
  };
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
                <span className="font-sans font-bold text-7xl md:text-[96px] leading-none" style={{ color: 'var(--text-primary)' }}>{ratingAverage.toFixed(1)}</span>
                <span className="font-sans font-medium text-2xl" style={{ color: 'var(--text-secondary)' }}>/5</span>
              </div>
              <p className="font-sans text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>({reviewCount} Reviews)</p>
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
          <div className="flex flex-col items-start md:items-center justify-center w-full md:w-auto p-8 rounded-3xl" style={{ backgroundColor: 'var(--surface-card)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h5" className="mb-2">Review this product</Typography>
            <p className="font-sans text-[14px] mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>Share your thoughts with other customers</p>
            {!isWriting ? (
              <button onClick={() => setIsWriting(true)} className="px-8 py-3 rounded-full bg-black text-white text-[14px] font-sans font-medium transition-transform hover:scale-105">
                Write a customer review
              </button>
            ) : (
              <button onClick={() => setIsWriting(false)} className="px-8 py-3 rounded-full border border-black/20 text-[14px] font-sans font-medium transition-colors hover:border-black/50" style={{ color: 'var(--text-primary)' }}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Review Form */}
        {isWriting && (
          <div className="mb-16">
            <form onSubmit={handleSubmitReview} className="p-8 md:p-10 rounded-[2rem] border border-gray-100 bg-white shadow-xl max-w-3xl mx-auto w-full transition-all duration-300 transform origin-top">
              <Typography variant="h3" className="mb-8 text-center">Write a Review</Typography>
              {submitMessage && <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium text-center">{submitMessage}</div>}
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input required type="text" placeholder="e.g. Jane Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm focus:border-black outline-none transition-colors bg-gray-50/50 focus:bg-white" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input required type="email" placeholder="e.g. jane@example.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm focus:border-black outline-none transition-colors bg-gray-50/50 focus:bg-white" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Overall Rating</label>
                  <select value={rating} onChange={e => setRating(Number(e.target.value))} className="px-5 py-3 border border-gray-200 rounded-xl text-sm outline-none transition-colors bg-gray-50/50 focus:bg-white w-full md:w-1/3 cursor-pointer">
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Star' : 'Stars'}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Your Review</label>
                  <textarea required placeholder="What did you like or dislike? What is this product used for?" value={comment} onChange={e => setComment(e.target.value)} className="px-5 py-4 border border-gray-200 rounded-xl text-sm min-h-[140px] resize-y focus:border-black outline-none transition-colors bg-gray-50/50 focus:bg-white" />
                </div>
                <button type="submit" className="px-8 py-3.5 mt-2 rounded-full bg-black text-white text-[15px] font-sans font-medium self-center hover:bg-black/80 transition-all hover:scale-105 hover:shadow-lg w-full md:w-auto min-w-[200px]">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {reviewsList.map((review) => (
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
                <button 
                  onClick={() => handleVote(review.id, 'like')} 
                  disabled={votedSet.has(review.id)}
                  className={`flex items-center gap-1.5 transition-opacity ${votedSet.has(review.id) ? 'opacity-100 text-black' : 'opacity-60 hover:opacity-100'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={votedSet.has(review.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                  <span className="font-sans text-[13px] font-medium">{review.likes}</span>
                </button>
                <button 
                  onClick={() => handleVote(review.id, 'dislike')} 
                  disabled={votedSet.has(review.id)}
                  className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                  </svg>
                  <span className="font-sans text-[13px] font-medium">{review.dislikes}</span>
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
