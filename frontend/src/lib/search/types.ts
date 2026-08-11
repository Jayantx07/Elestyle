export const IntentType = {
  PRODUCT: 'PRODUCT',
  CATEGORY: 'CATEGORY',
  MIXED: 'MIXED',
  NONE: 'NONE'
} as const;

export type IntentType = typeof IntentType[keyof typeof IntentType];

export interface ICategory {
  id: string;
  title: string;
  slug: string;
  description?: string;
  keywords: string[];
  synonyms: string[];
  image?: string;
}

export interface IProduct {
  id: string;
  title: string;
  slug: string;
  category: string; // slug of the category
  description: string;
  price: number;
  images: string[];
  tags: string[];
  searchKeywords: string[];
  synonyms: string[];
  isFeatured?: boolean;
}

export interface SearchResultItem {
  id: string;
  slug?: string;
  type: 'PRODUCT' | 'CATEGORY';
  title: string;
  subtitle?: string;
  image?: string;
  price?: number;
  url: string;
  score: number;
  originalData: any;
  ratingAverage?: number;
  reviewCount?: number;
}

export interface SearchResult {
  query: string;
  intent: IntentType;
  navigationUrl?: string;
  categories: SearchResultItem[];
  products: SearchResultItem[];
  suggestions: string[];
  popularSearches: string[];
}

export interface ISearchProvider {
  search(query: string): Promise<SearchResult>;
  getPopularSearches(): Promise<string[]>;
}
