import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Typography } from '../atoms/Typography';
import { publicLandingBannerService, type PublicLandingBanner } from '../../services/publicLandingBannerService';

export const HeroBannerCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['landingBanners', 'public'],
    queryFn: () => publicLandingBannerService.getLandingBanners(),
    staleTime: 1000 * 60 * 5,
  });

  const activeBanners = banners.length > 0 ? banners : [];

  const handleNext = () => setCurrentIndex((prev) => (prev === activeBanners.length - 1 ? 0 : prev + 1));
  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeBanners.length]);

  if (isLoading) {
    return (
      <div className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="h-full w-full px-6 md:px-12 py-6">
          <div className="h-full w-full rounded-[20px] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden group" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Slider Container */}
      <div 
        className="flex w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeBanners.map((banner: PublicLandingBanner, index: number) => {
          const isActive = index === currentIndex;
          const categoryPath = banner.category ? `/category/${banner.category.slug}` : '/categories';
          return (
            <div key={banner.id} className="relative w-full h-full flex-shrink-0 px-6 md:px-12 py-6 box-border">
              {/* Image with breathing room and rounded corners */}
              <Link to={categoryPath} className="block w-full h-full overflow-hidden rounded-[20px] shadow-sm">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </Link>
              
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
                  <Link
                    to={categoryPath}
                    className="inline-flex items-center justify-center rounded-lg px-8 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-2xl transition-all duration-300"
                    style={{ backgroundColor: 'var(--accent)' }}
                    data-cursor="explore"
                    data-cursor-text="EXPLORE"
                  >
                    Explore Collection
                  </Link>
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
        className="absolute left-16 md:left-24 top-1/2 -translate-y-1/2 z-30 p-4 md:p-5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-md"
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
        className="absolute right-16 md:right-24 top-1/2 -translate-y-1/2 z-30 p-4 md:p-5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-md"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex justify-center gap-3">
        {activeBanners.map((_, index) => (
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
