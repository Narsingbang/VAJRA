import { z } from 'zod';
import {
  APP_LANGUAGES,
  SEASONS,
  SOIL_TYPES,
  IRRIGATION_SOURCES,
  FARMING_PRACTICES
} from '../constants/enums.js';

export const commonInputSchema = z.object({
  farm_id: z.string().uuid().optional().nullable(),
  state: z.string().trim().min(2).max(60),
  district: z.string().trim().min(2).max(60),
  season: z.enum(SEASONS),
  soil_type: z.enum(SOIL_TYPES).default('unknown'),
  irrigation_source: z.enum(IRRIGATION_SOURCES),
  area_acres: z.coerce.number().min(0.1).max(10000),
  farming_practice: z.enum(FARMING_PRACTICES).default('conventional'),
  language: z.enum(APP_LANGUAGES).default('en'),
  additional_notes: z.string().max(1000).optional().nullable()
});
