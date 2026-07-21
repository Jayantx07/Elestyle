import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
  /** CSS color value for the avatar background. Defaults to var(--accent-gold). */
  bgColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  initials,
  size = 'md',
  alt = 'Avatar',
  bgColor,
  className = '',
  style,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  const baseClasses =
    'relative inline-flex items-center justify-center rounded-full overflow-hidden text-white font-sans font-semibold uppercase shrink-0';

  const bgStyle: React.CSSProperties = {
    backgroundColor: bgColor ?? 'var(--accent-gold)',
    ...style,
  };

  return (
    <div
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      style={bgStyle}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{initials?.substring(0, 2) || '?'}</span>
      )}
    </div>
  );
};

