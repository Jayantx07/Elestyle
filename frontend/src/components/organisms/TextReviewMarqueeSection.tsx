import React from 'react';
import { ReviewTextCard } from '../molecules/ReviewTextCard';

export const TextReviewMarqueeSection: React.FC = () => {
  const topReviews = [
    {
      id: 't1',
      quote: 'The macrame bag goes with everything. Beautifully made, worth every rupee.',
      userName: 'Sneha Patel',
      userLocation: 'MUMBAI, IN',
      userInitials: 'S',
      avatarBgColor: '#F3EAE1',
    },
    {
      id: 't2',
      quote: 'Our living room finally feels like the home I always wanted.',
      userName: 'Priya Sharma',
      userLocation: 'DELHI, IN',
      userInitials: 'P',
      avatarBgColor: '#F5E6CD',
    },
    {
      id: 't3',
      quote: 'Packaging is a love letter. You feel the care immediately.',
      userName: 'Harini Krishnan',
      userLocation: 'CHENNAI, IN',
      userInitials: 'H',
      avatarBgColor: '#EAE1D8',
    },
    {
      id: 't4',
      quote: 'The earrings are so light I forget I am wearing them.',
      userName: 'Ananya Singh',
      userLocation: 'BANGALORE, IN',
      userInitials: 'A',
      avatarBgColor: '#DFE2D2',
    },
  ];

  const bottomReviews = [
    {
      id: 'b1',
      quote: 'You can feel the care that went into these. Truly special.',
      userName: 'Ritu Desai',
      userLocation: 'PUNE, IN',
      userInitials: 'R',
      avatarBgColor: '#F3EFE0',
    },
    {
      id: 'b2',
      quote: 'The linen cushions transformed our reading nook. Timeless.',
      userName: 'Chitra Menon',
      userLocation: 'KOCHI, IN',
      userInitials: 'C',
      avatarBgColor: '#F6E6C5',
    },
    {
      id: 'b3',
      quote: 'Quiet luxury done right — nothing shouts, everything lasts.',
      userName: 'Ishita Verma',
      userLocation: 'CHANDIGARH, IN',
      userInitials: 'I',
      avatarBgColor: '#F0E5D0',
    },
    {
      id: 'b4',
      quote: 'The statement ring gets compliments wherever I go.',
      userName: 'Ayesha Khan',
      userLocation: 'HYDERABAD, IN',
      userInitials: 'A',
      avatarBgColor: '#E6E1D1',
    },
  ];

  // We duplicate the array to create a seamless infinite scrolling effect
  const renderMarqueeRow = (reviews: typeof topReviews, isLtr: boolean) => (
    <div className={`flex w-max gap-6 mb-6 ${isLtr ? 'animate-marquee-ltr' : 'animate-marquee-rtl'}`}>
      {[...reviews, ...reviews, ...reviews].map((review, index) => (
        <ReviewTextCard
          key={`${review.id}-${index}`}
          quote={review.quote}
          userName={review.userName}
          userLocation={review.userLocation}
          userInitials={review.userInitials}
          avatarBgColor={review.avatarBgColor}
          className="shrink-0"
        />
      ))}
    </div>
  );

  return (
    <section className="py-16 md:py-24 overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="relative">
        {renderMarqueeRow(topReviews, true)}
        {renderMarqueeRow(bottomReviews, false)}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-ltr {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes marquee-rtl {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-ltr {
          animation: marquee-ltr 50s linear infinite;
        }
        .animate-marquee-rtl {
          animation: marquee-rtl 50s linear infinite;
        }
        .animate-marquee-ltr:hover,
        .animate-marquee-rtl:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
};
