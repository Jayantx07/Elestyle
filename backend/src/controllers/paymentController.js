const Order = require('../models/Order');
const pricingService = require('../services/pricingService');
const paymentService = require('../services/paymentService');
const paymentFinalizationService = require('../services/paymentFinalizationService');

exports.createRazorpayOrder = async (req, res) => {
  try {
    const {
      customer,
      shippingAddress,
      billingAddress,
      items,
      couponCode,
      notes,
      shippingAddressId,
      saveAddress
    } = req.body;

    const idempotencyKey = req.headers['idempotency-key'];

    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        if (existingOrder.payment && existingOrder.payment.razorpayOrderId) {
          return res.status(200).json({
            success: true,
            data: {
              orderId: existingOrder.payment.razorpayOrderId,
              amount: existingOrder.grandTotal * 100,
              currency: existingOrder.payment.currency || 'INR',
            }
          });
        }
      }
    }

    const customerId = req.user ? req.user._id : null;

    let finalShippingAddress = shippingAddress;
    let finalBillingAddress = billingAddress;

    if (req.user) {
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
      } 
      else if (saveAddress && shippingAddress) {
        req.user.addresses.forEach(addr => addr.isDefault = false);
        req.user.addresses.push({
          ...shippingAddress,
          isDefault: req.user.addresses.length === 0
        });
        await req.user.save();
      }
    }

    const pricing = await pricingService.calculateOrderTotals(items, couponCode, customerId);

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const orderData = {
      orderNumber,
      customer,
      shippingAddress: finalShippingAddress,
      billingAddress: finalBillingAddress,
      items: pricing.orderItems,
      paymentMethod: 'Razorpay',
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      shipping: pricing.shipping,
      tax: pricing.tax,
      grandTotal: pricing.grandTotal,
      notes,
      idempotencyKey,
      orderStatus: 'pending_payment',
      paymentStatus: 'pending',
      statusHistory: [{ status: 'pending_payment', timestamp: new Date(), note: 'Order created' }],
      payment: {
        provider: 'razorpay',
        status: 'created',
        amount: pricing.grandTotal * 100, // paise
        currency: 'INR'
      }
    };

    if (couponCode) {
      orderData.couponCode = couponCode.toUpperCase();
      orderData.couponId = pricing.appliedCouponId;
    }

    const order = await Order.create(orderData);

    const razorpayOrder = await paymentService.createRazorpayOrder(
      pricing.grandTotal * 100, // paise
      'INR',
      order._id.toString()
    );

    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }
    });

  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey: req.headers['idempotency-key'] });
      if (existingOrder && existingOrder.payment && existingOrder.payment.razorpayOrderId) {
        return res.status(200).json({
          success: true,
          data: {
            orderId: existingOrder.payment.razorpayOrderId,
            amount: existingOrder.grandTotal * 100,
            currency: 'INR',
          }
        });
      }
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification details' });
    }

    const isValid = paymentService.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const order = await Order.findOne({ 'payment.razorpayOrderId': razorpay_order_id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for this payment' });
    }

    const paymentData = {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignatureVerified: true,
      method: 'Razorpay Checkout'
    };

    const result = await paymentFinalizationService.finalizeOrder(order._id, paymentData);

    res.status(200).json({
      success: true,
      message: 'Payment verified and order finalized successfully',
      data: result.order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.retryRazorpayPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user && order.customer.email !== req.user.email && order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this order' });
    }

    if (order.paymentStatus === 'paid' || ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refund_pending', 'refunded'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: `Cannot retry payment for order in ${order.orderStatus} / ${order.paymentStatus} state` });
    }

    // REVALIDATE PRICING
    const pricing = await pricingService.calculateOrderTotals(order.items, order.couponCode, req.user ? req.user._id : null);
    
    if (pricing.grandTotal !== order.grandTotal) {
      if (req.query.confirm !== 'true') {
        return res.status(400).json({ 
          success: false, 
          code: 'PRICE_CHANGED',
          message: 'The price of the items or coupon validity has changed.',
          oldAmount: order.grandTotal,
          newAmount: pricing.grandTotal
        });
      }
      
      // Update order with new pricing details if user confirmed
      order.subtotal = pricing.subtotal;
      order.discount = pricing.discount;
      order.shipping = pricing.shipping;
      order.tax = pricing.tax;
      order.grandTotal = pricing.grandTotal;
      if (order.couponCode && !pricing.appliedCouponId) {
        // Coupon became invalid
        order.couponCode = undefined;
        order.couponId = undefined;
      }
    }

    const razorpayOrder = await paymentService.createRazorpayOrder(
      order.grandTotal * 100, // paise
      'INR',
      order._id.toString()
    );

    // Save attempt history of previous order payment if there was one
    if (order.payment && order.payment.razorpayOrderId) {
      const alreadyExists = order.paymentAttempts.some(a => a.razorpayOrderId === order.payment.razorpayOrderId);
      if (!alreadyExists) {
        order.paymentAttempts.push({
          razorpayOrderId: order.payment.razorpayOrderId,
          razorpayPaymentId: order.payment.razorpayPaymentId,
          status: order.payment.status,
          amount: order.payment.amount,
          currency: order.payment.currency,
          method: order.payment.method,
          failureReason: order.payment.failureReason,
          createdAt: new Date() // approximate for older
        });
      }
    }

    order.payment = {
      provider: 'razorpay',
      status: 'created',
      amount: order.grandTotal * 100,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      razorpaySignatureVerified: false
    };

    order.orderStatus = 'pending_payment';
    order.paymentStatus = 'pending';
    
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderId }).select('paymentStatus orderStatus paymentMethod grandTotal payment createdAt');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        amount: order.grandTotal,
        currency: order.payment?.currency || 'INR',
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
