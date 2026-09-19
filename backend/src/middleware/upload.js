const multer = require('multer');

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Files are held in memory just long enough to forward them to Supabase Storage —
// nothing is written to the server's disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_BYTES, files: 1 },
  fileFilter(req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    const err = new Error('Only JPG, PNG, or WebP images are allowed');
    err.code = 'INVALID_FILE_TYPE';
    return cb(err);
  },
});

// Wraps multer so its errors come back in the app's usual { status, message } shape
// instead of falling through to the generic 500 handler.
function uploadAvatarImage(req, res, next) {
  upload.single('avatar')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Image must be 2 MB or smaller'
          : 'Could not read the uploaded file';
      return res.status(400).json({ status: 400, message });
    }

    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ status: 400, message: err.message });
    }

    return next(err);
  });
}

module.exports = { uploadAvatarImage };
