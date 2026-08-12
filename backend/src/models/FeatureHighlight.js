const mongoose = require('mongoose');

const featureHighlightSchema = new mongoose.Schema(
  {
    imageSrc: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    imagePublicId: {
      type: String,
      required: [true, 'Image public ID is required'],
    },
    altText: {
      type: String,
      default: 'Feature image',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    displayOrder: {
      type: Number,
      required: true,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient public queries and sorting
featureHighlightSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('FeatureHighlight', featureHighlightSchema);
