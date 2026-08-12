import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SectionHeader } from '../molecules/SectionHeader';
import { VideoCard } from '../molecules/VideoCard';
import { videoHighlightService } from '../../services/videoHighlightService';
import { videoHighlightKeys } from '@/lib/queryKeys';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const VideoHighlightsSection: React.FC = () => {
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { data: highlights = [], isLoading } = useQuery({
    queryKey: videoHighlightKeys.all,
    queryFn: () => videoHighlightService.getHighlights(),
  });

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for pixel rounding
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [highlights]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading || !highlights || highlights.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-32 relative group/section" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Header Container - constrained width and padding */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <SectionHeader
          subtitle="IN MOTION"
          title="Video"
          titleAccent="highlights"
          rightContent={
            <>
              Four categories, four quiet moments — each looping softly, like a<br />
              shop window at dusk.
            </>
          }
        />
      </div>

      {/* Rail Container - full width for bleed, but inner padding to align with max-w-7xl */}
      <div className="w-full relative">
        
        {/* Navigation Arrows */}
        {canScrollLeft && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-all opacity-0 group-hover/section:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {canScrollRight && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-all opacity-0 group-hover/section:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex flex-row overflow-x-auto scrollbar-hide snap-x snap-mandatory items-center pb-4"
          style={{
            /* Align the start of the scroll with the container, but allow bleeding to the right */
            paddingLeft: 'max(16px, calc((100vw - 1280px) / 2 + 16px))',
            paddingRight: 'max(16px, calc((100vw - 1280px) / 2 + 16px))',
            gap: 'var(--rail-gap, 10px)'
          }}
        >
          <style>{`
            @media (min-width: 1024px) {
              .rail-gap { gap: 14px; }
            }
            @media (max-width: 1023px) {
              .rail-gap { gap: 10px; }
            }
          `}</style>
          
          <div className="flex flex-row snap-x snap-mandatory rail-gap w-max">
            {highlights.map((item) => (
              <VideoCard
                key={item.id}
                category={item.category ? item.category.name : ''}
                title={item.title}
                imageSrc={item.posterUrl}
                videoSrc={item.videoUrl}
                className="w-[62vw] md:w-[180px] lg:w-[240px]"
                onUnmute={() => setActiveAudioId(item.id)}
                forceMute={activeAudioId !== null && activeAudioId !== item.id}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
