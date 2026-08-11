import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { FormSelect, FormInput } from '../components/shared/FormFields';
import { adminOrderService, type AdminOrder } from '../services/orderService';

const VALID_TRANSITIONS: Record<string, string[]> = {
  'pending_payment': ['pending_payment', 'confirmed'],
  'confirmed': ['confirmed', 'processing'],
  'processing': ['processing', 'packed', 'shipped'],
  'packed': ['packed', 'shipped'],
  'shipped': ['shipped', 'delivered'],
  'delivered': ['delivered'],
  'cancelled': ['cancelled'],
  'payment_failed': ['payment_failed'],
  'refund_pending': ['refund_pending'],
  'refunded': ['refunded'],
  'partially_refunded': ['partially_refunded']
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');
  
  const [shippingInfo, setShippingInfo] = useState({
    carrier: '',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDeliveryDate: ''
  });

  useEffect(() => {
    const fetchOrder = async (orderId: string) => {
      try {
        setLoading(true);
        const data = await adminOrderService.getOrderById(orderId);
        setOrder(data);
        if (data.shippingInfo) {
          setShippingInfo({
            carrier: data.shippingInfo.carrier || '',
            trackingNumber: data.shippingInfo.trackingNumber || '',
            trackingUrl: data.shippingInfo.trackingUrl || '',
            estimatedDeliveryDate: data.shippingInfo.estimatedDeliveryDate ? new Date(data.shippingInfo.estimatedDeliveryDate).toISOString().split('T')[0] : ''
          });
        }
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
    if (newStatus === order.status) return;
    
    try {
      setUpdating(true);
      await adminOrderService.updateOrderStatus(order._id, { status: newStatus });
      const updatedOrder = await adminOrderService.getOrderById(order._id);
      setOrder(updatedOrder);
    } catch (error: any) {
      console.error('Failed to update status', error);
      alert(error?.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateShipping = async () => {
    if (!order) return;
    try {
      setUpdating(true);
      await adminOrderService.updateOrderStatus(order._id, { shippingInfo });
      const updatedOrder = await adminOrderService.getOrderById(order._id);
      setOrder(updatedOrder);
      alert('Shipping info updated successfully');
    } catch (error) {
      console.error('Failed to update shipping', error);
      alert('Failed to update shipping info');
    } finally {
      setUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!order || !refundAmount || refundAmount <= 0) return;
    if (!window.confirm(`Are you sure you want to refund $${refundAmount}?`)) return;
    try {
      setUpdating(true);
      const res = await fetch(`http://localhost:5000/api/v1/admin/orders/${order._id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: refundAmount, reason: refundReason })
      });
      const data = await res.json();
      if (data.success) {
        alert('Refund initiated successfully');
        window.location.reload();
      } else {
        alert(data.message || 'Refund failed');
      }
    } catch (err) {
      alert('Error initiating refund');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setUpdating(true);
      const res = await fetch(`http://localhost:5000/api/v1/admin/orders/${order._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();
      if (data.success) {
        alert('Order cancelled successfully');
        window.location.reload();
      } else {
        alert(data.message || 'Cancellation failed');
      }
    } catch (err) {
      alert('Error cancelling order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;

  const availableStatuses = VALID_TRANSITIONS[order.status] || [order.status];
  const statusOptions = availableStatuses.map(s => ({ label: s.replace('_', ' ').toUpperCase(), value: s }));

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      <PageHeader
        title={`Order ${order.orderNumber || order._id}`}
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

          {/* Status History Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                {order.statusHistory.map((history, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                      {idx !== order.statusHistory!.length - 1 && <div className="flex-1 w-0.5 bg-gray-200 my-1"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-900">{history.status.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{new Date(history.timestamp).toLocaleString()}</p>
                      {history.note && <p className="text-sm text-gray-600 mt-1">{history.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  options={statusOptions}
                  disabled={updating}
                />
              </div>
              {updating && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
            </div>
          </div>

          {/* Shipping Information (editable if processing, packed, shipped or delivered) */}
          {['processing', 'packed', 'shipped', 'delivered'].includes(order.status) && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Fulfillment Details</h2>
              <div className="space-y-3">
                <FormInput
                  label="Carrier"
                  name="carrier"
                  value={shippingInfo.carrier}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, carrier: e.target.value })}
                  placeholder="e.g. FedEx, UPS"
                />
                <FormInput
                  label="Tracking Number"
                  name="trackingNumber"
                  value={shippingInfo.trackingNumber}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, trackingNumber: e.target.value })}
                />
                <FormInput
                  label="Tracking URL"
                  name="trackingUrl"
                  value={shippingInfo.trackingUrl}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, trackingUrl: e.target.value })}
                  placeholder="https://..."
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date</label>
                  <input
                    type="date"
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                    value={shippingInfo.estimatedDeliveryDate}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, estimatedDeliveryDate: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleUpdateShipping}
                  disabled={updating}
                  className="w-full bg-black text-white rounded px-4 py-2 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
                >
                  Save Shipping Info
                </button>
              </div>
            </div>
          )}

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
              {order.razorpayOrderId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Razorpay Order ID</span>
                  <span className="font-medium text-gray-900">{order.razorpayOrderId}</span>
                </div>
              )}
              {order.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Razorpay Payment ID</span>
                  <span className="font-medium text-gray-900">{order.razorpayPaymentId}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <StatusBadge 
                  status={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'error' : 'warning'} 
                  label={order.paymentStatus || 'Pending'} 
                />
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          {['pending_payment', 'confirmed', 'processing', 'packed'].includes(order.status) && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
              
              <div className="space-y-4">
                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-sm font-medium mb-2 text-red-600">Cancel Order</h3>
                  <input 
                    type="text" 
                    placeholder="Reason for cancellation" 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 mb-2"
                  />
                  <button 
                    onClick={handleCancel}
                    disabled={updating}
                    className="w-full bg-red-50 text-red-600 border border-red-200 rounded px-4 py-2 text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {['paid', 'partially_refunded'].includes(order.paymentStatus || '') && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="space-y-4">
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2 text-primary">Issue Refund</h3>
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        placeholder="0.00" 
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                        className="w-full text-sm border border-gray-300 rounded pl-7 pr-3 py-2"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Reason" 
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="flex-1 text-sm border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <button 
                    onClick={handleRefund}
                    disabled={updating || !refundAmount}
                    className="w-full bg-black text-white rounded px-4 py-2 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    Process Refund
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
