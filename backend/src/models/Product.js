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

const colorAttributeSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  hex: { type: String, trim: true, required: true },
});

const variantSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: 'Variant' }, // e.g., Variant 1, Rose Gold Edition
  sku: { type: String, trim: true },
  price: { type: Number, default: 0 }, // If > 0, overrides base product price
  compareAtPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  sizes: { type: [String], default: [] }, // Toggled sizes: XS, S, M, L, XL, XXL, Free Size
  images: [{
    secure_url: { type: String },
    public_id: { type: String },
    isPrimary: { type: Boolean, default: false }
  }],
  image: { type: String, default: '' }, // Primary thumbnail fallback
  colorName: { type: String, trim: true },
  colorHex: { type: String, trim: true },
  material: { type: String, trim: true },
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
});

const customAttributeSchema = new mongoose.Schema({
  key: { type: String, trim: true, required: true, index: true },
  label: { type: String, trim: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { 
    type: String, 
    enum: ['String', 'Number', 'Boolean', 'Date'], 
    default: 'String' 
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    sku: {
      type: String,
      trim: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
      index: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      index: true,
    },
    legacySubCategory: {
      type: String,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      index: true,
    },
    compareAtPrice: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
      index: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    // Enterprise Product Attribute Architecture
    variants: [variantSchema],
    colors: [colorAttributeSchema],
    material: {
      type: String,
      trim: true,
      index: true,
    },
    weight: {
      type: String,
      trim: true,
    },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, default: 'cm' },
    },
    brand: {
      type: String,
      trim: true,
      default: 'ElleStyle',
    },
    handmadeTime: {
      type: String,
      trim: true,
    },
    availability: {
      type: String,
      enum: ['In Stock', 'Pre-Order', 'Out of Stock'],
      default: 'In Stock',
      index: true,
    },
    countryOfOrigin: {
      type: String,
      trim: true,
      default: 'India',
    },
    attributes: [customAttributeSchema],
    // Organization & Visibility
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
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    schemaVersion: {
      type: Number,
      default: 2,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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

// Explicit Compound Indexes for High-Performance Querying & Sorting
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ category: 1, featured: -1 });
productSchema.index({ category: 1, displayOrder: 1 });
productSchema.index({ subCategory: 1, displayOrder: 1 });
productSchema.index({ category: 1, isDeleted: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1, discount: -1 });
productSchema.index({ isDeleted: 1, status: 1, visibility: 1 });

// Middleware to automatically generate slug before saving and update availability based on stock
productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  if (this.isModified('stock') && this.availability !== 'Pre-Order') {
    this.availability = this.stock > 0 ? 'In Stock' : 'Out of Stock';
  }
});

// Middleware to regenerate slug on update operations
productSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
  } else if (update.$set && update.$set.name) {
    update.$set.slug = slugify(update.$set.name, { lower: true, strict: true });
  }
  
  const updatedStock = update.stock !== undefined ? update.stock : (update.$set && update.$set.stock);
  const currentAvailability = update.availability || (update.$set && update.$set.availability);
  if (updatedStock !== undefined && currentAvailability !== 'Pre-Order') {
    const status = updatedStock > 0 ? 'In Stock' : 'Out of Stock';
    if (update.$set) update.$set.availability = status;
    else update.availability = status;
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
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
