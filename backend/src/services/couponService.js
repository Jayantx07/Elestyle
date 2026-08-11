const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const CouponRedemption = require('../models/CouponRedemption');
const Order = require('../models/Order');
const User = require('../models/User');
const CouponUsageTracker = require('../models/CouponUsageTracker');
const mongoose = require('mongoose');

class CouponService {
  async validateAndCalculate(couponCode, cartItems, customerId) {
    // 1. Fetch Coupon
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) return { valid: false, message: 'Invalid coupon code' };
    
    // 2. Validate basics
    if (!coupon.isActive) return { valid: false, message: 'Coupon is not active' };
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) return { valid: false, message: 'Coupon is not yet active' };
    if (coupon.expiryDate && now > coupon.expiryDate) return { valid: false, message: 'Coupon has expired' };

    // 3. Validate Guest/Customer Eligibility
    if (!customerId && !coupon.allowGuest) return { valid: false, message: 'This coupon requires you to be logged in' };
    if (coupon.customerEligibility && coupon.customerEligibility.length > 0) {
      if (!customerId) return { valid: false, message: 'You are not eligible for this coupon' };
      const isEligible = coupon.customerEligibility.some(id => String(id) === String(customerId));
      if (!isEligible) return { valid: false, message: 'You are not eligible for this coupon' };
    }

    // 4. Validate First-Order Constraints
    if (coupon.isFirstOrderOnly) {
      if (!customerId) return { valid: false, message: 'First-order coupons require you to be logged in' };
      const user = await User.findById(customerId);
      if (!user) return { valid: false, message: 'Customer account not found' };
      
      const previousOrderCount = await Order.countDocuments({
        'customer.email': user.email,
        orderStatus: { $nin: ['cancelled', 'failed'] }
      });
      
      if (previousOrderCount > 0) {
        return { valid: false, message: 'This coupon is only valid for your first order' };
      }
    }

    // 5. Validate Usage Limits
    if (coupon.maxUsageLimit !== null && coupon.currentUsageCount >= coupon.maxUsageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }
    
    if (customerId && coupon.perCustomerUsageLimit > 0) {
      const redemptions = await CouponRedemption.countDocuments({ couponId: coupon._id, customerId });
      if (redemptions >= coupon.perCustomerUsageLimit) {
        return { valid: false, message: 'You have reached the maximum usage limit for this coupon' };
      }
    }

    // 5. Fetch authoritative products and calculate subtotal
    let subtotal = 0;
    const itemsData = [];
    
    for (const item of cartItems) {
      // Validate item.productId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(item.productId)) continue;

      const product = await Product.findById(item.productId);
      if (!product) continue;
      
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      
      itemsData.push({
        product,
        quantity: item.quantity,
        price: product.price,
        itemTotal
      });
    }

    if (itemsData.length === 0) return { valid: false, message: 'Cart is empty or contains invalid products' };

    // 6. Minimum Order Value
    if (coupon.minPurchaseAmount > 0 && subtotal < coupon.minPurchaseAmount) {
      return { valid: false, message: `Minimum order value of $${coupon.minPurchaseAmount.toFixed(2)} is required` };
    }

    // 7. Calculate Eligible Subtotal
    let eligibleSubtotal = 0;
    let hasEligibleItems = false;
    
    for (const item of itemsData) {
      const p = item.product;
      let isEligible = true;

      if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
        if (coupon.excludedProducts.some(id => String(id) === String(p._id))) isEligible = false;
      }
      if (coupon.excludedCategories && coupon.excludedCategories.length > 0) {
        if (coupon.excludedCategories.some(id => String(id) === String(p.category))) isEligible = false;
      }

      const hasProductInclusions = coupon.applicableProducts && coupon.applicableProducts.length > 0;
      const hasCategoryInclusions = coupon.applicableCategories && coupon.applicableCategories.length > 0;
      
      if (isEligible && (hasProductInclusions || hasCategoryInclusions)) {
        let matchesProduct = false;
        let matchesCategory = false;
        
        if (hasProductInclusions) {
          matchesProduct = coupon.applicableProducts.some(id => String(id) === String(p._id));
        }
        if (hasCategoryInclusions) {
          matchesCategory = coupon.applicableCategories.some(id => String(id) === String(p.category));
        }
        
        isEligible = matchesProduct || matchesCategory;
      }

      if (isEligible) {
        eligibleSubtotal += item.itemTotal;
        hasEligibleItems = true;
      }
    }

    if (!hasEligibleItems) {
      return { valid: false, message: 'No eligible items in cart for this coupon' };
    }

    // 8. Calculate Discount
    let discount = 0;
    let shippingDiscount = 0;

    if (coupon.discountType === 'percentage') {
      discount = eligibleSubtotal * (coupon.discountValue / 100);
      if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
      if (discount > eligibleSubtotal) discount = eligibleSubtotal; 
    } else if (coupon.discountType === 'free_shipping') {
      shippingDiscount = -1; // Flag for checkout to apply 0 shipping
    }

    const shipping = 0; // Replace with real shipping calc later
    const tax = 0;      // Replace with real tax calc later
    const grandTotal = subtotal - discount + shipping + tax;

    return {
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        type: coupon.discountType,
      },
      pricing: {
        subtotal,
        discount,
        shippingDiscount,
        shipping,
        tax,
        grandTotal: Math.max(0, grandTotal)
      }
    };
  }

  async findBestAutoApplyCoupon(cartItems, customerId) {
    if (!cartItems || cartItems.length === 0) return null;

    // Fetch all active auto-apply coupons, sorted by priority (descending) and createdAt (ascending for deterministic tie-breaking)
    const candidates = await Coupon.find({
      isActive: true,
      autoApply: true,
    }).sort({ priority: -1, createdAt: 1 });

    let bestResult = null;

    for (const candidate of candidates) {
      const result = await this.validateAndCalculate(candidate.code, cartItems, customerId);
      
      if (result.valid) {
        // If we found one, since they are sorted by priority, we can return the first valid one if we trust priority solely.
        // Or we could compare discounts. The prompt says: "use priority. If equal priority: use a deterministic tie-breaker."
        // Since we sort by priority -1, the first valid coupon IS the highest priority.
        return {
          code: candidate.code,
          ...result
        };
      }
    }

    return null;
  }

  async getEligibleCoupons(customerId) {
    const now = new Date();
    
    // Find active coupons that are currently valid or have no dates
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ startDate: null }, { startDate: { $lte: now } }],
      $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }]
    }).sort({ createdAt: -1 });

    const eligibleCoupons = [];

    for (const coupon of coupons) {
      // 1. Guest/Customer restriction
      if (!customerId && !coupon.allowGuest) continue;

      // 2. Customer specific eligibility
      if (coupon.customerEligibility && coupon.customerEligibility.length > 0) {
        if (!customerId) continue;
        const isEligible = coupon.customerEligibility.some(id => String(id) === String(customerId));
        if (!isEligible) continue;
      }

      // 3. First order constraint
      if (coupon.isFirstOrderOnly && customerId) {
        const user = await User.findById(customerId);
        if (user) {
          const previousOrderCount = await Order.countDocuments({
            'customer.email': user.email,
            orderStatus: { $nin: ['cancelled', 'failed'] }
          });
          if (previousOrderCount > 0) continue;
        } else {
          continue;
        }
      } else if (coupon.isFirstOrderOnly && !customerId) {
        continue; // First order requires login to verify
      }

      // 4. Global usage limit
      if (coupon.maxUsageLimit !== null && coupon.currentUsageCount >= coupon.maxUsageLimit) {
        continue;
      }

      // 5. Per-customer usage limit
      if (customerId && coupon.perCustomerUsageLimit > 0) {
        const redemptions = await CouponRedemption.countDocuments({ couponId: coupon._id, customerId });
        if (redemptions >= coupon.perCustomerUsageLimit) {
          continue;
        }
      }

      eligibleCoupons.push(coupon);
    }

    return eligibleCoupons;
  }

  async applyCouponUsage(couponId, customerId, orderId, discountAmount, session) {
    const updateResult = await Coupon.findOneAndUpdate(
      {
        _id: couponId,
        $or: [
          { maxUsageLimit: null },
          { $expr: { $lt: ["$currentUsageCount", "$maxUsageLimit"] } }
        ]
      },
      { $inc: { currentUsageCount: 1 } },
      { session, new: true }
    );

    if (!updateResult) {
      throw new Error('COUPON_USAGE_LIMIT_REACHED');
    }

    if (customerId) {
      if (updateResult.perCustomerUsageLimit > 0) {
        // Atomic per-customer usage tracking
        const tracker = await CouponUsageTracker.findOneAndUpdate(
          { couponId, customerId },
          { $setOnInsert: { couponId, customerId, usageCount: 0 } },
          { session, upsert: true, new: true }
        );

        const trackerUpdate = await CouponUsageTracker.findOneAndUpdate(
          { 
            _id: tracker._id,
            $expr: { $lt: ["$usageCount", updateResult.perCustomerUsageLimit] }
          },
          { $inc: { usageCount: 1 } },
          { session, new: true }
        );

        if (!trackerUpdate) {
           throw new Error('CUSTOMER_USAGE_LIMIT_REACHED');
        }
      }

      await CouponRedemption.create([{
        couponId,
        customerId,
        orderId,
        discountAmount
      }], { session });
    }
  }
}

module.exports = new CouponService();
