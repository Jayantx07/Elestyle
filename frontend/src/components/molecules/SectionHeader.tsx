import React from 'react';
import { Typography } from '../atoms/Typography';

export interface SectionHeaderProps {
  subtitle?: string;
  title: string;
  titleAccent?: string;
  actionText?: string;
  onAction?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  subtitle,
  title,
  titleAccent,
  actionText,
  onAction,
  rightContent,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6 ${className}`}>
      <div className="flex-1">
        {subtitle && (
          <Typography variant="subtitle" className="mb-4 block">
            {subtitle}
          </Typography>
        )}
        <Typography variant="h2" as="h2">
          {title} {titleAccent && <Typography as="span" em style={{ color: 'var(--text-primary)' }}>{titleAccent}</Typography>}
        </Typography>
      </div>
      
      {rightContent ? (
        <div className="font-sans text-sm md:text-base max-w-sm text-right" style={{ color: 'var(--text-secondary)' }}>
          {rightContent}
        </div>
      ) : actionText ? (
        <button
          onClick={onAction}
          className="group flex items-center gap-2 font-sans text-sm tracking-[0.1em] uppercase font-medium text-charcoal hover:text-accent-teal transition-colors focus:outline-none"
        >
          <span>{actionText}</span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transform transition-transform group-hover:translate-x-1"
          >
            <path d="M3.33331 8H12.6666" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round"/>
            <path d="M8 3.33337L12.6667 8.00004L8 12.6667" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </button>
      ) : null}
    </div>
  );
};
