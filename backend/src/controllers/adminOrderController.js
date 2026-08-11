const Order = require('../models/Order');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    
    // Map to frontend expected shape
    const mapped = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      totalAmount: order.grandTotal,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      date: order.createdAt,
      items: order.items.length
    }));
    
    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const mapped = {
      _id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      shippingAddress: {
        street: order.shippingAddress.addressLine1,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country
      },
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      razorpayOrderId: order.payment?.razorpayOrderId,
      razorpayPaymentId: order.payment?.razorpayPaymentId,
      items: order.items.map(item => ({
        product: { name: item.name, price: item.price },
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: order.subtotal,
      shippingCharge: order.shipping,
      totalAmount: order.grandTotal,
      status: order.orderStatus,
      shippingInfo: order.shippingInfo || {},
      statusHistory: order.statusHistory || [],
      date: order.createdAt
    };

    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const emailService = require('../services/emailService');
  const eventService = require('../services/eventService');
  try {
    const { status, shippingInfo } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const currentStatus = order.orderStatus;

    // Validate Transitions
    const validTransitions = {
      'pending_payment': ['confirmed', 'cancelled', 'payment_failed'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['packed', 'shipped', 'cancelled'], // Allow skipping packed
      'packed': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': [],
      'payment_failed': [],
      'refund_pending': ['refunded', 'partially_refunded'],
      'refunded': [],
      'partially_refunded': ['refunded']
    };

    if (status && status !== currentStatus) {
      const allowedNext = validTransitions[currentStatus] || [];
      if (!allowedNext.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status transition from ${currentStatus} to ${status}` });
      }
      if (status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Use the dedicated cancellation endpoint to cancel orders' });
      }
      
      order.orderStatus = status;
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: `Status updated to ${status} by admin`
      });

      if (status === 'shipped') {
        if (!order.shippingInfo) order.shippingInfo = {};
        order.shippingInfo.shippedAt = new Date();
      } else if (status === 'delivered') {
        if (!order.shippingInfo) order.shippingInfo = {};
        order.shippingInfo.deliveredAt = new Date();
      }
    }

    // Update Shipping Info
    if (shippingInfo) {
      order.shippingInfo = {
        ...order.shippingInfo,
        ...shippingInfo
      };
    }

    await order.save();

    // Trigger emails AFTER successful save
    if (status === 'shipped') {
      await emailService.sendOrderShipped(order);
    } else if (status === 'delivered') {
      await emailService.sendOrderDelivered(order);
    }

    // LiveSync updates for Admin and Customer
    eventService.dispatchInvalidation('admin', 'orders');
    eventService.dispatchInvalidation('orders', order._id.toString());

    res.status(200).json({ success: true, message: 'Order updated successfully', data: order });
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.cancelOrder = async (req, res) => {
  const cancellationService = require('../services/cancellationService');
  try {
    const { reason } = req.body;
    const result = await cancellationService.cancelOrder(req.params.id, reason || 'Cancelled by Admin', req.user?._id);
    res.status(200).json({ success: true, message: 'Order cancelled successfully', data: result.order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.refundOrder = async (req, res) => {
  const refundService = require('../services/refundService');
  try {
    const { amount, reason } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid refund amount is required' });
    const result = await refundService.processRefund(req.params.id, amount, reason || 'Refund issued by Admin', req.user?._id);
    res.status(200).json({ success: true, message: 'Refund initiated successfully', data: result.order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
