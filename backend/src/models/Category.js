const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Middleware to automatically generate slug ONLY on creation if not provided
categorySchema.pre('save', function () {
  if (this.isNew && !this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
