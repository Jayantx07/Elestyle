const mongoose = require('mongoose');
const slugify = require('slugify');

const imageSchema = new mongoose.Schema({
  public_id: { type: String },
  secure_url: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  width: { type: Number },
  height: { type: Number },
  format: { type: String },
  bytes: { type: Number },
  alt: { type: String },
  order: { type: Number, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
    },
    compareAtPrice: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      index: true,
    },
    searchKeywords: {
      type: [String],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'hidden'],
      default: 'public',
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    images: [imageSchema],
    ratingAverage: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Middleware to automatically generate slug before saving
productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Middleware to regenerate slug on update operations
productSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update.name) {
    // If using set
    update.slug = slugify(update.name, { lower: true, strict: true });
  } else if (update.$set && update.$set.name) {
    update.$set.slug = slugify(update.$set.name, { lower: true, strict: true });
  }
});

// Query Middleware for Soft Delete Filtering
productSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

productSchema.pre('countDocuments', function () {
  this.where({ isDeleted: { $ne: true } });
});

productSchema.pre('aggregate', function () {
  // Add a $match stage to exclude soft-deleted documents
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
