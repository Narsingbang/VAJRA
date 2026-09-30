import { z } from 'zod';
import { APP_LANGUAGES, ADVISORY_MODULES } from '../constants/enums.js';

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID parameter')
});

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(1).max(100).optional(),
  preferred_language: z.enum(APP_LANGUAGES).optional(),
  state: z.string().trim().max(60).optional().nullable(),
  district: z.string().trim().max(60).optional().nullable(),
  onboarding_completed: z.boolean().optional()
});

export const feedbackSchema = z.object({
  rating: z.union([z.literal(-1), z.literal(1)]),
  comment: z.string().trim().max(500).optional().nullable()
});

export const followupSchema = z.object({
  question: z.string().trim().min(3, 'Question must be at least 3 characters').max(500)
});

export const listQuerySchema = z.object({
  module: z.enum(ADVISORY_MODULES).optional(),
  crop: z.string().trim().optional(),
  farm_id: z.string().uuid().optional(),
  q: z.string().trim().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10)
});
