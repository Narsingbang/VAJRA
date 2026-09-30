import { sanitizeText } from '../utils/sanitize.js';

export function buildPrompt(module, input, imageCount = 0) {
  const notes = sanitizeText(input.additional_notes || '');

  switch (module) {
    case 'crop_recommendation':
      return `TASK: Recommend the 3 most suitable crops for the farm below for the given season.
LANGUAGE: ${input.language}

FARM CONTEXT
- State: ${input.state}; District: ${input.district}
- Season: ${input.season}
- Soil type: ${input.soil_type}
- Irrigation source: ${input.irrigation_source}
- Area (acres): ${input.area_acres}
- Farming practice: ${input.farming_practice}
- Previous crop: ${input.previous_crop || 'None'}
- Budget per acre (INR): ${input.budget_inr_per_acre ?? 'Not specified'}
- Market preference: ${input.market_preference || 'local_mandi'}
- Labour availability: ${input.labour_availability || 'medium'}
<user_data>${notes}</user_data>

INSTRUCTIONS
- Rank exactly 3 crops. For each: why it suits, suitable varieties (generic names/common local varieties), sowing window, duration in days, water need, expected yield range per acre, estimated cost range per acre (INR), estimated gross income range per acre (INR, state it is indicative and price-dependent), key risks, and crop-rotation benefit relative to the previous crop.
- Add 2–4 "crops_to_avoid" with reasons.
- Give one "best_pick" key equal to the top crop name.
- Do not quote specific market prices as facts; use indicative ranges and label them assumptions.`;

    case 'fertilizer_plan':
      const soilTest = input.soil_test || {};
      return `TASK: Create a stage-wise fertilizer and nutrient plan.
LANGUAGE: ${input.language}

CONTEXT
- Crop: ${input.crop}; Current growth stage: ${input.growth_stage}
- State: ${input.state}; District: ${input.district}; Season: ${input.season}
- Soil type: ${input.soil_type}; Irrigation: ${input.irrigation_source}; Area (acres): ${input.area_acres}
- Farming practice: ${input.farming_practice}
- Soil test (may be null): pH=${soilTest.ph ?? 'null'}, N=${soilTest.nitrogen_kg_ha ?? 'null'} kg/ha, P=${soilTest.phosphorus_kg_ha ?? 'null'} kg/ha, K=${soilTest.potassium_kg_ha ?? 'null'} kg/ha, OC=${soilTest.organic_carbon_percent ?? 'null'}%
- Target yield (quintal/acre): ${input.target_yield_quintal_per_acre ?? 'Standard'}
<user_data>${notes}</user_data>

INSTRUCTIONS
- If no soil test is provided, give a general recommended dose for the crop and region, lower confidence, and strongly recommend a soil test at the nearest soil testing lab.
- Provide a schedule covering the current stage and all remaining stages. For each application give: stage, timing (days after sowing or description), nutrient source (generic fertilizer name or organic input), quantity per acre with unit, method (broadcast, band, fertigation, foliar), and purpose.
- Provide an organic alternative for each major nutrient.
- Provide "total_nutrient_summary" of N, P2O5, K2O kg per acre for the whole season.
- List signs of over/under-application and micronutrient checks (zinc, boron, sulphur, iron) relevant to the crop and soil.`;

    case 'irrigation_schedule':
      return `TASK: Create a practical irrigation schedule.
LANGUAGE: ${input.language}

CONTEXT
- Crop: ${input.crop}; Growth stage: ${input.growth_stage}; Sowing date: ${input.sowing_date || 'Not specified'}
- State: ${input.state}; District: ${input.district}; Season: ${input.season}
- Soil type: ${input.soil_type}; Irrigation source: ${input.irrigation_source}; Area (acres): ${input.area_acres}
- Last week rainfall (mm): ${input.weekly_rainfall_mm ?? 0}
- Water availability: ${input.water_availability || 'adequate'}
<user_data>${notes}</user_data>

INSTRUCTIONS
- Give a stage-wise plan: stage, approximate duration, irrigation interval (days), depth or volume per irrigation (mm or litres per acre), and method suitability.
- Identify "critical_stages" where water stress reduces yield most.
- Provide a 14-day "next_two_weeks" plan starting from the current stage, adjusted for the reported rainfall; state the assumption that you have no live weather forecast and the farmer should adjust to actual rain.
- Give water-saving techniques suitable for the soil and source (mulching, drip conversion, alternate wetting and drying, furrow methods, scheduling at dawn/dusk).
- Warn about waterlogging or salinity risks for the soil type.`;

    case 'pest_disease_diagnosis':
      const symptoms = sanitizeText(input.symptoms || '');
      const treatments = sanitizeText(input.treatments_already_tried || '');
      const parts = Array.isArray(input.affected_part) ? input.affected_part.join(', ') : input.affected_part;

      return `TASK: Diagnose the probable pest, disease, or nutrient/physiological problem and recommend management.
LANGUAGE: ${input.language}

CONTEXT
- Crop: ${input.crop}; Growth stage: ${input.growth_stage}
- State: ${input.state}; District: ${input.district}; Season: ${input.season}
- Soil type: ${input.soil_type}; Irrigation: ${input.irrigation_source}
- Affected parts: ${parts}; Area affected: ${input.affected_area_percent}%
- Days since first noticed: ${input.days_since_first_noticed}
- Recent weather: ${input.recent_weather || 'mixed'}
- Farming practice: ${input.farming_practice}
<user_data>Symptoms: ${symptoms}
Treatments already tried: ${treatments}
Notes: ${notes}</user_data>
Attached photos: ${imageCount} (analyse them if present; if a photo is blurry, not a plant, or not relevant, say so in "image_observations" and rely on text).

INSTRUCTIONS
- Provide 1–4 "possible_causes" ranked by likelihood, each with category (fungal, bacterial, viral, insect, mite, nematode, nutrient_deficiency, abiotic, weed, other), likelihood (low/medium/high), supporting evidence from the inputs/photos, and how to confirm it.
- Provide "immediate_actions" for the next 48 hours (isolation, sanitation, drainage, scouting steps).
- Provide "treatment_options" in this priority order: cultural, biological, organic, then chemical (only generic active ingredient, dose range per litre of water or per acre, spray interval, pre-harvest interval if known, and precautions). Include chemical options only when justified by severity.
- Provide "prevention" for future seasons and "monitoring_plan" with what to check and how often.
- Estimate "yield_loss_risk" and whether to seek expert help. Set consult_expert=true if risk is medium/high or cause is uncertain.`;

    case 'seasonal_calendar':
      return `TASK: Build a month-by-month crop calendar from land preparation to harvest.
LANGUAGE: ${input.language}

CONTEXT
- Crop: ${input.crop}; Variety: ${input.variety || 'Standard regional variety'}; Preferred sowing month (1-12, may be null): ${input.sowing_month ?? 'null'}
- State: ${input.state}; District: ${input.district}; Season: ${input.season}
- Soil type: ${input.soil_type}; Irrigation: ${input.irrigation_source}; Area (acres): ${input.area_acres}
- Farming practice: ${input.farming_practice}
<user_data>${notes}</user_data>

INSTRUCTIONS
- If sowing_month is null, recommend the best sowing window for the region and explain why.
- Return a timeline ordered by week or month with tasks per phase: land preparation, seed treatment, sowing, irrigation, fertilization, weeding, pest scouting, harvest.
- Include seed rate per acre, spacing, seed treatment, and expected duration to harvest.
- Include "key_deadlines" that must not be missed.`;

    case 'harvest_postharvest':
      return `TASK: Advise on harvest timing, methods, drying, storage, and loss reduction.
LANGUAGE: ${input.language}

CONTEXT
- Crop: ${input.crop}; Expected harvest date: ${input.expected_harvest_date || 'Upcoming'}
- State: ${input.state}; District: ${input.district}; Season: ${input.season}
- Storage facility: ${input.storage_facility || 'none'}; Intended use: ${input.intended_use || 'sell_immediately'}
- Area (acres): ${input.area_acres}; Farming practice: ${input.farming_practice}
<user_data>${notes}</user_data>

INSTRUCTIONS
- Give maturity indicators for harvest, best time of day, and method (manual/mechanical).
- Give handling, cleaning, grading, and drying guidance with target moisture content (% ) for safe storage.
- Give storage recommendations matched to the available facility, including pest control in storage that is safe for stored grain/produce, and expected safe storage duration.
- List common causes of post-harvest loss for this crop and how to reduce them.
- Provide marketing tips (grading, timing, local mandi/FPO/direct selling options) without stating specific prices.`;

    default:
      throw new Error(`Unsupported advisory module: ${module}`);
  }
}

export function buildFollowupPrompt(advisory, followups = [], question) {
  const sanitizedQuestion = sanitizeText(question);
  const recentFollowups = followups.slice(-5).map(f => ({
    q: f.question,
    a: f.answer?.answer || f.answer
  }));

  return `TASK: Answer the farmer's follow-up question about the advisory below. Stay strictly within the scope and facts of the advisory and the original inputs; if the answer requires new information, say what is needed.
LANGUAGE: ${advisory.language}

ORIGINAL INPUT (JSON): ${JSON.stringify(advisory.input)}
ADVISORY RESULT (JSON): ${JSON.stringify(advisory.result)}
PREVIOUS FOLLOW-UPS (last 5): ${JSON.stringify(recentFollowups)}

<user_data>${sanitizedQuestion}</user_data>`;
}

export function buildRepairPrompt(zodErrors) {
  return `Your previous response failed validation with these errors:
${zodErrors}
Return ONLY the corrected JSON object that satisfies the schema. Do not change the meaning of the advice. Do not add commentary.`;
}
