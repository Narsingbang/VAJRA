import { BANNED_ACTIVE_INGREDIENTS } from '../constants/bannedChemicals.js';

/**
 * Checks if a string mentions any banned active ingredients.
 * @param {string} text
 * @returns {string|null} The matched banned ingredient name or null
 */
function findBannedIngredient(text) {
  if (typeof text !== 'string') return null;
  const lower = text.toLowerCase();
  for (const banned of BANNED_ACTIVE_INGREDIENTS) {
    // Regex boundary match
    const regex = new RegExp(`\\b${banned}\\b`, 'i');
    if (regex.test(lower)) {
      return banned;
    }
  }
  return null;
}

/**
 * Post-processes AI output for safety compliance:
 * 1. Removes items containing banned/restricted agrochemicals.
 * 2. Elevates risk_level to 'high' for severe pest outbreaks (>50% area).
 * 3. Enforces safety_notes when chemicals are mentioned.
 * 
 * @param {string} module
 * @param {object} input
 * @param {object} output
 * @returns {object} The safe, compliant advisory output
 */
export function safetyPostProcessor(module, input, output) {
  const processed = JSON.parse(JSON.stringify(output));
  let removedRestricted = false;

  // 1. Check pest_disease_diagnosis treatment_options
  if (module === 'pest_disease_diagnosis' && Array.isArray(processed.treatment_options)) {
    processed.treatment_options = processed.treatment_options.filter((opt) => {
      const bannedInName = findBannedIngredient(opt.name);
      const bannedInApply = findBannedIngredient(opt.how_to_apply);
      if (bannedInName || bannedInApply) {
        removedRestricted = true;
        return false;
      }
      return true;
    });
  }

  // 2. Check fertilizer_plan schedule
  if (module === 'fertilizer_plan' && Array.isArray(processed.schedule)) {
    processed.schedule = processed.schedule.filter((item) => {
      const bannedInInput = findBannedIngredient(item.input);
      const bannedInPurpose = findBannedIngredient(item.purpose);
      if (bannedInInput || bannedInPurpose) {
        removedRestricted = true;
        return false;
      }
      return true;
    });
  }

  // If a restricted chemical was removed, add safety warning
  if (removedRestricted) {
    if (!Array.isArray(processed.warnings)) processed.warnings = [];
    processed.warnings.push('A restricted chemical was removed from this advice for farmer and environmental safety.');
  }

  // 3. Elevate risk_level to 'high' if affected area > 50% and chemical treatments exist
  if (module === 'pest_disease_diagnosis') {
    const area = Number(input.affected_area_percent ?? 0);
    const hasChemical = Array.isArray(processed.treatment_options) &&
      processed.treatment_options.some((t) => t.type === 'chemical');

    if (area > 50 && hasChemical) {
      processed.risk_level = 'high';
      processed.consult_expert = true;
      if (!processed.consult_expert_reason) {
        processed.consult_expert_reason = 'More than 50% of the crop is severely affected. Immediate on-field inspection by local agricultural authorities is strongly advised.';
      }
    }
  }

  // 4. Ensure safety_notes is non-empty if chemical inputs are recommended
  let hasChemical = false;
  if (module === 'pest_disease_diagnosis' && Array.isArray(processed.treatment_options)) {
    hasChemical = processed.treatment_options.some((t) => t.type === 'chemical');
  } else if (module === 'fertilizer_plan' && Array.isArray(processed.schedule)) {
    hasChemical = processed.schedule.some((s) => s.type === 'chemical');
  }

  if (hasChemical) {
    if (!Array.isArray(processed.safety_notes)) processed.safety_notes = [];
    if (processed.safety_notes.length === 0) {
      processed.safety_notes.push(
        'Wear appropriate PPE (gloves, mask, eye protection) when handling chemicals.',
        'Strictly follow dosage and pre-harvest interval (PHI) instructions indicated on the certified product packaging.',
        'Keep chemicals safely locked away from children, livestock, and water sources.'
      );
    }
  }

  return processed;
}
