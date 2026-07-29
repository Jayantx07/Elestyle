const mongoose = require('mongoose');
const Product = require('./Product');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product.'],
    },
    customerName: {
      type: String,
      required: [true, 'Please provide your name.'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Please provide your email.'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Review must have a rating.'],
    },
    comment: {
      type: String,
      required: [true, 'Review must have a comment.'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'spam'],
      default: 'pending',
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      default: [],
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

// Calculate average ratings when a review is created or updated
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId, status: 'approved' },
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      reviewCount: stats[0].nRating,
      ratingAverage: Math.round(stats[0].avgRating * 10) / 10,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      reviewCount: 0,
      ratingAverage: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.product);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
