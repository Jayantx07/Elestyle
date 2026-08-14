import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { adminDashboardService } from '../services/dashboardService';

export default function DashboardPage() {
  const { data: stats, isLoading: loading, isError, error: queryError } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminDashboardService.getStats
  });

  const error = isError ? (queryError as Error)?.message || 'Unable to load dashboard data. Please make sure the backend is running.' : null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Overview" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-6 w-6 text-green-600" />} />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingCart className="h-6 w-6 text-blue-600" />} />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={<Users className="h-6 w-6 text-purple-600" />} />
        <StatCard title="Total Products" value={stats.totalProducts} icon={<Package className="h-6 w-6 text-orange-600" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Recent Orders */}
        <div className="xl:col-span-2 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b bg-white hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4">{order.date}</td>
                    <td className="px-6 py-4">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={
                          order.status === 'Delivered' ? 'success' :
                          order.status === 'Shipped' ? 'info' :
                          order.status === 'Cancelled' ? 'error' : 'warning'
                        }
                        label={order.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {/* Low Stock */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Low Stock Alerts
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {stats.lowStockProducts.map((prod) => (
                <li key={prod.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-900 truncate pr-4">{prod.name}</span>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                    {prod.stock} left
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Selling */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Top Selling Products
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {stats.topSellingProducts.map((prod) => (
                <li key={prod.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-900 truncate pr-4">{prod.name}</span>
                  <span className="text-sm text-gray-500">
                    {prod.sales} sales
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Local Component for StatCard
function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <dt>
        <div className="absolute rounded-md bg-gray-50 p-3">
          {icon}
        </div>
        <p className="ml-16 truncate text-sm font-medium text-gray-500">{title}</p>
      </dt>
      <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </dd>
    </div>
  );
}
