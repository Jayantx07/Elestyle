const mediaService = require('../services/mediaService');

/**
 * Enterprise Cloudinary Asset Cleanup Service
 * Prevents orphan media assets in Cloudinary when catalog items (Products, Categories, SubCategories)
 * undergo deletion, replacement, archival, or restoration.
 */
const cloudinaryCleanup = {
  /**
   * Extract Cloudinary public_id from object or URL string
   * @param {Object|String} img 
   */
  extractPublicId: (img) => {
    if (!img) return null;
    if (typeof img === 'object' && img.public_id) {
      return img.public_id;
    }
    const url = typeof img === 'object' ? img.secure_url : img;
    if (typeof url === 'string' && url.includes('cloudinary.com')) {
      const match = url.match(/\/v\d+\/([^/.]+(?:\/[^/.]+)*)\.[a-z]{3,4}$/i);
      if (match && match[1]) return match[1];
      // Try catching folders without version
      const simpleMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
      if (simpleMatch && simpleMatch[1]) return simpleMatch[1];
    }
    return null;
  },

  /**
   * Remove all associated media when an entity is permanently deleted or purged
   * @param {Array<Object|String>|Object|String} mediaAssets 
   */
  cleanupAssets: async (mediaAssets) => {
    const assets = Array.isArray(mediaAssets) ? mediaAssets : [mediaAssets];
    const results = [];

    for (const asset of assets) {
      const publicId = cloudinaryCleanup.extractPublicId(asset);
      if (publicId) {
        try {
          const res = await mediaService.deleteImage(publicId);
          results.push({ publicId, status: 'deleted', res });
        } catch (err) {
          console.error(`Failed to delete Cloudinary asset [${publicId}]:`, err.message);
          results.push({ publicId, status: 'error', error: err.message });
        }
      }
    }
    return results;
  },

  /**
   * Diff and clean up removed images when updating/replacing product or category image sets
   * @param {Array<Object|String>} oldImages - Previous image array in DB
   * @param {Array<Object|String>} newImages - Newly submitted image array
   */
  cleanupReplacedImages: async (oldImages = [], newImages = []) => {
    if (!oldImages || oldImages.length === 0) return [];
    
    const newUrls = (newImages || []).map((img) => (typeof img === 'object' ? img.secure_url : img));
    const newPublicIds = (newImages || []).map((img) => cloudinaryCleanup.extractPublicId(img)).filter(Boolean);

    const orphanedAssets = oldImages.filter((oldImg) => {
      const oldUrl = typeof oldImg === 'object' ? oldImg.secure_url : oldImg;
      const oldPublicId = cloudinaryCleanup.extractPublicId(oldImg);
      return !newUrls.includes(oldUrl) && (!oldPublicId || !newPublicIds.includes(oldPublicId));
    });

    if (orphanedAssets.length > 0) {
      console.log(`[Cloudinary Cleanup] Removing ${orphanedAssets.length} replaced orphan asset(s)...`);
      return await cloudinaryCleanup.cleanupAssets(orphanedAssets);
    }
    return [];
  },
};

module.exports = cloudinaryCleanup;
