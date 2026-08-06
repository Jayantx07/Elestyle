const mongoose = require('mongoose');

const filterConfigurationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Filter display name is required'],
      trim: true,
    },
    key: {
      type: String,
      required: [true, 'Filter attribute key is required'],
      trim: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'Checkbox',
        'Radio',
        'Color Swatch',
        'Price Range',
        'Rating',
        'Availability',
        'Numeric Range',
      ],
      default: 'Checkbox',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    values: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    sortOrder: {
      type: String,
      enum: ['Alphabetical', 'Count High -> Low', 'Manual'],
      default: 'Count High -> Low',
    },
    defaultExpanded: {
      type: Boolean,
      default: true,
    },
    showProductCounts: {
      type: Boolean,
      default: true,
    },
    featuredFilter: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // Null indicates global filter across all categories
      index: true,
    },
    schemaVersion: {
      type: Number,
      default: 2,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Query Middleware for Soft Delete Filtering
filterConfigurationSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

filterConfigurationSchema.pre('countDocuments', function () {
  this.where({ isDeleted: { $ne: true } });
});

filterConfigurationSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});

const FilterConfiguration = mongoose.model('FilterConfiguration', filterConfigurationSchema);

module.exports = FilterConfiguration;
