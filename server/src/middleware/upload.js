import multer from 'multer';
import { UploadError } from '../utils/errors.js';
import { verifyImageMagicBytes } from '../utils/imageSniff.js';
import { env } from '../config/env.js';

const storage = multer.memoryStorage();

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const multerUpload = multer({
  storage,
  limits: {
    files: env.MAX_IMAGES_PER_REQUEST,
    fileSize: env.MAX_IMAGE_MB * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new UploadError(`Invalid file format: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`));
    }
    cb(null, true);
  }
}).array('images', env.MAX_IMAGES_PER_REQUEST);

/**
 * Middleware that handles both JSON body or multipart form data with `payload` and `images[]`.
 * Also validates magic bytes of uploaded images.
 */
export function handleAdvisoryUpload(req, res, next) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    req.files = [];
    return next();
  }

  multerUpload(req, res, (err) => {
    if (err) return next(err);

    // If payload is sent as JSON string in multipart form-data, parse into req.body
    if (req.body && typeof req.body.payload === 'string') {
      try {
        req.body = JSON.parse(req.body.payload);
      } catch (parseErr) {
        return next(new UploadError('Invalid JSON in payload field of multipart form-data.'));
      }
    }

    // Verify magic bytes of every uploaded file
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const sniff = verifyImageMagicBytes(file.buffer);
        if (!sniff.valid) {
          return next(
            new UploadError(`File ${file.originalname} has invalid or spoofed image binary contents.`)
          );
        }
      }
    }

    next();
  });
}
