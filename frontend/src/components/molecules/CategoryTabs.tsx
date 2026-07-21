import React from 'react';

export interface CategoryTabsProps {
  categories: { id: string; label: string }[];
  activeCategoryId: string;
  onSelect: (categoryId: string) => void;
  className?: string;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategoryId,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="inline-flex items-center gap-1 overflow-x-auto scrollbar-hide p-1.5 rounded-full bg-white shadow-sm border border-transparent">
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              aria-current={isActive ? 'true' : undefined}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[13px] font-sans tracking-[0.075em] uppercase font-semibold transition-all duration-300 min-h-[44px] ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'bg-transparent text-gray-500 hover:text-gray-900 border border-transparent hover:bg-gray-50'
              }`}
              style={
                isActive
                  ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }
                  : undefined
              }
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

