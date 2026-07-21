import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, style, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`w-full border rounded-full px-6 py-3 font-sans text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
          style={{
            backgroundColor: 'var(--surface-card)',
            borderColor: error ? undefined : 'var(--border)',
            color: 'var(--text-primary)',
            ...style,
          }}
          {...props}
        />
        {error && (
          <p className="mt-1.5 ml-4 text-xs text-red-500 font-sans">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

