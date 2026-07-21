import React, { createContext, useContext, useEffect } from 'react';
import type { CategoryThemeKey } from '../config/categoryThemes';

interface ThemeContextValue {
  category: CategoryThemeKey | null;
  setCategory: (key: CategoryThemeKey | null) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  category: null,
  setCategory: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  category?: CategoryThemeKey | null;
}

/**
 * ThemeProvider — wraps the app. When `category` changes, it sets or
 * removes the `data-category` attribute on <html>, which triggers the
 * CSS custom property overrides defined in index.css.
 *
 * The global header, footer, and FAQ must NEVER pass a category —
 * they always render the default :root theme.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  category = null,
}) => {
  const [activeCategory, setActiveCategory] = React.useState<CategoryThemeKey | null>(
    category ?? null
  );

  // Sync external prop changes (e.g., route changes)
  useEffect(() => {
    setActiveCategory(category ?? null);
  }, [category]);

  useEffect(() => {
    const root = document.documentElement;
    if (activeCategory) {
      root.setAttribute('data-category', activeCategory);
    } else {
      root.removeAttribute('data-category');
    }

    return () => {
      // Cleanup on unmount — ensure default theme is restored
      root.removeAttribute('data-category');
    };
  }, [activeCategory]);

  return (
    <ThemeContext.Provider value={{ category: activeCategory, setCategory: setActiveCategory }}>
      {children}
    </ThemeContext.Provider>
  );
};
