export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export const subCategoryKeys = {
  all: ['subCategories'] as const,
  lists: () => [...subCategoryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...subCategoryKeys.lists(), { filters }] as const,
  details: () => [...subCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...subCategoryKeys.details(), id] as const,
};

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const landingBannerKeys = {
  all: ['landingBanners'] as const,
  lists: () => [...landingBannerKeys.all, 'list'] as const,
  detail: (id: string) => [...landingBannerKeys.all, 'detail', id] as const,
};

export const couponKeys = {
  all: ['coupons'] as const,
  lists: () => [...couponKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...couponKeys.lists(), { filters }] as const,
  details: () => [...couponKeys.all, 'detail'] as const,
  detail: (id: string) => [...couponKeys.details(), id] as const,
};

export const videoHighlightKeys = {
  all: ['videoHighlights'] as const,
  lists: () => [...videoHighlightKeys.all, 'list'] as const,
  list: (filters: string) => [...videoHighlightKeys.lists(), { filters }] as const,
  details: () => [...videoHighlightKeys.all, 'detail'] as const,
  detail: (id: string) => [...videoHighlightKeys.details(), id] as const,
};

export const featureHighlightKeys = {
  all: ['featureHighlights'] as const,
  lists: () => [...featureHighlightKeys.all, 'list'] as const,
  list: (filters: string) => [...featureHighlightKeys.lists(), { filters }] as const,
  details: () => [...featureHighlightKeys.all, 'detail'] as const,
  detail: (id: string) => [...featureHighlightKeys.details(), id] as const,
};
