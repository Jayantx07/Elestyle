exports.getAnalytics = async (req, res) => {
  try {
    const analytics = {
      revenueByMonth: [
        { month: 'Jan', revenue: 1200 },
        { month: 'Feb', revenue: 1900 },
        { month: 'Mar', revenue: 1500 },
        { month: 'Apr', revenue: 2200 },
        { month: 'May', revenue: 3100 },
        { month: 'Jun', revenue: 2800 },
        { month: 'Jul', revenue: 3500 },
      ],
      topCategories: [
        { category: 'Macrame Bags', sales: 4500, percentage: 45 },
        { category: 'Handmade Soaps', sales: 3000, percentage: 30 },
        { category: 'Silver Earrings', sales: 2500, percentage: 25 },
      ],
      summary: {
        totalRevenueYTD: 16200,
        averageOrderValue: 85.50,
        conversionRate: 2.4
      }
    };
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
