import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to default express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Structured logging
  logger.error(err.message || 'Unknown error occurred', {
    code: err.code || 'INTERNAL_ERROR',
    status: err.status || 500,
    path: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || []
      }
    });
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
        details: [{ field: err.field, code: err.code }]
      }
    });
  }

  // Generic fallback
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? 'An unexpected server error occurred.' : (err.message || 'Internal server error'),
      details: []
    }
  });
}
