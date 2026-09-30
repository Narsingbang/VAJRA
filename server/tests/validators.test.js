import { describe, it, expect } from 'vitest';
import { commonInputSchema } from '../src/validators/common.js';
import { advisoryInputSchema } from '../src/validators/inputs.js';
import { farmCreateSchema } from '../src/validators/farms.js';

describe('Validators', () => {
  it('validates common input with proper types and enums', () => {
    const valid = {
      state: 'Maharashtra',
      district: 'Nashik',
      season: 'kharif',
      soil_type: 'black_cotton',
      irrigation_source: 'borewell',
      area_acres: 3.5,
      farming_practice: 'conventional',
      language: 'en'
    };

    const res = commonInputSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects invalid area_acres and soil_type in common input', () => {
    const invalid = {
      state: 'M',
      district: 'N',
      season: 'invalid_season',
      soil_type: 'plastic_soil',
      irrigation_source: 'borewell',
      area_acres: -5
    };

    const res = commonInputSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('validates farm creation schema', () => {
    const farm = {
      name: 'South Field',
      state: 'Gujarat',
      district: 'Rajkot',
      area_acres: 5,
      soil_type: 'alluvial',
      irrigation_source: 'canal'
    };

    const res = farmCreateSchema.safeParse(farm);
    expect(res.success).toBe(true);
  });
});
