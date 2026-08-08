const errorHandler = (err, req, res, next) => {
  const isUploadError = err && (err.code === 'LIMIT_FILE_SIZE' || /invalid file format/i.test(err.message || '') || /file too large/i.test(err.message || ''));
  const statusCode = res.statusCode === 200 ? (isUploadError ? 400 : 500) : res.statusCode;
  
  res.status(statusCode).json({
    message: isUploadError ? 'Invalid image upload. Only JPEG, PNG, and WebP files up to 5 MB are allowed.' : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
