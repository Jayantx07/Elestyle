exports.getSettings = async (req, res) => {
  try {
    const settings = {
      storeName: 'ElleStyle',
      contactEmail: 'admin@elestyle.com',
      contactPhone: '+1 234 567 8900',
      address: '123 Fashion Ave, NY 10001',
      taxRate: 8.5,
      shippingFlatRate: 10.00,
      freeShippingThreshold: 150.00,
      currency: 'USD'
    };
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    // Return the updated settings back
    res.status(200).json({ success: true, message: 'Settings updated successfully', data: req.body });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
