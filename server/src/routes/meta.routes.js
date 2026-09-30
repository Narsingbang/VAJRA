import { Router } from 'express';
import {
  ADVISORY_MODULES,
  APP_LANGUAGES,
  SEASONS,
  SOIL_TYPES,
  IRRIGATION_SOURCES,
  CROP_CATEGORIES,
  FARMING_PRACTICES,
  GROWTH_STAGES,
  MARKET_PREFERENCES,
  LABOUR_AVAILABILITY,
  WATER_AVAILABILITY,
  RECENT_WEATHER,
  PLANT_PARTS,
  STORAGE_FACILITIES,
  INTENDED_USES,
  APPLICATION_METHODS,
  IRRIGATION_METHODS,
  PEST_CATEGORIES,
  TREATMENT_TYPES
} from '../constants/enums.js';

const router = Router();

router.get('/options', (req, res) => {
  res.json({
    success: true,
    data: {
      modules: ADVISORY_MODULES,
      languages: APP_LANGUAGES,
      seasons: SEASONS,
      soil_types: SOIL_TYPES,
      irrigation_sources: IRRIGATION_SOURCES,
      crop_categories: CROP_CATEGORIES,
      farming_practices: FARMING_PRACTICES,
      growth_stages: GROWTH_STAGES,
      market_preferences: MARKET_PREFERENCES,
      labour_availability: LABOUR_AVAILABILITY,
      water_availability: WATER_AVAILABILITY,
      recent_weather: RECENT_WEATHER,
      plant_parts: PLANT_PARTS,
      storage_facilities: STORAGE_FACILITIES,
      intended_uses: INTENDED_USES,
      application_methods: APPLICATION_METHODS,
      irrigation_methods: IRRIGATION_METHODS,
      pest_categories: PEST_CATEGORIES,
      treatment_types: TREATMENT_TYPES
    }
  });
});

export default router;
