import { describe, it, expect } from 'vitest';
import { safetyPostProcessor } from '../src/services/safetyPostProcessor.js';

describe('safetyPostProcessor', () => {
  it('strips banned agrochemicals from pest diagnosis treatments', () => {
    const input = { affected_area_percent: 10 };
    const output = {
      summary: 'Leaf spot detected',
      risk_level: 'low',
      treatment_options: [
        {
          name: 'Monocrotophos 36% SL',
          type: 'chemical',
          how_to_apply: 'Spray on leaves'
        },
        {
          name: 'Neem Oil 1500 PPM',
          type: 'organic',
          how_to_apply: 'Foliar spray'
        }
      ],
      warnings: []
    };

    const processed = safetyPostProcessor('pest_disease_diagnosis', input, output);
    expect(processed.treatment_options).toHaveLength(1);
    expect(processed.treatment_options[0].name).toBe('Neem Oil 1500 PPM');
    expect(processed.warnings.some((w) => w.includes('restricted chemical was removed'))).toBe(true);
  });

  it('elevates risk level to high when outbreak exceeds 50% with chemical inputs', () => {
    const input = { affected_area_percent: 65 };
    const output = {
      summary: 'Severe blight',
      risk_level: 'medium',
      treatment_options: [
        {
          name: 'Mancozeb 75 WP',
          type: 'chemical',
          how_to_apply: 'Spray 2g/L'
        }
      ],
      safety_notes: []
    };

    const processed = safetyPostProcessor('pest_disease_diagnosis', input, output);
    expect(processed.risk_level).toBe('high');
    expect(processed.consult_expert).toBe(true);
    expect(processed.safety_notes.length).toBeGreaterThan(0);
  });
});
