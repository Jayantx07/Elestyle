const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    showInNavbar: {
      type: Boolean,
      default: false,
    },
    showInHomepage: {
      type: Boolean,
      default: false,
    },
    showInCircularCarousel: {
      type: Boolean,
      default: false,
    },
    showInSearch: {
      type: Boolean,
      default: true,
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    // DEPRECATED: Retained for backward compatibility during migration WF-05. Do not delete until Contract phase.
    subCategories: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    schemaVersion: {
      type: Number,
      default: 2,
    },
  },
  { timestamps: true }
);

// Compound indexes for fast storefront menu building and order sorting
categorySchema.index({ isActive: 1, displayOrder: 1 });
categorySchema.index({ isDeleted: 1, displayOrder: 1 });

// Middleware to automatically generate slug ONLY on creation if not provided
categorySchema.pre('save', function () {
  if (this.isNew && !this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Query Middleware for Soft Delete Filtering
categorySchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

categorySchema.pre('countDocuments', function () {
  this.where({ isDeleted: { $ne: true } });
});

categorySchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
