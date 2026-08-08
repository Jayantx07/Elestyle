import { apiClient } from '@/lib/apiClient';
export interface AdminAnalytics {
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  topCategories: Array<{
    category: string;
    sales: number;
    percentage: number;
  }>;
  summary: {
    totalRevenueYTD: number;
    averageOrderValue: number;
    conversionRate: number;
  };
}

export const adminAnalyticsService = {
  getAnalytics: async (): Promise<AdminAnalytics> => {
    const res = await apiClient('/api/v1/admin/analytics');
    const json = res;
    return json.data;
  }
};
