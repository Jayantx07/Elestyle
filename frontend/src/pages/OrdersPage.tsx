// @ts-nocheck
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { customerOrderService } from '../services/customerOrderService';
import { StatusBadge } from '../admin/components/shared/StatusBadge';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['myOrders', page],
    queryFn: () => customerOrderService.getMyOrders(page, limit),
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error: {(error as Error).message}</div>;

  const orders = data?.data || [];
  const pagination = data?.pagination;
  const summary = data?.summary || { total: 0, delivered: 0, inShipment: 0, processing: 0 };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-fraunces font-medium text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-2">View and manage your recent orders.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <span className="text-3xl font-bold text-gray-900">{summary.total}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Total Orders</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 flex flex-col justify-center items-center">
          <span className="text-3xl font-bold text-emerald-600">{summary.delivered}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70 mt-1">Delivered</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 flex flex-col justify-center items-center">
          <span className="text-3xl font-bold text-blue-600">{summary.inShipment}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600/70 mt-1">In Shipment</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 flex flex-col justify-center items-center">
          <span className="text-3xl font-bold text-orange-600">{summary.processing}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-600/70 mt-1">Processing</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7h-3m-4 0H4m16 5h-3m-4 0H4m16 5h-3m-4 0H4" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start exploring our collection!</p>
          <Link to="/categories" className="inline-block bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 justify-between items-center transition hover:shadow-md group">
              <div className="flex-1 space-y-3 w-full">
                <div className="flex items-center justify-between md:justify-start gap-4">
                  <h3 className="font-semibold text-lg text-gray-900">Order #{order.orderNumber}</h3>
                  <StatusBadge 
                    status={
                      order.orderStatus === 'delivered' ? 'success' : 
                      ['cancelled', 'payment_failed'].includes(order.orderStatus) ? 'error' : 
                      ['pending_payment', 'refund_pending'].includes(order.orderStatus) ? 'warning' : 'info'
                    } 
                    label={order.orderStatus.replace('_', ' ').toUpperCase()} 
                  />
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-gray-500">
                  <span>{new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(order.createdAt))}</span>
                  <span className="hidden md:inline text-gray-300">•</span>
                  <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  <span className="hidden md:inline text-gray-300">•</span>
                  <span className="font-medium text-gray-900">₹{order.grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <Link 
                  to={`/account/orders/${order._id}`} 
                  className="block w-full md:w-auto text-center bg-gray-50 hover:bg-gray-100 text-gray-900 font-medium px-6 py-3 rounded-xl transition active:scale-95"
                >
                  View Order
                </Link>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl disabled:opacity-50 text-sm font-medium hover:bg-gray-50 transition"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                Page {page} of {pagination.pages}
              </span>
              <button 
                disabled={page === pagination.pages}
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl disabled:opacity-50 text-sm font-medium hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
