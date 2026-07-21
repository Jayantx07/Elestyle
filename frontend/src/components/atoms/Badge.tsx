import React from 'react';

type BadgeVariant = 'solid' | 'outline' | 'overlay';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'solid', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-sans tracking-[0.1em] uppercase font-medium';
  
  const variantClasses: Record<BadgeVariant, string> = {
    solid: 'bg-white text-charcoal shadow-sm',
    outline: 'bg-transparent border border-charcoal text-charcoal',
    overlay: 'bg-white/90 backdrop-blur-sm text-charcoal shadow-sm', // For over images
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
