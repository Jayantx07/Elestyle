const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Process order checkout
// @route   POST /api/v1/checkout/process
// @access  Public
exports.processOrder = async (req, res) => {
  try {
    const {
      customer,
      shippingAddress,
      billingAddress,
      items, // array of { product: productId, quantity }
      paymentMethod,
      couponCode,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // 1. Verify Stock & calculate subtotal from backend
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      subtotal += product.price * item.quantity;
      
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0]?.secure_url || '',
      });
    }

    // 2. Validate Coupon & calculate totals
    let discount = 0;
    if (couponCode) {
      // In a real app, query Coupon model here and validate
      // Mocking 10% discount for 'DISCOUNT10'
      if (couponCode.toUpperCase() === 'DISCOUNT10') {
        discount = subtotal * 0.1;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid coupon code' });
      }
    }

    const shipping = 0; // Free shipping for now
    const tax = 0; // No tax for now
    const grandTotal = subtotal - discount + shipping + tax;

    // 3. Create Order
    const order = await Order.create({
      customer,
      shippingAddress,
      billingAddress,
      items: orderItems,
      paymentMethod,
      subtotal,
      discount,
      shipping,
      tax,
      grandTotal,
      notes,
      couponCode,
    });

    // 4. Reduce Inventory
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
