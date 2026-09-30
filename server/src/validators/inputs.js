import { z } from 'zod';
import { commonInputSchema } from './common.js';
import {
  GROWTH_STAGES,
  MARKET_PREFERENCES,
  LABOUR_AVAILABILITY,
  WATER_AVAILABILITY,
  PLANT_PARTS,
  RECENT_WEATHER,
  STORAGE_FACILITIES,
  INTENDED_USES
} from '../constants/enums.js';

export const cropRecommendationInputSchema = commonInputSchema.extend({
  module: z.literal('crop_recommendation'),
  previous_crop: z.string().trim().max(60).optional().nullable(),
  budget_inr_per_acre: z.coerce.number().min(0).max(1000000).optional().nullable(),
  market_preference: z.enum(MARKET_PREFERENCES).default('local_mandi'),
  labour_availability: z.enum(LABOUR_AVAILABILITY).default('medium')
});

export const fertilizerPlanInputSchema = commonInputSchema.extend({
  module: z.literal('fertilizer_plan'),
  crop: z.string().trim().min(2).max(60),
  growth_stage: z.enum(GROWTH_STAGES),
  soil_test: z.object({
    ph: z.coerce.number().min(0).max(14).optional().nullable(),
    nitrogen_kg_ha: z.coerce.number().min(0).optional().nullable(),
    phosphorus_kg_ha: z.coerce.number().min(0).optional().nullable(),
    potassium_kg_ha: z.coerce.number().min(0).optional().nullable(),
    organic_carbon_percent: z.coerce.number().min(0).max(10).optional().nullable()
  }).optional().nullable(),
  target_yield_quintal_per_acre: z.coerce.number().min(0).optional().nullable()
});

export const irrigationScheduleInputSchema = commonInputSchema.extend({
  module: z.literal('irrigation_schedule'),
  crop: z.string().trim().min(2).max(60),
  growth_stage: z.enum(GROWTH_STAGES),
  sowing_date: z.string().optional().nullable(),
  weekly_rainfall_mm: z.coerce.number().min(0).max(1000).optional().nullable(),
  water_availability: z.enum(WATER_AVAILABILITY).default('adequate')
});

export const pestDiseaseDiagnosisInputSchema = commonInputSchema.extend({
  module: z.literal('pest_disease_diagnosis'),
  crop: z.string().trim().min(2).max(60),
  growth_stage: z.enum(GROWTH_STAGES),
  symptoms: z.string().trim().min(10, 'Symptoms must be at least 10 characters').max(1500),
  affected_part: z.array(z.enum(PLANT_PARTS)).min(1, 'Select at least one affected plant part'),
  affected_area_percent: z.coerce.number().min(0).max(100),
  days_since_first_noticed: z.coerce.number().int().min(0).max(365),
  recent_weather: z.enum(RECENT_WEATHER).default('mixed'),
  treatments_already_tried: z.string().trim().max(500).optional().nullable()
});

export const seasonalCalendarInputSchema = commonInputSchema.extend({
  module: z.literal('seasonal_calendar'),
  crop: z.string().trim().min(2).max(60),
  sowing_month: z.coerce.number().int().min(1).max(12).optional().nullable(),
  variety: z.string().trim().max(60).optional().nullable()
});

export const harvestPostharvestInputSchema = commonInputSchema.extend({
  module: z.literal('harvest_postharvest'),
  crop: z.string().trim().min(2).max(60),
  expected_harvest_date: z.string().optional().nullable(),
  storage_facility: z.enum(STORAGE_FACILITIES).default('none'),
  intended_use: z.enum(INTENDED_USES).default('sell_immediately')
});

export const advisoryInputSchema = z.discriminatedUnion('module', [
  cropRecommendationInputSchema,
  fertilizerPlanInputSchema,
  irrigationScheduleInputSchema,
  pestDiseaseDiagnosisInputSchema,
  seasonalCalendarInputSchema,
  harvestPostharvestInputSchema
]);
