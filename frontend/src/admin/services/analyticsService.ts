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
    const res = await fetch('/api/v1/admin/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    const json = await res.json();
    return json.data;
  }
};
