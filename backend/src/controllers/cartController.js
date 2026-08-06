const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper function to deduplicate items in a cart document
const deduplicateCart = async (cart) => {
  if (!cart || !cart.items || cart.items.length <= 1) return cart;
  
  let hasDuplicates = false;
  const uniqueItemsMap = {};
  
  for (const item of cart.items) {
    if (!item.product || !mongoose.Types.ObjectId.isValid(String(item.product._id || item.product))) {
      hasDuplicates = true; // Flag to filter out null or invalid product references
      continue;
    }
    const pId = String(item.product._id || item.product);
    if (uniqueItemsMap[pId]) {
      uniqueItemsMap[pId].quantity += (item.quantity || 1);
      hasDuplicates = true;
    } else {
      uniqueItemsMap[pId] = {
        product: item.product,
        quantity: item.quantity || 1,
        price: item.price || 0
      };
    }
  }

  if (hasDuplicates) {
    cart.items = Object.values(uniqueItemsMap);
    await cart.save();
  }
  return cart;
};


// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    } else {
      cart = await deduplicateCart(cart);
    }

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images description category slug'
    });

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, price } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Step 1: Try to increment if it already exists
    let cart = await Cart.findOneAndUpdate(
      { user: req.user._id, 'items.product': productId },
      { $inc: { 'items.$.quantity': quantity || 1 } },
      { returnDocument: 'after' }
    );

    // Step 2: If it didn't exist in items, try to push to existing cart
    if (!cart) {
      cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $push: { items: { product: productId, quantity: quantity || 1, price: price || product.price } } },
        { returnDocument: 'after' }
      );
    }

    // Step 3: If cart doesn't exist at all, create it
    if (!cart) {
      try {
        cart = await Cart.create({
          user: req.user._id,
          items: [{ product: productId, quantity: quantity || 1, price: price || product.price }]
        });
      } catch (createErr) {
        // Handle duplicate key error if another concurrent request just created it
        if (createErr.code === 11000) {
          cart = await Cart.findOneAndUpdate(
            { user: req.user._id },
            { $push: { items: { product: productId, quantity: quantity || 1, price: price || product.price } } },
            { returnDocument: 'after' }
          );
        } else {
          throw createErr;
        }
      }
    }

    // Deduplicate just in case
    cart = await deduplicateCart(cart);

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images description category slug'
    });

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // First deduplicate to make index math safe
    cart = await deduplicateCart(cart);

    const itemIndex = cart.items.findIndex(item => item.product && String(item.product._id || item.product) === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
    } else {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images description category slug'
    });

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.product && String(item.product._id || item.product) !== productId);
    await cart.save();

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images description category slug'
    });

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Merge local cart with DB cart on login
// @route   POST /api/cart/merge
// @access  Private
exports.mergeCart = async (req, res) => {
  try {
    const { localItems } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    } else {
      cart = await deduplicateCart(cart);
    }

    if (localItems && Array.isArray(localItems) && localItems.length > 0) {
      for (const item of localItems) {
        const idStr = String(item.id || '');
        if (!idStr || !mongoose.Types.ObjectId.isValid(idStr)) {
          console.warn(`[Cart] Skipping merge of non-ObjectId localStorage item: "${idStr}"`);
          continue;
        }

        const itemIndex = cart.items.findIndex(ci => ci && ci.product && String(ci.product._id || ci.product) === idStr);
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += (item.quantity || 1);
        } else {
          cart.items.push({ 
            product: idStr, 
            quantity: item.quantity || 1, 
            price: item.price || 0 
          });
        }
      }
      await cart.save();
    }
    
    cart = await deduplicateCart(cart);

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images description category slug'
    });

    // Automatically remove cart items where the product was deleted from DB
    if (cart && cart.items && cart.items.some(i => !i.product)) {
      cart.items = cart.items.filter(i => i.product);
      await cart.save();
    }

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error('Cart merge error:', err);
    res.status(500).json({ success: false, message: 'Server Error during cart merge', error: err.message });
  }
};

