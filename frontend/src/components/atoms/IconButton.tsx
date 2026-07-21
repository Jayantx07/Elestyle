import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, isActive = false, size = 'md', className = '', style, ...props }, ref) => {

    const sizeClasses = {
      sm: 'w-11 h-11',
      md: 'w-11 h-11',
      lg: 'w-12 h-12',
    };

    const baseStateClasses = isActive
      ? 'text-white border-transparent'
      : 'bg-white text-charcoal hover:bg-gray-50 shadow-md border border-gray-100';

    const activeStyle: React.CSSProperties = isActive
      ? { backgroundColor: 'var(--accent)', ...style }
      : (style ?? {});

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${baseStateClasses} ${className}`}
        style={activeStyle}
        {...props}
      >
        <span className="flex items-center justify-center pointer-events-none">
          {icon}
        </span>
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

