// src/controllers/adminDashboardController.js
// This will eventually connect to the DB (Product, Order, User models)
// For now, it returns the structure expected by the frontend.

exports.getDashboardStats = async (req, res) => {
  try {
    // TODO: Replace with real DB queries
    // const totalProducts = await Product.countDocuments();
    // const totalOrders = await Order.countDocuments();
    // const totalRevenue = await Order.aggregate([{ $match: { status: 'Delivered' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts: 124,
        totalOrders: 45,
        totalCustomers: 89,
        totalRevenue: 12500.50,
        recentOrders: [
          { id: 'ORD-001', customer: 'John Doe', date: '2026-07-24', total: 150.00, status: 'Pending' },
          { id: 'ORD-002', customer: 'Jane Smith', date: '2026-07-23', total: 89.99, status: 'Shipped' },
          { id: 'ORD-003', customer: 'Alice Johnson', date: '2026-07-23', total: 299.50, status: 'Delivered' },
        ],
        lowStockProducts: [
          { id: 'PROD-1', name: 'Boho Macrame Bag', stock: 2 },
          { id: 'PROD-2', name: 'Vanilla Scented Candle', stock: 5 },
        ],
        topSellingProducts: [
          { id: 'PROD-3', name: 'Handmade Silver Earrings', sales: 45 },
          { id: 'PROD-4', name: 'Rajasthani Wall Hanging', sales: 32 },
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
