import {
  CROP_CATEGORIES,
  APPLICATION_METHODS,
  IRRIGATION_METHODS,
  PEST_CATEGORIES,
  TREATMENT_TYPES
} from '../constants/enums.js';

const commonProperties = {
  summary: { type: 'string' },
  assumptions: { type: 'array', items: { type: 'string' } },
  risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
  confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
  warnings: { type: 'array', items: { type: 'string' } },
  safety_notes: { type: 'array', items: { type: 'string' } },
  consult_expert: { type: 'boolean' },
  consult_expert_reason: { type: ['string', 'null'] },
  disclaimer: { type: 'string' }
};

const commonRequired = [
  'summary',
  'assumptions',
  'risk_level',
  'confidence',
  'warnings',
  'safety_notes',
  'consult_expert',
  'consult_expert_reason',
  'disclaimer'
];

export const cropRecommendationSchema = {
  type: 'object',
  properties: {
    ...commonProperties,
    best_pick: { type: 'string' },
    recommendations: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          rank: { type: 'integer', minimum: 1, maximum: 3 },
          crop: { type: 'string' },
          category: { type: 'string', enum: CROP_CATEGORIES },
          why_suitable: { type: 'string' },
          varieties: { type: 'array', items: { type: 'string' } },
          sowing_window: { type: 'string' },
          duration_days: { type: 'integer' },
          water_need: { type: 'string', enum: ['low', 'medium', 'high'] },
          expected_yield_range: { type: 'string' },
          cost_range_inr_per_acre: { type: 'string' },
          income_range_inr_per_acre: { type: 'string' },
          rotation_benefit: { type: 'string' },
          key_risks: { type: 'array', items: { type: 'string' } }
        },
        required: [
          'rank',
          'crop',
          'category',
          'why_suitable',
          'varieties',
          'sowing_window',
          'duration_days',
          'water_need',
          'expected_yield_range',
          'cost_range_inr_per_acre',
          'income_range_inr_per_acre',
          'rotation_benefit',
          'key_risks'
        ],
        additionalProperties: false
      }
    },
    crops_to_avoid: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          crop: { type: 'string' },
          reason: { type: 'string' }
        },
        required: ['crop', 'reason'],
        additionalProperties: false
      }
    }
  },
  required: [...commonRequired, 'best_pick', 'recommendations', 'crops_to_avoid'],
  additionalProperties: false
};

export const fertilizerPlanSchema = {
  type: 'object',
  properties: {
    ...commonProperties,
    soil_interpretation: { type: 'string' },
    total_nutrient_summary: {
      type: 'object',
      properties: {
        n_kg_per_acre: { type: 'string' },
        p2o5_kg_per_acre: { type: 'string' },
        k2o_kg_per_acre: { type: 'string' }
      },
      required: ['n_kg_per_acre', 'p2o5_kg_per_acre', 'k2o_kg_per_acre'],
      additionalProperties: false
    },
    schedule: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stage: { type: 'string' },
          timing: { type: 'string' },
          input: { type: 'string' },
          quantity_per_acre: { type: 'string' },
          method: {
            type: 'string',
            enum: APPLICATION_METHODS
          },
          purpose: { type: 'string' },
          type: { type: 'string', enum: ['organic', 'chemical'] }
        },
        required: ['stage', 'timing', 'input', 'quantity_per_acre', 'method', 'purpose', 'type'],
        additionalProperties: false
      }
    },
    organic_alternatives: { type: 'array', items: { type: 'string' } },
    micronutrient_checks: { type: 'array', items: { type: 'string' } },
    deficiency_or_excess_signs: { type: 'array', items: { type: 'string' } },
    soil_test_recommended: { type: 'boolean' }
  },
  required: [
    ...commonRequired,
    'soil_interpretation',
    'total_nutrient_summary',
    'schedule',
    'organic_alternatives',
    'micronutrient_checks',
    'deficiency_or_excess_signs',
    'soil_test_recommended'
  ],
  additionalProperties: false
};

export const irrigationScheduleSchema = {
  type: 'object',
  properties: {
    ...commonProperties,
    total_seasonal_water_need_mm: { type: 'string' },
    recommended_method: {
      type: 'string',
      enum: IRRIGATION_METHODS
    },
    critical_stages: { type: 'array', items: { type: 'string' } },
    stage_plan: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stage: { type: 'string' },
          duration: { type: 'string' },
          interval_days: { type: 'string' },
          quantity_per_irrigation: { type: 'string' },
          notes: { type: 'string' }
        },
        required: ['stage', 'duration', 'interval_days', 'quantity_per_irrigation', 'notes'],
        additionalProperties: false
      }
    },
    next_two_weeks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day_range: { type: 'string' },
          action: { type: 'string' },
          condition: { type: 'string' }
        },
        required: ['day_range', 'action', 'condition'],
        additionalProperties: false
      }
    },
    water_saving_tips: { type: 'array', items: { type: 'string' } },
    waterlogging_or_salinity_risks: { type: 'array', items: { type: 'string' } }
  },
  required: [
    ...commonRequired,
    'total_seasonal_water_need_mm',
    'recommended_method',
    'critical_stages',
    'stage_plan',
    'next_two_weeks',
    'water_saving_tips',
    'waterlogging_or_salinity_risks'
  ],
  additionalProperties: false
};

export const pestDiseaseDiagnosisSchema = {
  type: 'object',
  properties: {
    ...commonProperties,
    image_observations: { type: ['string', 'null'] },
    possible_causes: {
      type: 'array',
      minItems: 1,
      maxItems: 4,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: {
            type: 'string',
            enum: PEST_CATEGORIES
          },
          likelihood: { type: 'string', enum: ['low', 'medium', 'high'] },
          evidence: { type: 'string' },
          how_to_confirm: { type: 'string' }
        },
        required: ['name', 'category', 'likelihood', 'evidence', 'how_to_confirm'],
        additionalProperties: false
      }
    },
    immediate_actions: { type: 'array', items: { type: 'string' } },
    treatment_options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: TREATMENT_TYPES },
          name: { type: 'string' },
          how_to_apply: { type: 'string' },
          dose: { type: ['string', 'null'] },
          frequency: { type: ['string', 'null'] },
          pre_harvest_interval: { type: ['string', 'null'] },
          precautions: { type: 'array', items: { type: 'string' } }
        },
        required: ['type', 'name', 'how_to_apply', 'dose', 'frequency', 'pre_harvest_interval', 'precautions'],
        additionalProperties: false
      }
    },
    prevention: { type: 'array', items: { type: 'string' } },
    monitoring_plan: { type: 'array', items: { type: 'string' } },
    yield_loss_risk: { type: 'string', enum: ['low', 'medium', 'high'] }
  },
  required: [
    ...commonRequired,
    'image_observations',
    'possible_causes',
    'immediate_actions',
    'treatment_options',
    'prevention',
    'monitoring_plan',
    'yield_loss_risk'
  ],
  additionalProperties: false
};

export const seasonalCalendarSchema = {
  type: 'object',
  properties: {
    ...commonProperties,
    recommended_sowing_window: { type: 'string' },
    duration_to_harvest_days: { type: 'integer' },
    seed_rate_per_acre: { type: 'string' },
    spacing: { type: 'string' },
    seed_treatment: { type: 'string' },
    timeline: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          period: { type: 'string' },
          phase: {
            type: 'string',
            enum: [
              'land_preparation',
              'sowing',
              'germination',
              'vegetative',
              'flowering',
              'fruiting',
              'maturity',
              'harvest'
            ]
          },
          tasks: { type: 'array', items: { type: 'string' } }
        },
        required: ['period', 'phase', 'tasks'],
        additionalProperties: false
      }
    },
    key_deadlines: { type: 'array', items: { type: 'string' } }
  },
  required: [
    ...commonRequired,
    'recommended_sowing_window',
    'duration_to_harvest_days',
    'seed_rate_per_acre',
    'spacing',
    'seed_treatment',
    'timeline',
    'key_deadlines'
  ],
  additionalProperties: false
};

export const harvestPostharvestSchema = {
  type: 'object',
  properties: {
    ...commonProperties,
    maturity_indicators: { type: 'array', items: { type: 'string' } },
    harvest_method: { type: 'string' },
    best_harvest_time: { type: 'string' },
    handling_and_grading: { type: 'array', items: { type: 'string' } },
    drying: {
      type: 'object',
      properties: {
        method: { type: 'string' },
        target_moisture_percent: { type: 'string' },
        duration: { type: 'string' }
      },
      required: ['method', 'target_moisture_percent', 'duration'],
      additionalProperties: false
    },
    storage: {
      type: 'object',
      properties: {
        recommendation: { type: 'string' },
        safe_duration: { type: 'string' },
        storage_pest_control: { type: 'array', items: { type: 'string' } }
      },
      required: ['recommendation', 'safe_duration', 'storage_pest_control'],
      additionalProperties: false
    },
    common_losses_and_fixes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          loss: { type: 'string' },
          fix: { type: 'string' }
        },
        required: ['loss', 'fix'],
        additionalProperties: false
      }
    },
    marketing_tips: { type: 'array', items: { type: 'string' } }
  },
  required: [
    ...commonRequired,
    'maturity_indicators',
    'harvest_method',
    'best_harvest_time',
    'handling_and_grading',
    'drying',
    'storage',
    'common_losses_and_fixes',
    'marketing_tips'
  ],
  additionalProperties: false
};

export const followupJsonSchema = {
  type: 'object',
  properties: {
    answer: { type: 'string' },
    action_steps: { type: 'array', items: { type: 'string' } },
    warnings: { type: 'array', items: { type: 'string' } },
    consult_expert: { type: 'boolean' },
    disclaimer: { type: 'string' }
  },
  required: ['answer', 'action_steps', 'warnings', 'consult_expert', 'disclaimer'],
  additionalProperties: false
};

export const outputJsonSchemas = {
  crop_recommendation: cropRecommendationSchema,
  fertilizer_plan: fertilizerPlanSchema,
  irrigation_schedule: irrigationScheduleSchema,
  pest_disease_diagnosis: pestDiseaseDiagnosisSchema,
  seasonal_calendar: seasonalCalendarSchema,
  harvest_postharvest: harvestPostharvestSchema,
  followup: followupJsonSchema
};
