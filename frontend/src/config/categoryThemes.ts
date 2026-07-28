// ============================================================
// CATEGORY THEMES CONFIG
// Single source of truth for all five category pages.
// All hex values come from CSS custom properties — this file
// only stores display data (copy, slugs, image URLs).
// ============================================================

export type CategorySlug =
  | 'macrame-bags'
  | 'handmade-soaps'
  | 'handmade-earrings'
  | 'rajasthani-vibes'
  | 'wedding-giveaway'
  | 'home-furnishing';

export type CategoryThemeKey =
  | 'macrame'
  | 'soaps'
  | 'earrings'
  | 'rajasthani'
  | 'wedding'
  | 'furnishing';

export interface CategoryProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  imageSrc: string;
  altText: string;
}

export interface CategoryReview {
  id: string;
  quote: string;
  userName: string;
  userLocation: string;
  imageSrc: string;
  badge: string;
}

export interface CategoryFilterTab {
  id: string;
  label: string;
}

export interface CategoryTheme {
  slug: CategorySlug;
  themeKey: CategoryThemeKey;
  displayName: string;
  eyebrow: string;          // Uppercase eyebrow label
  heroHeading: string;      // Plain part of H1
  heroHeadingItalic: string; // Italic/em part of H1
  heroDescription: string;
  heroImage: string;        // Hero background or lifestyle image
  filterTabs: CategoryFilterTab[];
  products: CategoryProduct[];
  editorialImage: string;
  editorialHeading: string;
  editorialBody: string;
  reviews: CategoryReview[];
}

// End of interfaces. Data has been moved to individual page components.
