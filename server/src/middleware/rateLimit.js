import rateLimit from 'express-rate-limit';
import { RateLimitedError } from '../utils/errors.js';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitedError('Too many requests from this IP, please try again in 15 minutes.'));
  }
});

export const aiRequestLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per user
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitedError('AI rate limit exceeded (max 10 requests per minute). Please slow down.'));
  }
});
