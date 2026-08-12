const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Media Service for handling all file uploads and deletions
 * using Cloudinary as the backend provider.
 */
const mediaService = {
  /**
   * Dynamically build the Cloudinary folder path based on category and product slug
   * @param {string} category 
   * @param {string} productSlug 
   * @returns {string} Folder path
   */
  buildFolderPath: (category, productSlug) => {
    // Sanitize strings for folder names
    const safeCategory = category.trim();
    const safeSlug = productSlug.trim();
    return `ElleStyle/Products/${safeCategory}/${safeSlug}`;
  },

  /**
   * Upload a file buffer to Cloudinary
   * @param {Buffer} fileBuffer - The file buffer from multer
   * @param {string} folderPath - The target folder path in Cloudinary
   * @returns {Promise<Object>} The Cloudinary result object
   */
  uploadImage: (fileBuffer, folderPath) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          // Cloudinary automatically selects format and optimizes quality when f_auto and q_auto are applied 
          // during delivery, but we can also set them at upload if desired, though usually done at delivery.
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  },

  /**
   * Upload a video file buffer to Cloudinary
   * @param {Buffer} fileBuffer - The file buffer from multer
   * @param {string} folderPath - The target folder path in Cloudinary
   * @returns {Promise<Object>} The Cloudinary result object
   */
  uploadVideo: (fileBuffer, folderPath) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          resource_type: 'video',
          // Auto convert video format for web delivery via delivery URLs, 
          // but we specify video here to ensure it accepts large files.
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  },

  /**
   * Delete an image from Cloudinary by its public ID
   * @param {string} publicId - The Cloudinary public ID
   * @returns {Promise<Object>} The Cloudinary result object
   */
  deleteImage: (publicId) => {
    return mediaService.deleteMedia(publicId, 'image');
  },

  /**
   * Delete a media asset from Cloudinary by its public ID
   * @param {string} publicId - The Cloudinary public ID
   * @param {string} resourceType - 'image' or 'video'
   * @returns {Promise<Object>} The Cloudinary result object
   */
  deleteMedia: (publicId, resourceType = 'image') => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }
};

module.exports = mediaService;
