const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const refundService = require('./refundService');
const eventService = require('./eventService');

class CancellationService {
  async cancelOrder(orderId, reason, adminId = null) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new Error('Order not found');

      if (['shipped', 'delivered', 'cancelled', 'refund_pending', 'refunded'].includes(order.orderStatus)) {
        throw new Error(`Cannot cancel order in ${order.orderStatus} state`);
      }

      // 1. Restore Inventory if it was deducted
      if (order.inventoryDeducted) {
        for (const item of order.items) {
          const product = await Product.findById(item.product).session(session);
          if (product) {
            product.stock += item.quantity;
            await product.save({ session });
          }
        }
        order.inventoryDeducted = false; // Mark as returned
      }

      // We do NOT restore coupon usage as per business policy (V1).

      order.cancellationReason = reason;
      order.cancelledAt = new Date();

      if (order.paymentStatus === 'paid' && order.payment.provider === 'razorpay') {
        // If it was captured online, it requires a refund.
        // We will transition state to refund_pending, and trigger refund service.
        order.orderStatus = 'refund_pending';
        order.paymentStatus = 'refund_pending';
        await order.save({ session });
        await session.commitTransaction();
        session.endSession();

        // Dispatch Refund Asynchronously to avoid transaction race conditions with external APIs
        try {
          const capturedAmount = order.payment.amount / 100;
          await refundService.processRefund(order._id, capturedAmount, `Order Cancelled: ${reason}`, adminId);
        } catch (refundErr) {
          console.error(`Refund initiation failed for cancelled order ${order._id}:`, refundErr);
        }
      } else {
        // Unpaid online, or COD (which might be unpaid, or we just cancel it).
        // If it was COD, just mark as cancelled.
        order.orderStatus = 'cancelled';
        if (order.paymentStatus !== 'paid') {
          order.paymentStatus = 'failed'; // Or leave as pending. 'failed' is safer.
        }
        await order.save({ session });
        await session.commitTransaction();
        session.endSession();
      }

      eventService.dispatchInvalidation('admin', 'orders');
      eventService.dispatchInvalidation('catalog', 'products');
      
      // Return updated order
      return { success: true, order: await Order.findById(orderId) };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

module.exports = new CancellationService();
