import React, { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';

const BANNERS = [
  {
    id: 'rajasthani-vibes',
    title: 'Rajasthani Vibes',
    subtitle: 'HERITAGE COLLECTION',
    imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_cover_qeu8de.jpg',
  },
  {
    id: 'handmade-earrings',
    title: 'Handmade Earrings',
    subtitle: 'ARTISAN JEWELRY',
    imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg',
  },
  {
    id: 'macrame-bags',
    title: 'Macrame Bags',
    subtitle: 'BOHO ESSENTIALS',
    imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg',
  },
  {
    id: 'handmade-candles',
    title: 'Handmade Candles',
    subtitle: 'SCENTS & WARMTH',
    imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg',
  },
  {
    id: 'wedding-giveaway',
    title: 'Wedding Giveaway',
    subtitle: 'CELEBRATE LOVE',
    imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_cover_yha9rn.jpg',
  }
];

export const HeroBannerCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => setCurrentIndex((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));

  useEffect(() => {
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden bg-[#f8f5f0] group">
      {/* Slider Container */}
      <div 
        className="flex w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {BANNERS.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <div key={banner.id} className="relative w-full h-full flex-shrink-0">
              {/* No colored layer on the image */}
              <img
                src={banner.imageSrc}
                alt={banner.title}
                className="w-full h-full object-cover object-center"
              />
              
              {/* Text aligned to bottom-left */}
              <div className="absolute bottom-16 md:bottom-32 left-8 md:left-24 max-w-xl text-left z-20">
                <Typography 
                  variant="subtitle" 
                  className={`text-white mb-3 md:mb-5 tracking-[0.3em] text-xs md:text-sm uppercase font-bold drop-shadow-md transition-all duration-1000 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                >
                  {banner.subtitle}
                </Typography>
                <Typography 
                  variant="h2" 
                  className={`text-white mb-8 md:mb-10 leading-tight text-5xl md:text-6xl lg:text-7xl font-medium drop-shadow-xl transition-all duration-1000 delay-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                >
                  {banner.title}
                </Typography>
                <div className={`transition-all duration-1000 delay-700 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <Button 
                    variant="primary" 
                    data-cursor="explore"
                    data-cursor-text="EXPLORE"
                    className="px-8 py-4 rounded-none tracking-[0.15em] text-xs font-semibold uppercase shadow-2xl transition-all duration-300 cursor-none"
                  >
                    Explore Collection
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrev}
        data-cursor="prev"
        data-cursor-text="PREV"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 md:p-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg cursor-none"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button 
        onClick={handleNext}
        data-cursor="next"
        data-cursor-text="NEXT"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 md:p-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg cursor-none"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex justify-center gap-3">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-500 ease-out shadow-sm ${
              index === currentIndex ? 'w-10 h-2 bg-white rounded-full' : 'w-2 h-2 bg-white/60 hover:bg-white/90 rounded-full'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
