const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const couponService = require('./couponService');
const eventService = require('./eventService');
const emailService = require('./emailService');

class PaymentFinalizationService {
  async finalizeOrder(orderId, paymentData = null) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      
      if (!order) {
        throw new Error('Order not found');
      }

      // 1. Idempotency Check & Strict Guards
      if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus)) {
        await session.abortTransaction();
        session.endSession();
        return { success: true, message: 'Order already finalized', order };
      }

      if (['cancelled', 'refund_pending', 'refunded'].includes(order.orderStatus)) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(`Cannot finalize order in ${order.orderStatus} state`);
      }

      // 2. Validate and Deduct Inventory
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }

        if (product.stock < item.quantity) {
          // Explicit exception path for out of stock after payment
          throw new Error(`INVENTORY_ERROR: Insufficient stock for ${product.name}`);
        }

        product.stock -= item.quantity;
        await product.save({ session });
      }

      // 3. Update Coupon Usage Atomically
      if (order.couponId) {
        // order.customer.email is available, but couponService needs customerId if logged in.
        // We might not have the user ID explicitly on the order model unless we look it up or added it.
        // Let's lookup user by email to get ID if needed, or pass null if guest.
        const User = require('../models/User');
        const user = await User.findOne({ email: order.customer.email }).session(session);
        const customerId = user ? user._id : null;

        await couponService.applyCouponUsage(order.couponId, customerId, order._id, order.discount, session);
        eventService.dispatchInvalidation('catalog', 'coupon', order.couponId);
      }

      // 4. Update Order and Payment Status
      order.orderStatus = 'processing'; // Finalized state
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({ status: 'processing', timestamp: new Date(), note: 'Payment finalized' });
      if (paymentData) {
        order.paymentStatus = 'paid';
        order.payment = {
          ...order.payment,
          ...paymentData,
          status: 'captured',
          capturedAt: new Date()
        };
      } else {
        // COD path
        order.paymentStatus = 'pending'; // Not paid yet for COD
      }

      order.inventoryDeducted = true;
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      // 5. Post-transaction Side Effects
      // Send Email
      try {
        await emailService.sendOrderConfirmation(order);
      } catch (emailErr) {
        console.error('Failed to send order confirmation email:', emailErr);
      }

      // Dispatch LiveSync events
      eventService.dispatchInvalidation('admin', 'orders');
      eventService.dispatchInvalidation('catalog', 'products');

      return { success: true, order };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      // Handle explicit inventory exception
      if (error.message.startsWith('INVENTORY_ERROR:')) {
        // We still need to record the payment if it succeeded, but mark order as failed/requires refund.
        if (paymentData) {
          try {
            await Order.findByIdAndUpdate(orderId, {
              orderStatus: 'payment_failed', // or a specific 'inventory_failed' state
              paymentStatus: 'paid',
              'payment.status': 'captured',
              'payment.failureReason': error.message,
              ...paymentData
            });
            // Also push to payment attempts? Handled by the controller mostly, but we can just leave it as is.
          } catch (updateErr) {
            console.error('Failed to update order state after inventory error', updateErr);
          }
        }
      }

      throw error;
    }
  }

  async handlePaymentFailure(orderId, failureData) {
    const order = await Order.findById(orderId);
    if (!order) return;

    if (['confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refund_pending', 'refunded'].includes(order.orderStatus)) {
      return; // Already paid/finalized or cancelled, ignore failure
    }

    order.orderStatus = 'payment_failed';
    order.paymentStatus = 'failed';
    if (order.payment) {
      order.payment.status = 'failed';
      order.payment.failedAt = new Date();
      order.payment.failureReason = typeof failureData === 'string' ? failureData : failureData.description;
    }
    
    if (typeof failureData === 'object') {
      order.paymentAttempts.push({
        razorpayOrderId: failureData.order_id,
        razorpayPaymentId: failureData.payment_id,
        status: 'failed',
        failureReason: failureData.description,
        failureCode: failureData.code,
        failureSource: failureData.source,
        failureStep: failureData.step,
        createdAt: new Date()
      });
    }

    await order.save();
    eventService.dispatchInvalidation('admin', 'orders');
  }
}

module.exports = new PaymentFinalizationService();
