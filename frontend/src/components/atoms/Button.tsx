import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonShape = 'pill' | 'circle' | 'rounded';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      shape = 'pill',
      isLoading = false,
      className = '',
      style,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Inter 600, uppercase, letter-spacing 1.2px, 13px — applied to all buttons
    const baseClasses =
      'inline-flex items-center justify-center font-sans font-semibold tracking-[0.075em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]';

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'text-[13px] px-4 py-2',
      md: 'text-[13px] px-6 py-3',
      lg: 'text-[13px] px-8 py-4',
    };

    const shapeClasses: Record<ButtonShape, string> = {
      pill: 'rounded-full',
      circle: 'rounded-full aspect-square p-0',
      rounded: 'rounded-lg',
    };

    // Variant-specific classes — primary uses inline style for CSS var colors
    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'text-white',
      secondary: 'bg-charcoal text-white hover:bg-black',
      outline: 'bg-transparent border text-charcoal hover:text-white',
      ghost: 'bg-transparent text-charcoal hover:bg-black/5',
    };

    // Inline styles that reference CSS custom properties for theme-awareness
    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--accent)',
        color: '#fff',
      },
      secondary: {},
      outline: {
        borderColor: 'var(--accent)',
        color: 'var(--accent)',
      },
      ghost: {},
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${shapeClasses[shape]} ${className}`;

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = e.currentTarget;
      if (variant === 'primary') {
        btn.style.backgroundColor = 'var(--accent-hover)';
      } else if (variant === 'outline') {
        btn.style.backgroundColor = 'var(--accent)';
        btn.style.color = '#fff';
      }
      props.onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = e.currentTarget;
      if (variant === 'primary') {
        btn.style.backgroundColor = 'var(--accent)';
      } else if (variant === 'outline') {
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--accent)';
      }
      props.onMouseLeave?.(e);
    };

    return (
      <button
        ref={ref}
        className={combinedClasses.trim()}
        style={{ ...variantStyles[variant], ...style }}
        disabled={disabled || isLoading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

