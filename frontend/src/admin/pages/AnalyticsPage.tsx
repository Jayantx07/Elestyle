import { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { adminAnalyticsService, type AdminAnalytics } from '../services/analyticsService';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const stats = await adminAnalyticsService.getAnalytics();
      setData(stats);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader title="Business Analytics" />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue YTD</p>
            <p className="text-2xl font-bold text-gray-900">${data.summary.totalRevenueYTD.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Average Order Value</p>
            <p className="text-2xl font-bold text-gray-900">${data.summary.averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900">{data.summary.conversionRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue By Month (Tabular substitute for chart) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Revenue by Month</h2>
          </div>
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3">Month</th>
                <th className="px-6 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.revenueByMonth.map((item, idx) => (
                <tr key={idx} className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.month}</td>
                  <td className="px-6 py-4 text-right">${item.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Sales by Category</h2>
          </div>
          <div className="p-6 space-y-4">
            {data.topCategories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{cat.category}</span>
                  <span className="text-gray-500">${cat.sales.toFixed(2)} ({cat.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
