const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');

class PaymentService {
  constructor() {
    // Only initialize if keys are present (avoids crashing if not configured yet)
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    }
  }

  async createRazorpayOrder(amount, currency, receipt, notes = {}) {
    if (!this.razorpay) throw new Error('Razorpay is not configured');

    const options = {
      amount, // in paise
      currency,
      receipt,
      notes,
      payment_capture: 1, // Automatic capture
    };

    return await this.razorpay.orders.create(options);
  }

  async fetchPayment(paymentId) {
    if (!this.razorpay) throw new Error('Razorpay is not configured');
    return await this.razorpay.payments.fetch(paymentId);
  }

  async fetchOrder(orderId) {
    if (!this.razorpay) throw new Error('Razorpay is not configured');
    return await this.razorpay.orders.fetch(orderId);
  }

  async createRefund(paymentId, amount, notes = {}, refundIdempotencyKey) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    
    if (!refundIdempotencyKey) {
      throw new Error('refundIdempotencyKey is absolutely required for safe refunds');
    }

    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    
    // amount should be in paise
    const payload = {
      amount,
      notes,
      receipt: refundIdempotencyKey // Also pass in receipt as fallback
    };

    try {
      const response = await axios.post(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, payload, {
        headers: {
          'X-Refund-Idempotency': refundIdempotencyKey,
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      // If error is from axios, safely extract it
      if (error.response && error.response.data) {
        const errorDescription = error.response.data.error ? error.response.data.error.description : 'Unknown Razorpay Error';
        throw new Error(errorDescription);
      }
      throw error;
    }
  }

  verifyPaymentSignature(orderId, paymentId, signature) {
    if (!process.env.RAZORPAY_KEY_SECRET) throw new Error('Razorpay secret not configured');

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }

  verifyWebhookSignature(body, signature) {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) throw new Error('Razorpay webhook secret not configured');

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body) // body must be the raw Buffer or string from express.raw
      .digest('hex');

    return expectedSignature === signature;
  }
}

module.exports = new PaymentService();
