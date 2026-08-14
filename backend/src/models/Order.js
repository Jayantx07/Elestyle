const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    billingAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    items: [orderItemSchema],
    paymentMethod: {
      type: String,
      required: true,
      default: 'Razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refund_pending', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'payment_failed', 'refund_pending', 'refunded', 'partially_refunded'],
      default: 'processing',
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    notes: { type: String },
    couponCode: { type: String },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    shippingInfo: {
      carrier: { type: String },
      trackingNumber: { type: String },
      trackingUrl: { type: String },
      estimatedDeliveryDate: { type: Date },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
      notes: { type: String }
    },
    statusHistory: [{
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String }
    }],
    idempotencyKey: { type: String, unique: true, sparse: true },
    payment: {
      provider: { type: String, default: 'razorpay' },
      status: {
        type: String,
        enum: ['pending', 'created', 'authorized', 'captured', 'failed', 'refund_pending', 'refunded', 'partially_refunded'],
      },
      razorpayOrderId: { type: String, index: true },
      razorpayPaymentId: { type: String, index: true },
      razorpaySignatureVerified: { type: Boolean, default: false },
      amount: Number,
      currency: String,
      method: String,
      capturedAt: Date,
      failedAt: Date,
      failureReason: String,
    },
    paymentAttempts: [{
      razorpayOrderId: String,
      razorpayPaymentId: String,
      status: String,
      amount: Number,
      currency: String,
      method: String,
      failureReason: String,
      failureCode: String,
      failureSource: String,
      failureStep: String,
      createdAt: Date,
      capturedAt: Date
    }],
    refunds: [{
      refundId: { type: String, index: true },
      amount: Number,
      status: String,
      reason: String,
      idempotencyKey: { type: String, index: true },
      createdAt: Date,
      processedAt: Date
    }],
    inventoryDeducted: { type: Boolean, default: false },
    cancelledAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
  }
);

// Auto-generate order number before saving
orderSchema.pre('validate', function() {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
