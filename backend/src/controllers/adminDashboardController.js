// src/controllers/adminDashboardController.js
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Products
    const totalProducts = await Product.countDocuments();

    // 2. Total Customers (exclude admins if any)
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // 3. Valid Orders Query
    const invalidStatuses = ['pending_payment', 'payment_failed', 'cancelled'];
    
    // 4. Revenue & Order Count Aggregation
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $nin: invalidStatuses } } },
      { $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          grossRevenue: { $sum: '$grandTotal' },
          refunds: { $push: '$refunds' }
        }
      }
    ]);

    let totalOrders = 0;
    let totalRevenue = 0;

    if (revenueAgg.length > 0) {
      totalOrders = revenueAgg[0].totalOrders;
      let rawRevenue = revenueAgg[0].grossRevenue || 0;
      
      let totalRefunds = 0;
      if (revenueAgg[0].refunds && Array.isArray(revenueAgg[0].refunds)) {
         revenueAgg[0].refunds.forEach(orderRefunds => {
           if (Array.isArray(orderRefunds)) {
             orderRefunds.forEach(r => {
               if (r.status === 'processed' || r.status === 'completed') {
                 totalRefunds += (r.amount || 0);
               }
             });
           }
         });
      }
      totalRevenue = rawRevenue - totalRefunds;
      if (totalRevenue < 0) totalRevenue = 0;
    }

    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // 5. Recent Orders
    const recentOrdersRaw = await Order.find({ orderStatus: { $nin: invalidStatuses } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber customer.name createdAt grandTotal orderStatus');
      
    const recentOrders = recentOrdersRaw.map(o => {
      let statusStr = o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1).replace('_', ' ');
      if (o.orderStatus === 'delivered') statusStr = 'Delivered';
      if (o.orderStatus === 'shipped') statusStr = 'Shipped';
      if (o.orderStatus === 'cancelled') statusStr = 'Cancelled';
      
      return {
        id: o.orderNumber,
        customer: o.customer?.name || 'Unknown',
        date: new Intl.DateTimeFormat('en-CA').format(new Date(o.createdAt)),
        total: o.grandTotal,
        status: statusStr
      };
    });

    // 6. Low Stock Products
    const lowStockRaw = await Product.find({ stock: { $lte: 5 } })
      .limit(10)
      .select('_id name stock');
      
    const lowStockProducts = lowStockRaw.map(p => ({
      id: p._id.toString(),
      name: p.name,
      stock: p.stock
    }));

    // 7. Top Selling Products
    const topSellingAgg = await Order.aggregate([
      { $match: { orderStatus: { $nin: invalidStatuses } } },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sales: { $sum: '$items.quantity' }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);
    
    const topSellingProducts = topSellingAgg.map(p => ({
      id: p._id ? p._id.toString() : 'unknown',
      name: p.name,
      sales: p.sales
    }));

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        averageOrderValue,
        recentOrders,
        lowStockProducts,
        topSellingProducts
      }
    });
  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
