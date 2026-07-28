exports.getInventory = async (req, res) => {
  try {
    const inventory = [
      { _id: 'INV-001', product: { _id: 'p1', name: 'Macrame Tote Bag', slug: 'macrame-tote-bag' }, stock: 15, status: 'In Stock' },
      { _id: 'INV-002', product: { _id: 'p2', name: 'Lavender Soap', slug: 'lavender-soap' }, stock: 2, status: 'Low Stock' },
      { _id: 'INV-003', product: { _id: 'p3', name: 'Silver Earrings', slug: 'silver-earrings' }, stock: 0, status: 'Out of Stock' },
    ];
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    let status = 'In Stock';
    if (stock === 0) status = 'Out of Stock';
    else if (stock < 5) status = 'Low Stock';
    
    res.status(200).json({ success: true, message: 'Stock updated', data: { _id: req.params.id, stock, status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
