const mongoose = require('mongoose');

const couponUsageTrackerSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for atomic usage tracking
couponUsageTrackerSchema.index({ couponId: 1, customerId: 1 }, { unique: true });

module.exports = mongoose.model('CouponUsageTracker', couponUsageTrackerSchema);
