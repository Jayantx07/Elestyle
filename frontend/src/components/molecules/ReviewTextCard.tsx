import React from 'react';
import { Typography } from '../atoms/Typography';
import { Avatar } from '../atoms/Avatar';

export interface ReviewTextCardProps {
  quote: string;
  userName: string;
  userLocation: string;
  userInitials?: string;
  userAvatarSrc?: string;
  /** CSS color value for the avatar background circle. Defaults to var(--accent-gold). */
  avatarBgColor?: string;
  className?: string;
}

export const ReviewTextCard: React.FC<ReviewTextCardProps> = ({
  quote,
  userName,
  userLocation,
  userInitials,
  userAvatarSrc,
  avatarBgColor,
  className = '',
}) => {
  return (
    <div
      className={`rounded-[24px] p-8 md:p-10 shadow-sm flex flex-col justify-between w-[320px] md:w-[480px] h-full ${className}`}
      style={{ backgroundColor: 'white' }}
    >
      <Typography as="p" className="font-fraunces font-medium italic text-lg md:text-xl leading-relaxed mb-8" style={{ color: 'var(--text-primary)' }}>
        “{quote}”
      </Typography>

      <div className="flex items-center gap-4 mt-auto">
        <Avatar
          src={userAvatarSrc}
          initials={userInitials || userName}
          size="sm"
          bgColor={avatarBgColor ?? 'var(--accent-gold)'}
        />
        <div className="flex flex-col">
          <Typography variant="body" className="font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>
            {userName}
          </Typography>
          <Typography variant="subtitle" className="text-[10px] tracking-[0.2em] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {userLocation}
          </Typography>
        </div>
      </div>
    </div>
  );
};
