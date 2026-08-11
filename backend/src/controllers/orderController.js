const Order = require('../models/Order');
const cancellationService = require('../services/cancellationService');

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    // Also include pagination support as requested
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { $or: [{ 'customer.email': req.user.email }] };
    if (req.user._id) {
      // If customer field is an ObjectId reference or string
      query.$or.push({ customer: req.user._id });
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Order.countDocuments(query);
    const deliveredCount = await Order.countDocuments({ ...query, orderStatus: 'delivered' });
    const inShipmentCount = await Order.countDocuments({ ...query, orderStatus: 'shipped' });
    const processingCount = await Order.countDocuments({ ...query, orderStatus: { $in: ['processing', 'packed'] } });

    res.status(200).json({ 
      success: true, 
      data: orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      summary: {
        total,
        delivered: deliveredCount,
        inShipment: inShipmentCount,
        processing: processingCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.customer.email !== req.user.email && order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.customer.email !== req.user.email && order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this order' });
    }

    const { reason } = req.body;
    
    const result = await cancellationService.cancelOrder(order._id, reason || 'Cancelled by customer');
    
    res.status(200).json({ success: true, message: 'Order cancelled successfully', data: result.order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
