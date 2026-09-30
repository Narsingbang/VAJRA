import { z } from 'zod';
import {
  CROP_CATEGORIES,
  APPLICATION_METHODS,
  IRRIGATION_METHODS,
  PEST_CATEGORIES,
  TREATMENT_TYPES,
  GROWTH_STAGES
} from '../constants/enums.js';

export const commonOutputShape = {
  summary: z.string(),
  assumptions: z.array(z.string()),
  risk_level: z.enum(['low', 'medium', 'high']),
  confidence: z.enum(['low', 'medium', 'high']),
  warnings: z.array(z.string()),
  safety_notes: z.array(z.string()),
  consult_expert: z.boolean(),
  consult_expert_reason: z.string().nullable(),
  disclaimer: z.string()
};

export const cropRecommendationOutputSchema = z.object({
  ...commonOutputShape,
  best_pick: z.string(),
  recommendations: z.array(
    z.object({
      rank: z.number().int().min(1).max(3),
      crop: z.string(),
      category: z.enum(CROP_CATEGORIES),
      why_suitable: z.string(),
      varieties: z.array(z.string()),
      sowing_window: z.string(),
      duration_days: z.number().int(),
      water_need: z.enum(['low', 'medium', 'high']),
      expected_yield_range: z.string(),
      cost_range_inr_per_acre: z.string(),
      income_range_inr_per_acre: z.string(),
      rotation_benefit: z.string(),
      key_risks: z.array(z.string())
    }).strict()
  ).min(3).max(3),
  crops_to_avoid: z.array(
    z.object({
      crop: z.string(),
      reason: z.string()
    }).strict()
  )
}).strict();

export const fertilizerPlanOutputSchema = z.object({
  ...commonOutputShape,
  soil_interpretation: z.string(),
  total_nutrient_summary: z.object({
    n_kg_per_acre: z.string(),
    p2o5_kg_per_acre: z.string(),
    k2o_kg_per_acre: z.string()
  }).strict(),
  schedule: z.array(
    z.object({
      stage: z.string(),
      timing: z.string(),
      input: z.string(),
      quantity_per_acre: z.string(),
      method: z.enum(APPLICATION_METHODS),
      purpose: z.string(),
      type: z.enum(['organic', 'chemical'])
    }).strict()
  ),
  organic_alternatives: z.array(z.string()),
  micronutrient_checks: z.array(z.string()),
  deficiency_or_excess_signs: z.array(z.string()),
  soil_test_recommended: z.boolean()
}).strict();

export const irrigationScheduleOutputSchema = z.object({
  ...commonOutputShape,
  total_seasonal_water_need_mm: z.string(),
  recommended_method: z.enum(IRRIGATION_METHODS),
  critical_stages: z.array(z.string()),
  stage_plan: z.array(
    z.object({
      stage: z.string(),
      duration: z.string(),
      interval_days: z.string(),
      quantity_per_irrigation: z.string(),
      notes: z.string()
    }).strict()
  ),
  next_two_weeks: z.array(
    z.object({
      day_range: z.string(),
      action: z.string(),
      condition: z.string()
    }).strict()
  ),
  water_saving_tips: z.array(z.string()),
  waterlogging_or_salinity_risks: z.array(z.string())
}).strict();

export const pestDiseaseDiagnosisOutputSchema = z.object({
  ...commonOutputShape,
  image_observations: z.string().nullable(),
  possible_causes: z.array(
    z.object({
      name: z.string(),
      category: z.enum(PEST_CATEGORIES),
      likelihood: z.enum(['low', 'medium', 'high']),
      evidence: z.string(),
      how_to_confirm: z.string()
    }).strict()
  ).min(1).max(4),
  immediate_actions: z.array(z.string()),
  treatment_options: z.array(
    z.object({
      type: z.enum(TREATMENT_TYPES),
      name: z.string(),
      how_to_apply: z.string(),
      dose: z.string().nullable(),
      frequency: z.string().nullable(),
      pre_harvest_interval: z.string().nullable(),
      precautions: z.array(z.string())
    }).strict()
  ),
  prevention: z.array(z.string()),
  monitoring_plan: z.array(z.string()),
  yield_loss_risk: z.enum(['low', 'medium', 'high'])
}).strict();

export const seasonalCalendarOutputSchema = z.object({
  ...commonOutputShape,
  recommended_sowing_window: z.string(),
  duration_to_harvest_days: z.number().int(),
  seed_rate_per_acre: z.string(),
  spacing: z.string(),
  seed_treatment: z.string(),
  timeline: z.array(
    z.object({
      period: z.string(),
      phase: z.enum([
        'land_preparation',
        'sowing',
        'germination',
        'vegetative',
        'flowering',
        'fruiting',
        'maturity',
        'harvest'
      ]),
      tasks: z.array(z.string())
    }).strict()
  ),
  key_deadlines: z.array(z.string())
}).strict();

export const harvestPostharvestOutputSchema = z.object({
  ...commonOutputShape,
  maturity_indicators: z.array(z.string()),
  harvest_method: z.string(),
  best_harvest_time: z.string(),
  handling_and_grading: z.array(z.string()),
  drying: z.object({
    method: z.string(),
    target_moisture_percent: z.string(),
    duration: z.string()
  }).strict(),
  storage: z.object({
    recommendation: z.string(),
    safe_duration: z.string(),
    storage_pest_control: z.array(z.string())
  }).strict(),
  common_losses_and_fixes: z.array(
    z.object({
      loss: z.string(),
      fix: z.string()
    }).strict()
  ),
  marketing_tips: z.array(z.string())
}).strict();

export const followupOutputSchema = z.object({
  answer: z.string(),
  action_steps: z.array(z.string()),
  warnings: z.array(z.string()),
  consult_expert: z.boolean(),
  disclaimer: z.string()
}).strict();

export const moduleOutputSchemas = {
  crop_recommendation: cropRecommendationOutputSchema,
  fertilizer_plan: fertilizerPlanOutputSchema,
  irrigation_schedule: irrigationScheduleOutputSchema,
  pest_disease_diagnosis: pestDiseaseDiagnosisOutputSchema,
  seasonal_calendar: seasonalCalendarOutputSchema,
  harvest_postharvest: harvestPostharvestOutputSchema
};

/**
 * Strips markdown code blocks and validates AI output against module output schema.
 * @param {string} module
 * @param {string} rawText
 */
export function parseAiOutput(module, rawText) {
  let cleaned = (rawText || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse AI output as JSON: ${err.message}`);
  }

  const schema = module === 'followup' ? followupOutputSchema : moduleOutputSchemas[module];
  if (!schema) {
    throw new Error(`No output schema defined for module: ${module}`);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const errorDetails = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    ).join('; ');
    const err = new Error(`AI output failed Zod schema validation: ${errorDetails}`);
    err.issues = result.error.issues;
    throw err;
  }

  return result.data;
}
