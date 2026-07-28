exports.getReviews = async (req, res) => {
  try {
    const reviews = [
      { _id: 'REV-001', product: { _id: 'p1', name: 'Macrame Tote Bag' }, customerName: 'John Doe', rating: 5, comment: 'Absolutely love this bag! Great quality.', status: 'Approved', date: '2026-07-20T10:00:00Z' },
      { _id: 'REV-002', product: { _id: 'p2', name: 'Lavender Soap' }, customerName: 'Jane Smith', rating: 4, comment: 'Smells amazing, but a bit small.', status: 'Pending', date: '2026-07-22T14:30:00Z' },
      { _id: 'REV-003', product: { _id: 'p3', name: 'Silver Earrings' }, customerName: 'Alice Johnson', rating: 1, comment: 'Broke after one use. Horrible.', status: 'Rejected', date: '2026-07-23T09:15:00Z' },
    ];
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    res.status(200).json({ success: true, message: `Review ${status.toLowerCase()}`, data: { _id: req.params.id, status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
