import React from 'react';
import { SectionHeader } from '../molecules/SectionHeader';
import { VideoCard } from '../molecules/VideoCard';

export const VideoHighlightsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-32 px-4" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
          {/* Large left card (spans 2 cols & 2 rows on md) */}
          <div className="h-[420px] md:col-span-2 md:row-span-2 md:h-[640px]">
            <VideoCard
              category="RAJASTHANI VIBES"
              title="Softly lived-in"
              imageSrc="https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_cover_qeu8de.jpg"
              hasNotification
              className="w-full h-full rounded-3xl"
            />
          </div>

          {/* Top right */}
          <div className="h-[300px] md:col-span-2 md:h-[320px]">
            <VideoCard
              category="MACRAME BAGS"
              title="Everyday carry"
              imageSrc="https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg"
              hasNotification
              className="w-full h-full rounded-3xl"
            />
          </div>

          {/* Bottom two (split into two columns under the top-right) */}
          <div className="h-[300px] md:col-span-1 md:h-[300px]">
            <VideoCard
              category="HANDMADE EARRINGS"
              title="Fine details"
              imageSrc="https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg"
              hasNotification
              className="w-full h-full rounded-3xl"
            />
          </div>

          <div className="h-[300px] md:col-span-1 md:h-[300px]">
            <VideoCard
              category="HANDMADE SOAPS"
              title="Slow craft"
              imageSrc="https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg"
              hasNotification
              className="w-full h-full rounded-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
