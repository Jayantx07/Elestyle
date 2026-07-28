import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { FormSelect } from '../components/shared/FormFields';
import { adminOrderService, type AdminOrder } from '../services/orderService';

const ORDER_STATUSES = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancelled', value: 'Cancelled' },
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async (orderId: string) => {
      try {
        setLoading(true);
        const data = await adminOrderService.getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order details', error);
        alert('Error loading order');
        navigate('/admin/orders');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder(id);
  }, [id, navigate]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!order) return;
    const newStatus = e.target.value as AdminOrder['status'];
    try {
      setUpdating(true);
      await adminOrderService.updateOrderStatus(order._id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      <PageHeader
        title={`Order ${order._id}`}
        breadcrumbs={[
          { label: 'Orders', path: '/admin/orders' },
          { label: 'Details' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3 text-center">Qty</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.product.name}</td>
                    <td className="px-6 py-4 text-center">{item.quantity}</td>
                    <td className="px-6 py-4 text-right">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 text-gray-900 font-medium">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right">Subtotal</td>
                  <td className="px-6 py-3 text-right">${order.subtotal?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right">Shipping</td>
                  <td className="px-6 py-3 text-right">${order.shippingCharge?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr className="text-lg">
                  <td colSpan={3} className="px-6 py-4 text-right font-bold">Total</td>
                  <td className="px-6 py-4 text-right font-bold text-primary">${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <FormSelect
                  label=""
                  name="status"
                  value={order.status}
                  onChange={handleStatusChange}
                  options={ORDER_STATUSES}
                  disabled={updating}
                />
              </div>
              {updating && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium text-gray-900">{order.customerName}</p>
              <p>{order.customerEmail}</p>
            </div>
            
            <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Shipping Address</h3>
            {order.shippingAddress ? (
              <div className="space-y-1 text-sm text-gray-600">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No address provided</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <StatusBadge 
                  status={order.paymentStatus === 'Paid' ? 'success' : 'warning'} 
                  label={order.paymentStatus || 'Pending'} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
