import React from 'react';
import { Typography } from '../atoms/Typography';

export interface VideoCardProps {
  imageSrc: string;
  category: string;
  title: string;
  hasNotification?: boolean;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  imageSrc,
  category,
  title,
  hasNotification = false,
  className = '',
}) => {
  return (
    <div className={`relative group overflow-hidden rounded-3xl cursor-pointer ${className}`}>
      <img
        src={imageSrc}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
      
      {/* Notification Dot */}
      {hasNotification && (
        <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-accent-gold z-10" />
      )}
      
      {/* Content */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <Typography variant="subtitle" className="text-white/80 mb-2 block">
          {category}
        </Typography>
        <Typography variant="h3" as="h3" className="text-white">
          {title}
        </Typography>
      </div>
    </div>
  );
};
