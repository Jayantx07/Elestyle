// @ts-nocheck
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { customerOrderService } from '../services/customerOrderService';
import { StatusBadge } from '../admin/components/shared/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { useLiveSync } from '../hooks/useLiveSync';

// Use a global razorpay type to avoid TS errors or install @types/razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CustomerOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [priceChangeWarning, setPriceChangeWarning] = useState<any>(null);
  
  // Setup LiveSync for automatic updates
  useLiveSync();

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ['customerOrder', id],
    queryFn: () => customerOrderService.getOrderDetails(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => customerOrderService.cancelOrder(id!, reason),
    onSuccess: () => {
      setShowCancelPrompt(false);
      queryClient.invalidateQueries({ queryKey: ['customerOrder', id] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
    onError: (err: any) => {
      alert(`Cancel failed: ${err.message || 'Unknown error'}`);
    }
  });

  const retryMutation = useMutation({
    mutationFn: (confirm: boolean) => customerOrderService.retryPayment(id!, confirm),
    onSuccess: (data) => {
      setPriceChangeWarning(null);
      // Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.data.amount,
        currency: data.data.currency,
        name: 'ElleStyle',
        description: `Retry Payment for Order ${order?.orderNumber}`,
        order_id: data.data.orderId,
        handler: async function (response: any) {
          // Normally we'd call verify API here or just wait for webhook
          // Since the original verify API does it, let's call it:
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify(response)
            });
            const verifyData = await res.json();
            if (verifyData.success) {
              queryClient.invalidateQueries({ queryKey: ['customerOrder', id] });
              queryClient.invalidateQueries({ queryKey: ['myOrders'] });
              alert('Payment successful!');
            } else {
              alert('Payment verification failed');
            }
          } catch (err) {
            console.error('Verify error', err);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: '#000000'
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(response.error.description);
        queryClient.invalidateQueries({ queryKey: ['customerOrder', id] });
      });
      rzp.open();
    },
    onError: (err: any) => {
      if (err.code === 'PRICE_CHANGED') {
        setPriceChangeWarning(err);
      } else {
        alert(`Retry failed: ${err.message || 'Unknown error'}`);
      }
    }
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500 pt-32">Loading order details...</div>;
  if (isError || !order) return <div className="p-8 text-center text-red-500 pt-32">Error: {(error as Error)?.message || 'Order not found'}</div>;

  const isCancelable = ['pending_payment', 'confirmed', 'processing'].includes(order.orderStatus);
  const isRetryable = ['pending_payment', 'payment_failed'].includes(order.orderStatus);

  return (
    <div className="min-h-screen pt-32 pb-24 md:pt-40 px-4 md:px-8 bg-[#EAF3EB]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button onClick={() => navigate('/profile')} className="text-sm font-medium text-gray-500 hover:text-black mb-2 inline-flex items-center gap-1">
              &larr; Back to Profile
            </button>
            <h1 className="font-fraunces font-medium text-2xl md:text-4xl text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(order.createdAt))}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'cancelled' ? 'error' : 'warning'} label={order.orderStatus.replace('_', ' ')} />
            <StatusBadge status={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'error' : 'warning'} label={`Payment: ${order.paymentStatus.replace('_', ' ')}`} />
          </div>
        </div>

        {/* Action Bar (Retry/Cancel) */}
        {(isCancelable || isRetryable) && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-3">
            {isRetryable && (
              <button 
                onClick={() => retryMutation.mutate(false)}
                disabled={retryMutation.isPending}
                className="bg-black text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition disabled:opacity-50"
              >
                {retryMutation.isPending ? 'Processing...' : 'Retry Payment'}
              </button>
            )}
            
            {isCancelable && !showCancelPrompt && (
              <button 
                onClick={() => setShowCancelPrompt(true)}
                className="bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-red-50 transition"
              >
                Cancel Order
              </button>
            )}
            
            {showCancelPrompt && (
              <div className="flex-1 min-w-[280px] flex gap-2">
                <input 
                  type="text" 
                  placeholder="Reason for cancellation (optional)" 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm"
                />
                <button 
                  onClick={() => cancelMutation.mutate(cancelReason)}
                  disabled={cancelMutation.isPending}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Cancel
                </button>
                <button 
                  onClick={() => setShowCancelPrompt(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200"
                >
                  Abort
                </button>
              </div>
            )}
          </div>
        )}

        {/* Price Change Warning */}
        {priceChangeWarning && (
          <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl">
            <h3 className="text-orange-800 font-bold mb-2">Price Change Notice</h3>
            <p className="text-sm text-orange-900 mb-4">{priceChangeWarning.message}</p>
            <div className="flex justify-between items-center bg-white p-3 rounded-xl mb-4 border border-orange-100">
              <span className="text-gray-500 line-through">Old Total: ${priceChangeWarning.oldAmount.toFixed(2)}</span>
              <span className="text-lg font-bold text-black">New Total: ${priceChangeWarning.newAmount.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => retryMutation.mutate(true)}
                className="bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-orange-700"
              >
                Accept New Price & Pay
              </button>
              <button 
                onClick={() => setPriceChangeWarning(null)}
                className="bg-white text-gray-700 px-5 py-2 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Shipping Info & Timeline */}
        {(order.shippingInfo || (order.statusHistory && order.statusHistory.length > 0)) && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4">Fulfillment Details</h2>
            {order.shippingInfo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-sm">
                {order.shippingInfo.carrier && (
                  <div>
                    <span className="text-gray-500 block mb-1">Carrier</span>
                    <span className="font-medium text-gray-900">{order.shippingInfo.carrier}</span>
                  </div>
                )}
                {order.shippingInfo.trackingNumber && (
                  <div>
                    <span className="text-gray-500 block mb-1">Tracking Number</span>
                    <span className="font-medium text-gray-900">{order.shippingInfo.trackingNumber}</span>
                  </div>
                )}
                {order.shippingInfo.estimatedDeliveryDate && (
                  <div>
                    <span className="text-gray-500 block mb-1">Est. Delivery</span>
                    <span className="font-medium text-gray-900">{new Date(order.shippingInfo.estimatedDeliveryDate).toLocaleDateString()}</span>
                  </div>
                )}
                {order.shippingInfo.trackingUrl && (
                  <div className="sm:col-span-2">
                    <a href={order.shippingInfo.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg text-black font-medium transition border border-gray-200">
                      Track Shipment &rarr;
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className={order.shippingInfo ? "border-t border-gray-100 pt-6" : ""}>
                <h3 className="text-sm font-semibold mb-4 text-gray-900">Order Timeline</h3>
                <div className="space-y-0">
                  {order.statusHistory.map((history, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-black mt-1"></div>
                        {idx !== order.statusHistory!.length - 1 && <div className="w-px h-10 bg-gray-200 my-1"></div>}
                      </div>
                      <div className={idx !== order.statusHistory!.length - 1 ? "pb-6" : ""}>
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
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Items in Order</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-6 flex gap-4">
                <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.product.images?.[0] || 'https://placehold.co/100x120'} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-medium text-gray-900 line-clamp-1">{item.product.name}</h3>
                  {item.product.sku && <p className="text-xs text-gray-500 mt-1">SKU: {item.product.sku}</p>}
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shipping?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-bold text-gray-900">
                <span>Grand Total</span>
                <span>${order.grandTotal?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* History / Refunds / Attempts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Payment Attempts */}
          {order.paymentAttempts && order.paymentAttempts.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold mb-4">Payment Attempts</h2>
              <div className="space-y-4">
                {order.paymentAttempts.map((attempt, i) => (
                  <div key={i} className="text-sm border-l-2 border-gray-200 pl-3">
                    <p className="font-medium text-gray-900">{attempt.status.toUpperCase()}</p>
                    <p className="text-gray-500">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(attempt.createdAt || new Date()))}</p>
                    {attempt.failureReason && (
                      <p className="text-red-500 text-xs mt-1">Reason: {attempt.failureReason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refunds */}
          {order.refunds && order.refunds.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold mb-4">Refund History</h2>
              <div className="space-y-4">
                {order.refunds.map((refund, i) => (
                  <div key={i} className="text-sm border-l-2 border-gray-200 pl-3">
                    <p className="font-medium text-gray-900">${refund.amount.toFixed(2)} - {refund.status.toUpperCase()}</p>
                    <p className="text-gray-500">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(refund.createdAt))}</p>
                    {refund.reason && (
                      <p className="text-gray-600 text-xs mt-1 italic">"{refund.reason}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}
