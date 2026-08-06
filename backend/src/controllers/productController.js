const Product = require('../models/Product');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const QueryBuilder = require('../utils/QueryBuilder');
const cacheManager = require('../utils/cacheManager');
const mongoose = require('mongoose');

// Helper to build enterprise query filters from request parameters with hierarchy search support
async function buildProductFilterQuery(query, params) {
  const filter = { visibility: 'public' };

  if (params.category) {
    if (mongoose.Types.ObjectId.isValid(params.category)) {
      filter.category = params.category;
    } else {
      const categoryDoc = await Category.findOne({ slug: params.category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        filter.category = null;
      }
    }
  }

  if (params.subcategory && params.subcategory !== 'all' && params.subcategory !== '') {
    const subValues = params.subcategory.split(',').map((s) => s.trim());
    const objectIds = [];
    const strings = [];

    for (const val of subValues) {
      strings.push(val);
      if (mongoose.Types.ObjectId.isValid(val)) {
        objectIds.push(new mongoose.Types.ObjectId(val));
      } else {
        const subDoc = await SubCategory.findOne({
          $or: [{ slug: val }, { slugHistory: { $in: [val] } }, { name: { $regex: new RegExp(`^${val}$`, 'i') } }],
        });
        if (subDoc) {
          objectIds.push(subDoc._id);
          strings.push(subDoc.name);
          strings.push(subDoc.slug);
        }
      }
    }

    const subConditions = [
      { subCategory: { $in: objectIds } },
      { legacySubCategory: { $in: strings } },
      { subCategory: { $in: strings } },
    ];

    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: subConditions }];
      delete filter.$or;
    } else if (filter.$and) {
      filter.$and.push({ $or: subConditions });
    } else {
      filter.$or = subConditions;
    }
  }

  if (params.color) {
    const colors = params.color.split(',').map((c) => new RegExp(c.trim(), 'i'));
    filter['colors.name'] = { $in: colors };
  }

  if (params.material) {
    const materials = params.material.split(',').map((m) => new RegExp(m.trim(), 'i'));
    filter.material = { $in: materials };
  }

  if (params.availability) {
    const avail = params.availability.split(',').map((a) => a.trim());
    filter.availability = { $in: avail };
  }

  if (params.price) {
    const parts = params.price.split('-');
    if (parts.length === 2) {
      const min = parseFloat(parts[0]) || 0;
      const max = parseFloat(parts[1]) || Number.MAX_SAFE_INTEGER;
      filter.price = { $gte: min, $lte: max };
    } else if (!isNaN(parseFloat(params.price))) {
      filter.price = parseFloat(params.price);
    }
  }

  if (params.discount) {
    filter.discount = { $gte: parseFloat(params.discount) || 0 };
  }

  if (params.rating) {
    filter.ratingAverage = { $gte: parseFloat(params.rating) || 0 };
  }

  if (params.featured === 'true') {
    filter.featured = true;
  }

  if (params.tag) {
    filter.tags = { $in: [params.tag] };
  }

  // Enterprise Search Hierarchy Integration: Category -> SubCategory -> Product -> Keywords -> Tags -> Attributes
  if (params.search) {
    const searchRegex = new RegExp(params.search, 'i');
    
    // Step 1: Match against Category domain
    const matchedCategories = await Category.find({ $or: [{ name: searchRegex }, { slug: searchRegex }] }).select('_id');
    const catIds = matchedCategories.map((c) => c._id);

    // Step 2: Match against SubCategory domain (including historical SEO slugs)
    const matchedSubs = await SubCategory.find({
      $or: [{ name: searchRegex }, { slug: searchRegex }, { slugHistory: { $in: [searchRegex] } }],
    }).select('_id name slug');
    const subIds = matchedSubs.map((s) => s._id);
    const subNames = matchedSubs.map((s) => s.name);

    const hierarchySearchConditions = [
      ...(catIds.length > 0 ? [{ category: { $in: catIds } }] : []),
      ...(subIds.length > 0 ? [{ subCategory: { $in: subIds } }, { legacySubCategory: { $in: subNames } }] : []),
      { name: searchRegex },
      { searchKeywords: { $in: [searchRegex] } },
      { tags: { $in: [searchRegex] } },
      { 'attributes.value': searchRegex },
      { material: searchRegex },
      { brand: searchRegex },
      { description: searchRegex }
    ];

    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: hierarchySearchConditions }];
      delete filter.$or;
    } else if (filter.$and) {
      filter.$and.push({ $or: hierarchySearchConditions });
    } else {
      filter.$or = hierarchySearchConditions;
    }
  }

  return filter;
}

function getSortObject(sortParam) {
  let sortObj = { displayOrder: 1, featured: -1, createdAt: -1 };
  if (sortParam) {
    switch (sortParam.toLowerCase()) {
      case 'featured':
        sortObj = { featured: -1, displayOrder: 1, createdAt: -1 };
        break;
      case 'newest':
      case 'latest':
      case '-createdat':
        sortObj = { createdAt: -1 };
        break;
      case 'best-selling':
      case 'popularity':
        sortObj = { reviewCount: -1, ratingAverage: -1 };
        break;
      case 'highest-rated':
      case 'rating':
      case '-ratingaverage':
        sortObj = { ratingAverage: -1, reviewCount: -1 };
        break;
      case 'price':
      case 'price-low':
      case 'price-low-high':
        sortObj = { price: 1 };
        break;
      case '-price':
      case 'price-high':
      case 'price-high-low':
        sortObj = { price: -1 };
        break;
      case '-discount':
      case 'highest-discount':
      case 'discount':
        sortObj = { discount: -1 };
        break;
      case 'alphabetical':
      case 'alpha':
        sortObj = { name: 1 };
        break;
      default:
        sortObj = { displayOrder: 1, createdAt: -1 };
    }
  }
  return sortObj;
}

exports.getPublicProducts = async (req, res) => {
  try {
    const query = await buildProductFilterQuery({}, req.query);
    if (query.category === null) {
      return res.status(200).json({ success: true, data: [], total: 0, page: 1, pages: 0, message: 'Category not found' });
    }

    const mongooseQuery = Product.find(query)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug icon image');

    const builder = new QueryBuilder(mongooseQuery, req.query).sort(req.query.sort ? req.query.sort : 'displayOrder -createdAt');
    const result = await builder.paginate();

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryDoc = await Category.findOne({ slug: req.params.slug });
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const queryParams = { ...req.query, category: categoryDoc._id.toString() };
    const query = await buildProductFilterQuery({}, queryParams);

    const mongooseQuery = Product.find(query)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug icon image');

    const sortString = req.query.sort || 'displayOrder -createdAt';
    const builder = new QueryBuilder(mongooseQuery, req.query).sort(sortString);
    const result = await builder.paginate();

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('getProductsByCategory error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getProductFacets = async (req, res) => {
  try {
    const { category } = req.query;
    const cacheKey = `facets:public:${JSON.stringify(req.query)}`;

    const facetsData = await cacheManager.wrap(cacheKey, 180, async () => {
      const matchStage = { visibility: 'public', isDeleted: { $ne: true } };
      let categoryObj = null;

      if (category) {
        if (mongoose.Types.ObjectId.isValid(category)) {
          matchStage.category = new mongoose.Types.ObjectId(category);
          categoryObj = await Category.findById(category);
        } else {
          const catDoc = await Category.findOne({ slug: category });
          if (catDoc) {
            matchStage.category = catDoc._id;
            categoryObj = catDoc;
          } else {
            return {};
          }
        }
      }

      const [subCatCounts, colorCounts, materialCounts, availabilityCounts, ratingCounts, priceStats] = await Promise.all([
        Product.aggregate([
          { $match: matchStage },
          { $group: { _id: { id: '$subCategory', legacy: '$legacySubCategory' }, count: { $sum: 1 } } },
        ]),
        Product.aggregate([
          { $match: matchStage },
          { $unwind: '$colors' },
          { $group: { _id: { name: '$colors.name', hex: '$colors.hex' }, count: { $sum: 1 } } },
        ]),
        Product.aggregate([
          { $match: { ...matchStage, material: { $nin: [null, ''] } } },
          { $group: { _id: '$material', count: { $sum: 1 } } },
        ]),
        Product.aggregate([
          { $match: matchStage },
          { $group: { _id: { $ifNull: ['$availability', 'In Stock'] }, count: { $sum: 1 } } },
        ]),
        Product.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: null,
              tier4: { $sum: { $cond: [{ $gte: ['$ratingAverage', 4] }, 1, 0] } },
              tier3: { $sum: { $cond: [{ $gte: ['$ratingAverage', 3] }, 1, 0] } },
              tier2: { $sum: { $cond: [{ $gte: ['$ratingAverage', 2] }, 1, 0] } },
            },
          },
        ]),
        Product.aggregate([
          { $match: matchStage },
          { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
        ]),
      ]);

      const subCatQuery = { isActive: true };
      if (categoryObj) subCatQuery.category = categoryObj._id;
      const activeSubCategories = await SubCategory.find(subCatQuery).sort({ displayOrder: 1, name: 1 });

      const subCategoryFacets = activeSubCategories.map((sc) => {
        const count = subCatCounts.reduce((sum, item) => {
          const matchId = item._id && item._id.id && item._id.id.toString() === sc._id.toString();
          const matchLegacy = item._id && (item._id.legacy === sc.name || item._id.legacy === sc.slug);
          return sum + (matchId || matchLegacy ? item.count : 0);
        }, 0);
        return { _id: sc._id.toString(), label: sc.name, value: sc.slug, icon: sc.icon, image: sc.image, count };
      });

      const colorMap = {};
      colorCounts.forEach((c) => {
        if (!c._id || !c._id.name || typeof c._id.name !== 'string' || c._id.name.trim() === '' || c._id.name === 'null') return;
        const name = c._id.name.trim();
        if (colorMap[name]) {
          colorMap[name].count += c.count;
        } else {
          colorMap[name] = { name, label: name, value: name, hex: c._id.hex || '#CCCCCC', count: c.count };
        }
      });
      const colorFacets = Object.values(colorMap);

      const materialFacets = materialCounts
        .filter((m) => m._id && typeof m._id === 'string' && m._id.trim() !== '' && m._id !== 'null')
        .map((m) => ({
          name: m._id.trim(),
          label: m._id.trim(),
          value: m._id.trim(),
          count: m.count,
        }));

      const availabilityMap = {};
      availabilityCounts.forEach((a) => {
        let status = a._id && typeof a._id === 'string' && a._id.trim() ? a._id.trim() : 'In Stock';
        if (status.toLowerCase() === 'in stock') status = 'In Stock';
        else if (status.toLowerCase() === 'out of stock') status = 'Out of Stock';
        availabilityMap[status] = (availabilityMap[status] || 0) + a.count;
      });
      const availabilityFacets = Object.keys(availabilityMap).map((status) => ({
        status,
        label: status,
        value: status,
        count: availabilityMap[status],
      }));

      const ratingStats = ratingCounts[0] || { tier4: 0, tier3: 0, tier2: 0 };
      const ratingFacets = [
        { label: '4 Stars & Above', value: 4, count: ratingStats.tier4 },
        { label: '3 Stars & Above', value: 3, count: ratingStats.tier3 },
        { label: '2 Stars & Above', value: 2, count: ratingStats.tier2 },
      ];

      const prices = priceStats[0] || { minPrice: 0, maxPrice: 10000 };

      return {
        subCategories: subCategoryFacets,
        colors: colorFacets,
        materials: materialFacets,
        availability: availabilityFacets,
        rating: ratingFacets,
        priceMin: prices.minPrice || 0,
        priceMax: prices.maxPrice || 10000,
        priceRange: { min: prices.minPrice, max: prices.maxPrice },
      };
    });

    res.status(200).json({
      success: true,
      data: facetsData,
      facets: facetsData,
    });
  } catch (error) {
    console.error('getProductFacets error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `product:slug:${slug}`;

    const product = await cacheManager.wrap(cacheKey, 300, async () => {
      let query = { slug, visibility: 'public' };

      if (mongoose.Types.ObjectId.isValid(slug)) {
        query = { $or: [{ slug }, { _id: slug }], visibility: 'public' };
      }

      return await Product.findOne(query)
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug icon image');
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const cacheKey = 'products:featured';
    const products = await cacheManager.wrap(cacheKey, 300, async () => {
      return await Product.find({ featured: true, visibility: 'public' })
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug icon image')
        .sort({ displayOrder: 1, createdAt: -1 })
        .limit(8);
    });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getLatestProducts = async (req, res) => {
  try {
    const cacheKey = 'products:latest';
    const products = await cacheManager.wrap(cacheKey, 300, async () => {
      return await Product.find({ visibility: 'public' })
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug icon image')
        .sort({ createdAt: -1 })
        .limit(10);
    });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getRelatedProducts = async (req, res) => {
  try {
    const cacheKey = `products:related:${req.params.slug}`;
    const relatedProducts = await cacheManager.wrap(cacheKey, 300, async () => {
      const product = await Product.findOne({ slug: req.params.slug });
      if (!product) return null;

      return await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        visibility: 'public',
      })
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug icon image')
        .sort({ displayOrder: 1, createdAt: -1 })
        .limit(4);
    });

    if (!relatedProducts) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: relatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
