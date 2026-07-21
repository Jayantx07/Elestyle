import React from 'react';
import { Badge } from '../atoms/Badge';

export interface FeatureCardProps {
  imageSrc: string;
  badgeLabel: string;
  altText?: string;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  imageSrc,
  badgeLabel,
  altText = 'Feature image',
  className = '',
}) => {
  return (
    <div className={`relative group overflow-hidden rounded-3xl aspect-[3/4] cursor-pointer ${className}`}>
      <img
        src={imageSrc}
        alt={altText}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute top-6 left-6 z-10">
        <Badge variant="overlay">{badgeLabel}</Badge>
      </div>
    </div>
  );
};
