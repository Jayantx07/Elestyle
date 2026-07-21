import React from 'react';
import { CircularCategoryCarousel } from '../components/organisms/CircularCategoryCarousel';
import { HeroBannerCarousel } from '../components/organisms/HeroBannerCarousel';
import { FeatureCarousel } from '../components/organisms/FeatureCarousel';
import { ProductGridSection } from '../components/organisms/ProductGridSection';
import { VideoHighlightsSection } from '../components/organisms/VideoHighlightsSection';
import { TestimonialSection } from '../components/organisms/TestimonialSection';
import { TextReviewMarqueeSection } from '../components/organisms/TextReviewMarqueeSection';
import { FAQSection } from '../components/organisms/FAQSection';
import { MarqueeBanner } from '../components/organisms/MarqueeBanner';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <CircularCategoryCarousel />
      <HeroBannerCarousel />
      <FeatureCarousel />
      <ProductGridSection />
      <VideoHighlightsSection />
      <TestimonialSection />
      <TextReviewMarqueeSection />
      <FAQSection />
      <MarqueeBanner />
    </div>
  );
};

export default Home;

