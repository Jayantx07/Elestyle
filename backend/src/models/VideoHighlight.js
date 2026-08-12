const mongoose = require('mongoose');

const videoHighlightSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // Optional category
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, 'Caption must be 120 characters or fewer'],
      default: '', // Optional title
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    videoPublicId: {
      type: String,
      required: [true, 'Video public ID is required'],
      trim: true,
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true,
    },
    displayOrder: {
      type: Number,
      required: [true, 'Display order is required'],
      min: [0, 'Display order must be 0 or greater'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

videoHighlightSchema.index({ isActive: 1, displayOrder: 1 });
videoHighlightSchema.index({ category: 1, displayOrder: 1 });

const VideoHighlight = mongoose.model('VideoHighlight', videoHighlightSchema);

module.exports = VideoHighlight;
