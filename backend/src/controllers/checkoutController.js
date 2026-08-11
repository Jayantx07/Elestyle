const Order = require('../models/Order');
const pricingService = require('../services/pricingService');
const paymentFinalizationService = require('../services/paymentFinalizationService');

// @desc    Process order checkout
// @route   POST /api/v1/checkout/process
// @access  Public
exports.processOrder = async (req, res) => {
// Removed inline transaction setup here, as the finalization service handles it.

  try {
    const {
      customer,
      shippingAddress,
      billingAddress,
      items, // array of { product: productId, quantity }
      paymentMethod,
      couponCode,
      notes,
      shippingAddressId,
      saveAddress
    } = req.body;

    const idempotencyKey = req.headers['idempotency-key'];

    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        if (items && items.length !== existingOrder.items.length) {
          return res.status(409).json({
            success: false,
            message: 'Idempotency conflict: The payload does not match the originally submitted request for this key.',
          });
        }
        return res.status(200).json({
          success: true,
          message: 'Order already processed',
          data: existingOrder,
        });
      }
    }

    const customerId = req.user ? req.user._id : null;

    let finalShippingAddress = shippingAddress;
    let finalBillingAddress = billingAddress;

    if (req.user) {
      // 1. Resolve shippingAddressId from req.user
      if (shippingAddressId) {
        const savedAddress = req.user.addresses.id(shippingAddressId);
        if (!savedAddress) {
          return res.status(403).json({ success: false, message: 'Invalid or unauthorized shipping address ID' });
        }
        finalShippingAddress = {
          addressLine1: savedAddress.addressLine1,
          addressLine2: savedAddress.addressLine2,
          city: savedAddress.city,
          state: savedAddress.state,
          postalCode: savedAddress.postalCode,
          country: savedAddress.country,
        };
        // Assuming billing is same as shipping if it matches shippingAddress object structure, 
        // but frontend handles sameAsShipping by copying it. So billing address should just follow whatever frontend sent or billingAddressId if we had it.
      } 
      // 2. Save new address if requested
      else if (saveAddress && shippingAddress) {
        req.user.addresses.forEach(addr => addr.isDefault = false); // optionally make it default or not
        req.user.addresses.push({
          ...shippingAddress,
          isDefault: req.user.addresses.length === 0 // Make default if it's the first one
        });
        await req.user.save();
      }
    }

    // 1. Calculate authoritative totals
    const pricing = await pricingService.calculateOrderTotals(items, couponCode, customerId);

    // 2. Create Order (Intent)
    const orderData = {
      orderNumber: `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customer,
      shippingAddress: finalShippingAddress,
      billingAddress: finalBillingAddress,
      items: pricing.orderItems,
      paymentMethod,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      shipping: pricing.shipping,
      tax: pricing.tax,
      grandTotal: pricing.grandTotal,
      notes,
      idempotencyKey,
      orderStatus: 'pending_payment',
      paymentStatus: 'pending',
      statusHistory: [{ status: 'pending_payment', timestamp: new Date(), note: 'Order created' }]
    };

    if (couponCode) {
      orderData.couponCode = couponCode.toUpperCase();
      orderData.couponId = pricing.appliedCouponId;
    }

    // For Razorpay or other online gateways, we don't finalize yet if this endpoint is ever called.
    // However, frontend will call paymentController for Razorpay.
    // This checkoutController endpoint will now act as the COD endpoint primarily.
    let order = await Order.create(orderData);

    // If COD, finalize immediately
    if (paymentMethod === 'Cash on Delivery') {
      const finalizationResult = await paymentFinalizationService.finalizeOrder(order._id);
      order = finalizationResult.order;
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey: req.headers['idempotency-key'] });
      return res.status(200).json({
        success: true,
        message: 'Order already processed (caught race condition)',
        data: existingOrder,
      });
    }

    res.status(400).json({ success: false, message: error.message });
  }
};
