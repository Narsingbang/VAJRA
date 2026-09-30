import { z } from 'zod';
import { SOIL_TYPES, IRRIGATION_SOURCES } from '../constants/enums.js';

export const farmCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(60),
  district: z.string().trim().min(2).max(60),
  village: z.string().trim().max(80).optional().nullable(),
  area_acres: z.coerce.number().positive().max(10000),
  soil_type: z.enum(SOIL_TYPES).default('unknown'),
  irrigation_source: z.enum(IRRIGATION_SOURCES).default('rainfed'),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable()
});

export const farmUpdateSchema = farmCreateSchema.partial();
