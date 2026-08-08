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
