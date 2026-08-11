const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    maxDiscountAmount: {
      type: Number,
      default: 0, // 0 means no limit
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    
    // Scopes and Exclusions
    applicableCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    excludedCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
    excludedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],

    // Eligibility
    customerEligibility: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    allowGuest: {
      type: Boolean,
      default: true,
    },
    isFirstOrderOnly: {
      type: Boolean,
      default: false,
    },

    // Limits
    maxUsageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    currentUsageCount: {
      type: Number,
      default: 0,
    },
    perCustomerUsageLimit: {
      type: Number,
      default: 1, // Number of times a single user can use it
    },

    // Schedule
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Behavior
    priority: {
      type: Number,
      default: 0,
    },
    stackable: {
      type: Boolean,
      default: false,
    },
    autoApply: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for auto apply and active checks
couponSchema.index({ isActive: 1, autoApply: 1, priority: -1 });

module.exports = mongoose.model('Coupon', couponSchema);
