exports.getCustomers = async (req, res) => {
  try {
    const customers = [
      { _id: 'CUST-001', name: 'John Doe', email: 'john@example.com', totalOrders: 5, totalSpent: 450.50, status: 'Active', joinedAt: '2026-01-15T10:00:00Z' },
      { _id: 'CUST-002', name: 'Jane Smith', email: 'jane@example.com', totalOrders: 2, totalSpent: 120.00, status: 'Active', joinedAt: '2026-03-22T14:30:00Z' },
      { _id: 'CUST-003', name: 'Bob Brown', email: 'bob@example.com', totalOrders: 0, totalSpent: 0, status: 'Blocked', joinedAt: '2026-05-10T09:15:00Z' },
    ];
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = {
      _id: req.params.id,
      name: 'Sample Customer',
      email: 'sample@example.com',
      phone: '+1 234 567 8900',
      totalOrders: 3,
      totalSpent: 250.00,
      status: 'Active',
      joinedAt: '2026-01-15T10:00:00Z',
      addresses: [
        { street: '123 Main St', city: 'Metropolis', state: 'NY', zipCode: '10001', country: 'USA', isDefault: true }
      ],
      recentOrders: [
        { _id: 'ORD-101', date: '2026-07-20T10:00:00Z', totalAmount: 150.00, status: 'Delivered' },
        { _id: 'ORD-095', date: '2026-06-15T14:30:00Z', totalAmount: 100.00, status: 'Delivered' }
      ]
    };
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Active' or 'Blocked'
    res.status(200).json({ success: true, message: `Customer status updated to ${status}`, data: { _id: req.params.id, status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
