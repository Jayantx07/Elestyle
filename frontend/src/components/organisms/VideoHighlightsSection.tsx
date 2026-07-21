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

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full h-auto md:h-[640px]">
          {/* Left large card */}
          <div className="w-full md:w-[45%] h-[400px] md:h-full">
            <VideoCard
              category="RAJASTHANI VIBES"
              title="Softly lived-in"
              imageSrc="https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_cover_qeu8de.jpg"
              hasNotification
              className="w-full h-full"
            />
          </div>
          
          {/* Right column */}
          <div className="w-full md:w-[55%] flex flex-col gap-4 md:gap-6 h-[800px] md:h-full">
            {/* Top wide card */}
            <div className="flex-1 h-1/2">
              <VideoCard
                category="MACRAME BAGS"
                title="Everyday carry"
                imageSrc="https://res.cloudinary.com/gc1qeznc/image/upload/v1784527413/macrame_bags_cover_qvbzf6.jpg"
                hasNotification
                className="w-full h-full"
              />
            </div>
            
            {/* Bottom two cards */}
            <div className="flex-1 h-1/2 flex gap-4 md:gap-6">
              <div className="flex-1">
                <VideoCard
                  category="HANDMADE EARRINGS"
                  title="Fine details"
                  imageSrc="https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_cover_kebibm.jpg"
                  hasNotification
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1">
                <VideoCard
                  category="HANDMADE CANDLES"
                  title="Slow craft"
                  imageSrc="https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg"
                  hasNotification
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
