import React from 'react';
import { FeatureCard } from '../molecules/FeatureCard';

export const FeatureCarousel: React.FC = () => {
  const features = [
    {
      id: '1',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784625677/Bag_14_b6gksw.jpg',
      altText: 'Macrame Bag',
      badgeLabel: 'MACRAME BAGS',
    },
    {
      id: '2',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784625411/Earring_4_hfyddr.jpg',
      altText: 'Handmade Earring',
      badgeLabel: 'HANDMADE EARRINGS',
    },
    {
      id: '3',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784625405/Earring_9_uftsiq.jpg',
      altText: 'Handmade Earring',
      badgeLabel: 'HANDMADE EARRINGS',
    },
    {
      id: '4',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784625345/Necklace_vm2g2r.jpg',
      altText: 'Necklace',
      badgeLabel: 'JEWELRY',
    },
    {
      id: '5',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784625342/Necklace_5_oc2hpr.jpg',
      altText: 'Necklace',
      badgeLabel: 'JEWELRY',
    },
    {
      id: '6',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784625343/Necklace_1_zkchxw.jpg',
      altText: 'Necklace',
      badgeLabel: 'JEWELRY',
    },
    {
      id: '7',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784625719/Vanity_Bag_1_j0oxzi.jpg',
      altText: 'Vanity Bag',
      badgeLabel: 'VANITY BAGS',
    },
    {
      id: '8',
      imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784625707/Bag_3_zhcatb.jpg',
      altText: 'Macrame Bag',
      badgeLabel: 'MACRAME BAGS',
    },
  ];

  return (
    <section className="py-12 md:py-24 overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="w-full">
        <div className="flex animate-feature-marquee w-max">
          {/* First set */}
          <div className="flex gap-4 md:gap-6 px-2 md:px-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                className="w-[260px] md:w-[320px] shrink-0"
                imageSrc={feature.imageSrc}
                altText={feature.altText}
                badgeLabel={feature.badgeLabel}
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
                badgeLabel={feature.badgeLabel}
              />
            ))}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes featureMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-feature-marquee {
          animation: featureMarquee 40s linear infinite;
        }
        .animate-feature-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
};
