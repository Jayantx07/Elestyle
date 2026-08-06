const SubCategory = require('../models/SubCategory');
const Product = require('../models/Product');
const Category = require('../models/Category');
const cacheManager = require('../utils/cacheManager');
const mongoose = require('mongoose');

// Helper function to calculate product counts dynamically via real-time MongoDB aggregation
async function getAggregatedProductCounts(subCategories) {
  if (!subCategories || subCategories.length === 0) return subCategories;

  const subCatIds = subCategories.map((sc) => sc._id);
  const subCatNames = subCategories.map((sc) => sc.name);

  const counts = await Product.aggregate([
    {
      $match: {
        $or: [
          { subCategory: { $in: subCatIds } },
          { legacySubCategory: { $in: subCatNames } },
          { subCategory: { $in: subCatNames } },
        ],
        visibility: 'public',
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: {
          id: '$subCategory',
          legacy: '$legacySubCategory',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  return subCategories.map((sc) => {
    const doc = typeof sc.toObject === 'function' ? sc.toObject() : sc;
    const matchCount = counts.reduce((sum, item) => {
      const matchId = item._id && item._id.id && item._id.id.toString() === doc._id.toString();
      const matchLegacy =
        item._id &&
        (item._id.legacy === doc.name ||
          item._id.legacy === doc.slug ||
          (typeof item._id.id === 'string' && (item._id.id === doc.name || item._id.id === doc.slug)));
      return sum + (matchId || matchLegacy ? item.count : 0);
    }, 0);
    doc.productCount = matchCount;
    return doc;
  });
}

exports.getPublicSubCategories = async (req, res) => {
  try {
    const cacheKey = `subcategories:public:${JSON.stringify(req.query)}`;
    
    const result = await cacheManager.wrap(cacheKey, 300, async () => {
      const { category, featured, navbar, homepage, carousel, search } = req.query;
      const query = { isActive: true };

      if (category) {
        if (category.match(/^[0-9a-fA-F]{24}$/)) {
          query.category = category;
        } else {
          const cat = await Category.findOne({ slug: category });
          if (cat) {
            query.category = cat._id;
          } else {
            return [];
          }
        }
      }

      if (featured === 'true') query.featured = true;
      if (navbar === 'true') query.showInNavbar = true;
      if (homepage === 'true') query.showInHomepage = true;
      if (carousel === 'true') query.showInCircularCarousel = true;
      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ name: regex }, { description: regex }];
      }

      const subCategories = await SubCategory.find(query)
        .populate('category', 'name slug')
        .sort({ displayOrder: 1, name: 1 });

      return await getAggregatedProductCounts(subCategories);
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching public subcategories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSubCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `subcategories:slug:${slug}`;

    const data = await cacheManager.wrap(cacheKey, 300, async () => {
      let subCat = await SubCategory.findOne({ slug, isActive: true }).populate('category', 'name slug');

      if (!subCat) {
        // SEO Protection: Search in slugHistory for permanent 301 redirection
        const archivedDoc = await SubCategory.findOne({ slugHistory: { $in: [slug] }, isActive: true }).populate(
          'category',
          'name slug'
        );

        if (archivedDoc) {
          return {
            redirect: true,
            status: 301,
            newSlug: archivedDoc.slug,
            data: archivedDoc,
          };
        }

        if (mongoose.Types.ObjectId.isValid(slug)) {
          subCat = await SubCategory.findOne({ _id: slug, isActive: true }).populate('category', 'name slug');
        }
      }

      if (!subCat) return null;

      const [dataWithCount] = await getAggregatedProductCounts([subCat]);
      return dataWithCount;
    });

    if (!data) {
      return res.status(404).json({ success: false, message: 'SubCategory not found' });
    }

    if (data.redirect) {
      return res.status(301).json({
        success: true,
        redirect: true,
        status: 301,
        newSlug: data.newSlug,
        message: 'SubCategory URL moved permanently (301 Redirection)',
        data: data.data,
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSubCategoriesByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `subcategories:cat:${id}`;

    const dataWithCounts = await cacheManager.wrap(cacheKey, 300, async () => {
      let categoryId = id;
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        const cat = await Category.findOne({ slug: id });
        if (!cat) return null;
        categoryId = cat._id;
      }

      const subCategories = await SubCategory.find({ category: categoryId, isActive: true })
        .populate('category', 'name slug')
        .sort({ displayOrder: 1, name: 1 });

      return await getAggregatedProductCounts(subCategories);
    });

    if (!dataWithCounts) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: dataWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
