const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get logged in user's wishlist
// @route   GET /api/v1/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name slug price compareAtPrice discount images availability isActive isDeleted'
    });
    
    // Filter out deleted/inactive products gracefully
    const validProducts = user.wishlist.filter(p => p && p.isDeleted !== true && p.isActive !== false);

    // If there are stale products, remove them from the DB array asynchronously
    if (validProducts.length !== user.wishlist.length) {
      // Background cleanup: update DB without waiting or failing the current request
      User.updateOne(
        { _id: req.user._id },
        { $set: { wishlist: validProducts.map(p => p._id) } }
      ).catch(err => console.error('Wishlist background cleanup error:', err));
    }

    res.status(200).json({
      success: true,
      data: validProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product || product.isDeleted || product.isActive === false) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    const user = await User.findById(req.user._id);
    
    if (user.wishlist.some(id => id.toString() === productId)) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.user._id);
    
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
