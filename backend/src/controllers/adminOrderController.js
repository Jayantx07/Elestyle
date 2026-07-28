exports.getOrders = async (req, res) => {
  try {
    const orders = [
      { _id: 'ORD-001', customerName: 'John Doe', customerEmail: 'john@example.com', totalAmount: 150.00, status: 'Pending', date: '2026-07-24T10:00:00Z', items: 2 },
      { _id: 'ORD-002', customerName: 'Jane Smith', customerEmail: 'jane@example.com', totalAmount: 89.99, status: 'Shipped', date: '2026-07-23T14:30:00Z', items: 1 },
      { _id: 'ORD-003', customerName: 'Alice Johnson', customerEmail: 'alice@example.com', totalAmount: 299.50, status: 'Delivered', date: '2026-07-22T09:15:00Z', items: 4 },
      { _id: 'ORD-004', customerName: 'Bob Brown', customerEmail: 'bob@example.com', totalAmount: 45.00, status: 'Cancelled', date: '2026-07-20T16:45:00Z', items: 1 },
    ];
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = {
      _id: req.params.id,
      customerName: 'Sample Customer',
      customerEmail: 'sample@example.com',
      shippingAddress: {
        street: '123 Main St',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'Credit Card (Stripe)',
      paymentStatus: 'Paid',
      items: [
        { product: { name: 'Boho Macrame Bag', price: 75.00 }, quantity: 1, price: 75.00 },
        { product: { name: 'Lavender Soap', price: 12.50 }, quantity: 2, price: 25.00 }
      ],
      subtotal: 100.00,
      shippingCharge: 10.00,
      totalAmount: 110.00,
      status: 'Pending',
      date: new Date().toISOString()
    };
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Order status updated', data: { _id: req.params.id, status: req.body.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
