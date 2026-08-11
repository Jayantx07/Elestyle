const Product = require('../models/Product');
const couponService = require('./couponService');

class PricingService {
  async calculateOrderTotals(items, couponCode, customerId) {
    // items should be array of { product: productId, quantity }
    if (!items || items.length === 0) {
      throw new Error('No order items');
    }

    const cartItems = items.map(i => ({ productId: i.product, quantity: i.quantity }));

    // 1. Validate Coupon & Calculate Authoritative Totals
    let couponResult = null;
    let finalPricing = null;
    let appliedCouponId = null;
    let appliedDiscountAmount = 0;

    if (couponCode) {
      couponResult = await couponService.validateAndCalculate(couponCode, cartItems, customerId);
      if (!couponResult.valid) {
        throw new Error(couponResult.message);
      }
      finalPricing = couponResult.pricing;
      appliedCouponId = couponResult.coupon._id;
      appliedDiscountAmount = finalPricing.discount;
    }

    // 2. Fetch products and calculate fallback subtotal
    const orderItems = [];
    let fallbackSubtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      fallbackSubtotal += product.price * item.quantity;
      
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0]?.secure_url || '',
      });
    }

    // 3. Finalize Pricing
    let subtotal = fallbackSubtotal;
    let discount = 0;
    let shipping = 0; // Default shipping
    let tax = 0;
    let grandTotal = subtotal + shipping + tax;

    if (finalPricing) {
      subtotal = finalPricing.subtotal;
      discount = finalPricing.discount;
      shipping = finalPricing.shippingDiscount === -1 ? 0 : finalPricing.shipping;
      tax = finalPricing.tax;
      grandTotal = finalPricing.grandTotal;
    }

    return {
      orderItems,
      subtotal,
      discount,
      shipping,
      tax,
      grandTotal,
      appliedCouponId,
      appliedDiscountAmount
    };
  }
}

module.exports = new PricingService();
