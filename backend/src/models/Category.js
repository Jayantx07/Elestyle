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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Middleware to automatically generate slug before saving
categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Middleware to regenerate slug on update operations
categorySchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
