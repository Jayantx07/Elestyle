const Order = require('../models/Order');
const paymentService = require('./paymentService');

class RefundService {
  async processRefund(orderId, amount, reason, adminId = null) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    
    if (!['confirmed', 'processing', 'shipped', 'delivered', 'refund_pending'].includes(order.orderStatus)) {
      throw new Error(`Cannot refund order in ${order.orderStatus} state`);
    }

    if (order.paymentStatus !== 'paid' && order.paymentStatus !== 'partially_refunded' && order.paymentStatus !== 'refund_pending') {
      throw new Error(`Cannot refund payment in ${order.paymentStatus} state`);
    }

    if (!order.payment || !order.payment.razorpayPaymentId) {
      throw new Error('Order has no captured Razorpay payment to refund');
    }

    const capturedAmount = order.payment.amount / 100; // stored in paise, convert to rupees for comparison
    const existingRefundsTotal = order.refunds.reduce((sum, r) => sum + r.amount, 0);
    const maxRefundable = capturedAmount - existingRefundsTotal;

    if (amount <= 0) {
      throw new Error('Refund amount must be greater than zero');
    }

    if (amount > maxRefundable) {
      throw new Error(`Refund amount (${amount}) exceeds maximum refundable amount (${maxRefundable})`);
    }

    // Generate strict idempotency key
    const refundIdempotencyKey = `ref_${order._id}_${Date.now()}`;
    const refundAmountPaise = Math.round(amount * 100);

    try {
      // We pass refundIdempotencyKey in the receipt field to Razorpay for idempotency
      const refundRes = await paymentService.createRefund(
        order.payment.razorpayPaymentId,
        refundAmountPaise,
        { reason },
        refundIdempotencyKey
      );

      // Refund ALWAYS remains pending until webhook processed as per strict WF-08A rules.
      const status = 'pending';

      const refundRecord = {
        refundId: refundRes.id,
        amount,
        status,
        reason,
        idempotencyKey: refundIdempotencyKey,
        createdAt: new Date(),
        processedAt: null,
      };

      order.refunds.push(refundRecord);

      // Adjust overall status explicitly to pending
      order.paymentStatus = 'refund_pending';
      order.orderStatus = 'refund_pending';

      await order.save();
      
      const emailService = require('./emailService');
      await emailService.sendRefundInitiated(order, refundRecord);
      
      const eventService = require('./eventService');
      eventService.dispatchInvalidation('admin', 'orders');
      
      return { success: true, refund: refundRecord, order };
    } catch (error) {
      console.error('Razorpay refund error:', error);
      throw new Error(`Refund processing failed: ${error.message || 'Unknown Razorpay error'}`);
    }
  }

  async syncWebhookRefund(refundEventPayload) {
    // refund.processed or refund.failed
    const razorpayPaymentId = refundEventPayload.payment_id;
    const refundId = refundEventPayload.id;

    const order = await Order.findOne({ 'payment.razorpayPaymentId': razorpayPaymentId });
    if (!order) return;

    let refundRecord = order.refunds.find(r => r.refundId === refundId);
    if (!refundRecord) {
      // External refund or out-of-order execution
      refundRecord = {
        refundId,
        amount: refundEventPayload.amount / 100,
        status: refundEventPayload.status,
        reason: refundEventPayload.notes?.reason || 'External Refund',
        idempotencyKey: refundEventPayload.receipt || `ext_${refundId}`,
        createdAt: new Date(refundEventPayload.created_at * 1000)
      };
      order.refunds.push(refundRecord);
    } else {
      // Transition Guards
      const currentStatus = refundRecord.status;
      const incomingStatus = refundEventPayload.status;

      // Prevent stale regressive transitions
      if (currentStatus === 'processed' && ['created', 'pending', 'failed'].includes(incomingStatus)) {
        console.warn(`[RefundService] Ignoring regressive webhook: ${currentStatus} -> ${incomingStatus}`);
        return;
      }
      
      if (currentStatus === 'failed' && ['created', 'pending'].includes(incomingStatus)) {
        console.warn(`[RefundService] Ignoring regressive webhook: ${currentStatus} -> ${incomingStatus}`);
        return;
      }

      if (currentStatus === incomingStatus) {
        return; // Already processed this state
      }

      refundRecord.status = incomingStatus;
      if (incomingStatus === 'processed') {
        refundRecord.processedAt = new Date();
      }
    }

    // Recompute total refund state
    const capturedAmount = order.payment.amount / 100;
    const processedRefundsTotal = order.refunds
      .filter(r => r.status === 'processed')
      .reduce((sum, r) => sum + r.amount, 0);

    if (processedRefundsTotal >= capturedAmount) {
      order.paymentStatus = 'refunded';
      order.orderStatus = 'refunded';
    } else if (processedRefundsTotal > 0) {
      order.paymentStatus = 'partially_refunded';
      order.orderStatus = 'partially_refunded';
    } else if (order.refunds.some(r => r.status === 'pending' || r.status === 'created')) {
      order.paymentStatus = 'refund_pending';
      order.orderStatus = 'refund_pending';
    } else {
      // All refunds failed? Revert to paid if previously captured
      order.paymentStatus = 'paid';
      // Do not silently overwrite cancelled state if it was a paid cancellation
      if (order.orderStatus === 'refund_pending') {
        // Technically, if refund fails, it stays payable/shippable, but if cancelled, it's problematic. 
        // We leave it as refund_pending for manual intervention or change it to paid to allow re-refunding.
        order.orderStatus = 'processing';
      }
    }

    await order.save();
    
    // Notifications and Sync
    const emailService = require('./emailService');
    const eventService = require('./eventService');
    
    if (refundEventPayload.status === 'processed') {
      await emailService.sendRefundCompleted(order, refundRecord);
    } else if (refundEventPayload.status === 'failed') {
      await emailService.sendRefundFailed(order, refundRecord);
    }
    
    eventService.dispatchInvalidation('admin', 'orders');
  }
}

module.exports = new RefundService();
