import { apiClient } from '@/lib/apiClient';
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    customer: string;
    date: string;
    total: number;
    status: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
  topSellingProducts: Array<{
    id: string;
    name: string;
    sales: number;
  }>;
}

export const adminDashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient('/api/v1/admin/dashboard');
      const json = response;
      return json.data;
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw error;
    }
  }
};
