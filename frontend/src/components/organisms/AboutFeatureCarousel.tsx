import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FeatureCard } from '../molecules/FeatureCard';
import { publicAboutFeatureHighlightService } from '../../services/aboutFeatureHighlightService';
import { aboutFeatureHighlightKeys } from '@/lib/queryKeys';

export const AboutFeatureCarousel: React.FC = () => {
  const { data: features = [], isLoading } = useQuery({
    queryKey: aboutFeatureHighlightKeys.lists(),
    queryFn: publicAboutFeatureHighlightService.getAll,
  });

  if (isLoading || features.length === 0) {
    return null; // Or return a skeleton loader if desired, but returning null hides the empty section
  }

  return (
    <section className="py-12 md:py-24 overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="w-full">
        <div className="flex animate-about-feature-marquee w-max">
          {/* First set */}
          <div className="flex gap-4 md:gap-6 px-2 md:px-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                className="w-[260px] md:w-[320px] shrink-0"
                imageSrc={feature.imageSrc}
                altText={feature.altText}
                badgeLabel={feature.category ? feature.category.name : ''}
              />
            ))}
          </div>
          {/* Second set for seamless loop */}
          <div className="flex gap-4 md:gap-6 px-2 md:px-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id + '-copy'}
                className="w-[260px] md:w-[320px] shrink-0"
                imageSrc={feature.imageSrc}
                altText={feature.altText}
                badgeLabel={feature.category ? feature.category.name : ''}
              />
            ))}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes aboutFeatureMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-about-feature-marquee {
          animation: aboutFeatureMarquee 40s linear infinite;
        }
        .animate-about-feature-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
};
