import { apiClient } from '@/lib/apiClient';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicCategories, type Category } from '../../services/publicCategoryService';

interface CircularCategoryCarouselProps {
  className?: string;
  activeCategorySlug?: string;
}

export const CircularCategoryCarousel: React.FC<CircularCategoryCarouselProps> = ({ 
  className = "w-full pt-28 md:pt-[128px] pb-6",
  activeCategorySlug
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchPublicCategories({ carousel: true }).then((cats) => {
      setCategories(cats);
    });
  }, []);

  return (
    <div
      className={`${className}`}
      style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-start md:justify-center min-w-max mx-auto pb-4 mt-2 md:mt-4">
          {categories.map((category, index) => {
            const isActive = activeCategorySlug === category.slug;
            return (
              <React.Fragment key={category._id}>
                <Link
                  to={`/category/${category.slug}`}
                  className="flex flex-col items-center gap-4 group shrink-0 w-28 md:w-36 px-2"
                  aria-label={`Browse ${category.name}`}
                  data-cursor="explore"
                  data-cursor-text="VIEW"
                >
                  <div 
                    className={`w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-sm transition-all duration-300 ring-2 ring-offset-4 ring-offset-[var(--bg-page)] transition-shadow ${isActive ? 'ring-[#03989E]' : 'ring-transparent group-hover:ring-[var(--accent)] group-hover:shadow-md'}`}
                  >
                    <img
                      src={category.image}
                      alt={`${category.name} category`}
                      className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-105' : 'group-hover:scale-110'}`}
                    />
                  </div>
                  <span
                    className={`font-sans font-semibold text-[13px] md:text-sm text-center leading-tight transition-colors duration-200 ${isActive ? 'text-[#03989E]' : ''}`}
                    style={isActive ? {} : { color: 'var(--text-primary)' }}
                  >
                    {category.name}
                  </span>
                </Link>
                {/* Separator */}
                {index < categories.length - 1 && (
                  <div className="h-20 w-[1px] bg-gray-200 mx-2 md:mx-6 shrink-0 opacity-60" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

