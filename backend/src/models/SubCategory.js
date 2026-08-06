const mongoose = require('mongoose');
const slugify = require('slugify');

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'SubCategory name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    slugHistory: {
      type: [String],
      default: [],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'SubCategory must belong to a parent Category'],
      index: true,
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
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
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
      default: true,
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
  },
  { timestamps: true }
);

// Compound unique index for category and name (only among non-deleted items)
subCategorySchema.index(
  { category: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);

// Explicit Compound Indexes for Enterprise Querying & Sorting
subCategorySchema.index({ category: 1, displayOrder: 1 });
subCategorySchema.index({ category: 1, isActive: 1 });
subCategorySchema.index({ category: 1, isDeleted: 1 });
subCategorySchema.index({ category: 1, featured: -1 });

// Middleware to generate slug before saving and archive previous slug in slugHistory
subCategorySchema.pre('save', function () {
  if (this.isNew && !this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  } else if (this.isModified('slug') && !this.isNew) {
    if (this._originalSlug && !this.slugHistory.includes(this._originalSlug)) {
      this.slugHistory.push(this._originalSlug);
    }
  }
});

// Middleware to regenerate slug and archive old slug on findOneAndUpdate
subCategorySchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (!update) return;

  let newName = update.name || (update.$set && update.$set.name);
  let newSlug = update.slug || (update.$set && update.$set.slug);

  if (newName && !newSlug) {
    newSlug = slugify(newName, { lower: true, strict: true });
    if (update.$set) update.$set.slug = newSlug;
    else update.slug = newSlug;
  }

  // If slug is changing, safely store old slug in slugHistory for SEO 301 redirection
  if (newSlug) {
    try {
      const doc = await this.model.findOne(this.getQuery());
      if (doc && doc.slug && doc.slug !== newSlug) {
        // Prevent MongoDB update conflict between direct sets and $addToSet
        delete update.slugHistory;
        if (update.$set && update.$set.slugHistory) {
          delete update.$set.slugHistory;
        }
        if (!update.$addToSet) update.$addToSet = {};
        update.$addToSet.slugHistory = doc.slug;
      }
    } catch (e) {
      console.error('Error updating slugHistory in findOneAndUpdate:', e);
    }
  }
});

// Query Middleware for Soft Delete Filtering
subCategorySchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

subCategorySchema.pre('countDocuments', function () {
  this.where({ isDeleted: { $ne: true } });
});

subCategorySchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
