import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicCategories, type Category } from '../../services/publicCategoryService';

export const CircularCategoryCarousel: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchPublicCategories({ carousel: true }).then((cats) => {
      setCategories(cats);
    });
  }, []);

  return (
    <div
      className="w-full pt-28 md:pt-[128px] pb-6"
      style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-start justify-start md:justify-center gap-4 md:gap-8 min-w-max mx-auto pb-4 mt-2 md:mt-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/shop/${category.slug}`}
              className="flex flex-col items-center gap-3 group shrink-0 w-24 md:w-32"
              aria-label={`Browse ${category.name}`}
              data-cursor="explore"
              data-cursor-text="VIEW"
            >
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 ring-2 ring-transparent group-hover:ring-[var(--accent)] transition-shadow">
                <img
                  src={category.image}
                  alt={`${category.name} category`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <span
                className="font-sans font-semibold text-[11px] md:text-sm text-center leading-tight transition-colors duration-200"
                style={{ color: 'var(--text-primary)' }}
              >
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

