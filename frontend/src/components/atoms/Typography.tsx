import React from 'react';

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'subtitle' | 'caption';
type Element = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: Variant;
  as?: Element;
  em?: boolean; // italicized Fraunces accent phrase
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as,
  em = false,
  className = '',
  style,
  children,
  ...props
}) => {
  // Headings: Fraunces 500. Body/UI: Inter.
  const variantClasses: Record<Variant, string> = {
    h1: 'font-fraunces font-medium text-5xl md:text-6xl lg:text-7xl xl:text-[80px] leading-tight tracking-tight',
    h2: 'font-fraunces font-medium text-4xl md:text-5xl lg:text-[56px] leading-tight tracking-tight',
    h3: 'font-fraunces font-medium text-3xl md:text-4xl lg:text-[40px] leading-snug tracking-tight',
    h4: 'font-fraunces font-medium text-2xl md:text-3xl lg:text-[32px] leading-snug',
    h5: 'font-fraunces font-medium text-xl md:text-2xl leading-snug',
    h6: 'font-fraunces font-medium text-lg md:text-xl leading-snug',
    // Functional UI text — always Inter
    body: 'font-sans text-base md:text-lg leading-relaxed',
    subtitle: 'font-sans text-xs md:text-sm font-semibold tracking-[0.18em] uppercase',
    caption: 'font-sans text-sm leading-normal',
  };

  // Color defaults (can be overridden by className)
  const colorDefaults: Partial<Record<Variant, string>> = {
    body: 'text-muted-grey',
    caption: 'text-muted-grey',
    h1: 'text-charcoal',
    h2: 'text-charcoal',
    h3: 'text-charcoal',
    h4: 'text-charcoal',
    h5: 'text-charcoal',
    h6: 'text-charcoal',
  };

  const Component = as || (
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(variant) ? variant : 'p'
  ) as React.ElementType;

  // subtitle always uses var(--accent) to track category theme
  const accentStyle: React.CSSProperties =
    variant === 'subtitle' ? { color: 'var(--accent)', ...style } : (style ?? {});

  let finalClassName = `${variantClasses[variant]} ${colorDefaults[variant] ?? ''} ${className}`;

  if (em) {
    // Italic Fraunces accent — used inside headings for emotional emphasis
    finalClassName = `font-fraunces font-medium italic tracking-normal normal-case ${className}`;
    return (
      <Component
        className={finalClassName.trim()}
        style={{ color: 'var(--accent)', ...style }}
        {...props}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component className={finalClassName.trim()} style={accentStyle} {...props}>
      {children}
    </Component>
  );
};

