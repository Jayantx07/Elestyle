import React from 'react';
import { Badge } from '../atoms/Badge';
import { IconButton } from '../atoms/IconButton';

export interface ReviewVisualCardProps {
  imageSrc: string;
  badgeLabel: string;
  hasVideo?: boolean;
  onPlayClick?: () => void;
  className?: string;
}

export const ReviewVisualCard: React.FC<ReviewVisualCardProps> = ({
  imageSrc,
  badgeLabel,
  hasVideo = false,
  onPlayClick,
  className = '',
}) => {
  return (
    <div className={`relative group overflow-hidden rounded-3xl aspect-square cursor-pointer ${className}`}>
      <img
        src={imageSrc}
        alt="Reviewer visual"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Top Right Badge */}
      <div className="absolute top-6 right-6 z-10">
        <Badge variant="overlay">{badgeLabel}</Badge>
      </div>

      {/* Play Button Overlay */}
      {hasVideo && (
        <div className="absolute top-6 left-6 z-10">
          <IconButton
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              onPlayClick?.();
            }}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-accent-teal ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            }
          />
        </div>
      )}
    </div>
  );
};
