import React, { useState } from 'react';

export interface FilterTab {
  id: string;
  label: string;
}

export interface CategoryFilterBarProps {
  tabs: FilterTab[];
  className?: string;
  activeId?: string;
  onChange?: (id: string) => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  tabs,
  className = '',
  activeId,
  onChange,
}) => {
  const [internalActiveId, setInternalActiveId] = useState(tabs[0]?.id ?? 'all');
  const currentActiveId = activeId ?? internalActiveId;

  return (
    <div
      className={`sticky top-16 md:top-20 z-30 w-full py-4 ${className}`}
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Filters Button */}
        <div className="w-full md:w-auto flex justify-start">
          <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-black text-white hover:bg-black/80 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
            <span className="font-sans text-[13px] font-medium tracking-wide">Filters</span>
          </button>
        </div>

        {/* Center: Category Pills */}
        <div
          className="w-full md:w-auto flex items-center gap-2 overflow-x-auto scrollbar-hide"
          role="tablist"
          aria-label="Filter products"
        >
          {tabs.map((tab) => {
            const isActive = currentActiveId === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  if (onChange) onChange(tab.id);
                  setInternalActiveId(tab.id);
                }}
                className={`
                  whitespace-nowrap px-6 py-2 rounded-full
                  text-[13px] font-sans font-medium transition-all duration-300
                `}
                style={
                  isActive
                    ? { backgroundColor: '#000', color: '#fff', border: '1px solid #000' }
                    : {
                        backgroundColor: 'transparent',
                        borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
                        borderWidth: '1px',
                        color: 'var(--accent)',
                      }
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Sort & View Toggle */}
        <div className="w-full md:w-auto flex items-center justify-end gap-6">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[13px]" style={{ color: 'var(--text-secondary)' }}>Sort by:</span>
            <button className="flex items-center gap-1 font-sans text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
              Featured
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border shadow-sm" style={{ borderColor: 'var(--border)' }}>
            <button className="w-7 h-7 rounded flex items-center justify-center bg-black text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-black hover:bg-black/5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
