const multer = require('multer');

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
];

// Files are held in memory just long enough to forward them to Supabase Storage —
// nothing is written to the server's disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter(req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    const err = new Error('That file type is not supported for chat attachments');
    err.code = 'INVALID_FILE_TYPE';
    return cb(err);
  },
});

// Wraps multer so its errors come back in the messaging routes' usual
// { success, error } shape instead of falling through to the generic 500 handler.
function uploadChatFile(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'File must be 25 MB or smaller'
          : 'Could not read the uploaded file';
      return res.status(400).json({ success: false, error: message });
    }

    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ success: false, error: err.message });
    }

    return next(err);
  });
}

module.exports = { uploadChatFile };
