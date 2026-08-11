require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');

async function verify() {
  console.log('Connecting to DB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  const invalidStatuses = ['pending_payment', 'payment_failed', 'cancelled'];
  
  // 1. REVENUE VERIFICATION
  const allOrders = await Order.find({});
  console.log(`Total Orders in DB: ${allOrders.length}`);
  
  let manualRevenue = 0;
  let manualValidOrders = 0;
  
  allOrders.forEach(order => {
    if (!invalidStatuses.includes(order.orderStatus)) {
      manualValidOrders++;
      let rawRevenue = order.grandTotal || 0;
      
      let totalRefunds = 0;
      if (order.refunds && Array.isArray(order.refunds)) {
        order.refunds.forEach(r => {
          if (r.status === 'processed' || r.status === 'completed') {
            totalRefunds += (r.amount || 0);
          }
        });
      }
      manualRevenue += (rawRevenue - totalRefunds);
    }
  });

  console.log(`Manual Valid Orders: ${manualValidOrders}`);
  console.log(`Manual Revenue: ${manualRevenue}`);

  // Test Aggregation output
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
  
  let aggTotalOrders = 0;
  let aggTotalRevenue = 0;
  
  if (revenueAgg.length > 0) {
    aggTotalOrders = revenueAgg[0].totalOrders;
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
    aggTotalRevenue = rawRevenue - totalRefunds;
  }
  
  console.log(`Agg Valid Orders: ${aggTotalOrders}`);
  console.log(`Agg Revenue: ${aggTotalRevenue}`);

  // 2. TOP SELLING PRODUCTS
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
  console.log('Top Selling Agg:', topSellingAgg);

  // 3. CUSTOMER COUNT
  const manualCustomerCount = await User.countDocuments({ role: 'customer' });
  console.log(`Customer Count: ${manualCustomerCount}`);

  // 4. PRODUCT COUNT
  const manualProductCount = await Product.countDocuments();
  console.log(`Product Count: ${manualProductCount}`);
  
  // 5. LOW STOCK
  const lowStock = await Product.find({ stock: { $lte: 5 } }).select('_id name stock');
  console.log(`Low Stock count: ${lowStock.length}`);
  
  // 6. RECENT ORDERS
  const recentOrdersRaw = await Order.find({ orderStatus: { $nin: invalidStatuses } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber customer.name createdAt grandTotal orderStatus');
  console.log('Recent Orders:', recentOrdersRaw);

  process.exit(0);
}

verify().catch(console.error);
