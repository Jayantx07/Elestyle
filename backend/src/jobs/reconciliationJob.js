const Order = require('../models/Order');
const CronJobState = require('../models/CronJobState');
const paymentService = require('../services/paymentService');
const paymentFinalizationService = require('../services/paymentFinalizationService');

class ReconciliationJob {
  constructor() {
    this.jobId = 'payment-reconciliation-job';
    this.lockDurationMs = 5 * 60 * 1000; // 5 minutes
    this.intervalId = null;
  }

  start(intervalMs = 10 * 60 * 1000) { // Default every 10 mins
    this.intervalId = setInterval(() => this.run(), intervalMs);
    // Also run immediately on startup after a small delay
    setTimeout(() => this.run(), 30000);
    console.log(`[ReconciliationJob] Scheduled to run every ${intervalMs / 1000} seconds`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async acquireLock() {
    const now = new Date();
    const lockExpiry = new Date(now.getTime() - this.lockDurationMs);

    // Ensure the document exists before attempting to lock it
    try {
      await CronJobState.create({ jobId: this.jobId });
    } catch (err) {
      // Ignore E11000 (duplicate key) errors, as it means the job state already exists
      if (err.code !== 11000) throw err;
    }

    const lock = await CronJobState.findOneAndUpdate(
      {
        jobId: this.jobId,
        $or: [
          { lockedAt: null }, // not locked
          { lockedAt: { $lt: lockExpiry } } // lock expired
        ]
      },
      {
        $set: {
          lockedAt: now,
          lockedBy: `process-${process.pid}`,
          lastStatus: 'running'
        }
      },
      { returnDocument: 'after' }
    );

    return !!(lock && lock.lockedAt && lock.lockedAt.getTime() === now.getTime());
  }

  async releaseLock(status, error = null) {
    await CronJobState.findOneAndUpdate(
      { jobId: this.jobId },
      {
        $set: {
          lockedAt: null,
          lockedBy: null,
          lastFinishedAt: new Date(),
          lastStatus: status,
          lastError: error
        }
      }
    );
  }

  async run() {
    try {
      const locked = await this.acquireLock();
      if (!locked) {
        return; // Another instance is running
      }

      console.log('[ReconciliationJob] Started processing stale orders...');
      
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      // Find orders that are pending_payment and created > 30 mins ago
      const staleOrders = await Order.find({
        orderStatus: 'pending_payment',
        createdAt: { $lt: thirtyMinsAgo }
      }).limit(50); // Process in batches

      for (const order of staleOrders) {
        try {
          if (!order.payment || !order.payment.razorpayOrderId) {
            // No Razorpay Order ID. It's truly abandoned or COD that never finalized (which shouldn't happen).
            order.orderStatus = 'payment_failed';
            order.paymentStatus = 'failed';
            if (order.payment) {
              order.payment.status = 'failed';
              order.payment.failureReason = 'Abandoned Checkout';
            }
            await order.save();
            continue;
          }

          // Query Razorpay
          const razorpayOrder = await paymentService.fetchOrder(order.payment.razorpayOrderId);
          
          if (razorpayOrder.status === 'paid') {
            // Find the successful payment
            // We need the payment ID. Unfortunately Razorpay Order API fetch doesn't return the payment directly.
            // We can fetch payments for this order if needed, but Razorpay Orders API returns `payments` or we use fetchOrderPayments.
            // Wait, paymentService doesn't have fetchOrderPayments.
            // Let's just mark it paid and use the generic finalizer without razorpayPaymentId if not available,
            // OR fetch payments for order.
            console.log(`[ReconciliationJob] Order ${order._id} paid but not finalized. Needs manual attention or fetch payments API.`);
            // For safety, we just log it and maybe alert admins. The webhook should have caught it.
            // If we really want to auto-recover, we need this.razorpay.orders.fetchPayments(orderId) in paymentService.
          } else {
            // It's created or attempted but failed
            order.orderStatus = 'payment_failed';
            order.paymentStatus = 'failed';
            order.payment.status = 'failed';
            order.payment.failureReason = 'Reconciled: Payment never completed';
            await order.save();
          }
        } catch (orderErr) {
          console.error(`[ReconciliationJob] Error processing order ${order._id}:`, orderErr);
        }
      }

      console.log(`[ReconciliationJob] Finished processing ${staleOrders.length} orders.`);
      await this.releaseLock('success');
    } catch (error) {
      console.error('[ReconciliationJob] Global Error:', error);
      await this.releaseLock('failed', error.message);
    }
  }
}

module.exports = new ReconciliationJob();
