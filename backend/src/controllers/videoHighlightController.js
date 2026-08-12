const VideoHighlight = require('../models/VideoHighlight');
const cacheManager = require('../utils/cacheManager');

const PUBLIC_CACHE_KEY = 'video-highlights:public';

exports.getPublicVideoHighlights = async (req, res) => {
  try {
    const highlights = await cacheManager.wrap(PUBLIC_CACHE_KEY, 300, async () => {
      const docs = await VideoHighlight.find({ isActive: true })
        .populate('category', 'name slug')
        .sort({ displayOrder: 1, createdAt: 1 })
        .limit(50)
        .lean();

      return docs.map((highlight) => ({
        id: highlight._id,
        title: highlight.title || '',
        videoUrl: highlight.videoUrl,
        posterUrl: highlight.posterUrl,
        displayOrder: highlight.displayOrder,
        category: highlight.category
          ? {
              id: highlight.category._id,
              name: highlight.category.name,
              slug: highlight.category.slug,
            }
          : null,
      }));
    });

    res.status(200).json({ success: true, data: highlights });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
