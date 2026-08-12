const FeatureHighlight = require('../models/FeatureHighlight');
const cacheManager = require('../utils/cacheManager');

const PUBLIC_CACHE_KEY = 'feature-highlights:public';

const sanitizePublicHighlight = (highlight) => ({
  id: highlight._id,
  altText: highlight.altText || '',
  imageSrc: highlight.imageSrc,
  displayOrder: highlight.displayOrder,
  category: highlight.category && typeof highlight.category === 'object'
    ? {
        id: highlight.category._id,
        name: highlight.category.name,
        slug: highlight.category.slug,
      }
    : null,
});

exports.getPublicFeatureHighlights = async (req, res) => {
  try {
    const highlights = await cacheManager.wrap(PUBLIC_CACHE_KEY, 300, async () => {
      // Limit to max 50 for storefront performance
      const docs = await FeatureHighlight.find({ isActive: true })
        .populate('category', 'name slug')
        .sort({ displayOrder: 1, createdAt: 1 })
        .limit(50)
        .lean();
      
      return docs.map(sanitizePublicHighlight);
    });

    res.status(200).json({ success: true, data: highlights });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
