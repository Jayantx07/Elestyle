const mongoose = require('mongoose');

const landingBannerSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Banner category is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [120, 'Banner title must be 120 characters or fewer'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [220, 'Banner subtitle must be 220 characters or fewer'],
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Banner image URL is required'],
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: [true, 'Banner image public ID is required'],
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

landingBannerSchema.index({ isActive: 1, displayOrder: 1 });
landingBannerSchema.index({ category: 1, displayOrder: 1 });

const LandingBanner = mongoose.model('LandingBanner', landingBannerSchema);

module.exports = LandingBanner;