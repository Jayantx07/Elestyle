const mongoose = require('mongoose');

const aboutFeatureHighlightSchema = new mongoose.Schema(
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
      default: 'About feature image',
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
aboutFeatureHighlightSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('AboutFeatureHighlight', aboutFeatureHighlightSchema);
