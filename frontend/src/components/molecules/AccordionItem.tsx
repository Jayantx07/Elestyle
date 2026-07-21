import React, { useState } from 'react';
import { Typography } from '../atoms/Typography';

export interface AccordionItemProps {
  question: string;
  answer: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  question,
  answer,
  defaultOpen = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border-b py-6 ${className}`} style={{ borderColor: 'var(--border)' }}>
      <button
        className="w-full flex justify-between items-center gap-4"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span
          className="text-left transition-colors duration-300 font-sans font-bold text-lg md:text-xl"
          style={isOpen ? { color: 'var(--accent)' } : { color: 'var(--text-primary)' }}
        >
          {question}
        </span>
        <div
          aria-hidden="true"
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
          style={{
            backgroundColor: isOpen ? 'var(--accent)' : 'transparent',
            color: isOpen ? '#fff' : 'var(--text-primary)',
            border: `1px solid ${isOpen ? 'transparent' : 'var(--border)'}`,
          }}
        >
          {isOpen ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-2 pr-16 font-sans text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {answer}
        </div>
      </div>
    </div>
  );
};

