import React, { useRef, useEffect, useState } from 'react';

import { Play, Volume2, VolumeX } from 'lucide-react';

export interface VideoCardProps {
  imageSrc: string;
  category: string;
  title: string;
  videoSrc?: string;
  className?: string;
  onUnmute?: () => void;
  forceMute?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  imageSrc,
  category,
  title,
  videoSrc = 'https://www.w3schools.com/html/mov_bbb.mp4',
  className = '',
  onUnmute,
  forceMute = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Sync external forceMute
  useEffect(() => {
    if (forceMute && !isMuted) {
      setIsMuted(true);
    }
  }, [forceMute]);

  // Observer for lazy loading video source (within 1 card width)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            lazyObserver.disconnect();
          }
        });
      },
      { rootMargin: '300px' } // Load when within ~300px
    );
    lazyObserver.observe(el);
    return () => lazyObserver.disconnect();
  }, []);

  // Observer for auto-play/pause when centered
  useEffect(() => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const playObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Play if most of the card is visible (> 60%)
          if (entry.intersectionRatio > 0.6) {
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          } else {
            video.pause();
            video.currentTime = 0; // reset to poster frame
            setIsPlaying(false);
            setIsMuted(true); // reset to muted when leaving
          }
        });
      },
      { threshold: [0, 0.4, 0.6, 0.8, 1.0] }
    );
    playObserver.observe(el);
    return () => playObserver.disconnect();
  }, [shouldLoad]); // Re-bind once loaded

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (!newMuted && onUnmute) {
      onUnmute();
    }
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative group overflow-hidden rounded-[14px] cursor-pointer snap-start shrink-0 ${className}`}
      style={{ aspectRatio: '9/16' }}
      onClick={handlePlayPause}
    >
      {shouldLoad ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={imageSrc}
          preload="metadata"
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
        />
      ) : (
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Category Pill */}
      <div className="absolute top-2 left-2 z-10">
        <span className="bg-[var(--accent)] text-white rounded-full px-2 py-1 text-[10px] sm:text-[11px] uppercase tracking-wide font-medium shadow-sm">
          {category}
        </span>
      </div>

      {/* Center Play Icon (visible when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Bottom Scrim */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: '35%',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
        }}
      />

      {/* Caption */}
      <div className="absolute bottom-2 left-2 z-20 pointer-events-none pr-10">
        <span className="text-white font-sans font-medium text-[11px] sm:text-[12px] leading-tight line-clamp-2">
          {title}
        </span>
      </div>

      {/* Unmute Icon */}
      {isPlaying && (
        <button
          onClick={toggleMute}
          className="absolute bottom-2 right-2 z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm transition-opacity hover:bg-black/60"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>
      )}
    </div>
  );
};
