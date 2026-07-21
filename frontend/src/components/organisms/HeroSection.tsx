import React from 'react';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';

export const HeroSection: React.FC = () => {
  return (
    <section className="pt-40 pb-20 md:pt-48 md:pb-32 px-4 flex flex-col items-center justify-center text-center min-h-[70vh]">
      <Typography variant="subtitle" className="mb-8">
        EST. 2020 — HANDCRAFTED LIVING
      </Typography>
      
      <div className="max-w-4xl mx-auto mb-10">
        <Typography variant="h1" className="mb-2">
          Timeless pieces for a <Typography as="span" em>life</Typography>
        </Typography>
        <Typography variant="h1" em>
          well lived.
        </Typography>
      </div>
      
      <Typography variant="body" className="max-w-2xl mx-auto mb-12">
        An editorial collection of home furnishing, bags, jewelry and homemade soaps — thoughtfully sourced, quietly beautiful.
      </Typography>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button variant="primary" size="lg">SHOP THE EDIT</Button>
        <Button variant="outline" size="lg">OUR STORY</Button>
      </div>
    </section>
  );
};
