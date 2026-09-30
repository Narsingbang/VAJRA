import { Router } from 'express';
import {
  listFarms,
  createFarm,
  updateFarm,
  deleteFarm
} from '../controllers/farms.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { farmCreateSchema, farmUpdateSchema } from '../validators/farms.js';
import { uuidParamSchema } from '../validators/misc.js';

const router = Router();

router.use(requireAuth);

router.get('/', listFarms);
router.post('/', validate(farmCreateSchema, 'body'), createFarm);
router.patch('/:id', validate(uuidParamSchema, 'params'), validate(farmUpdateSchema, 'body'), updateFarm);
router.delete('/:id', validate(uuidParamSchema, 'params'), deleteFarm);

export default router;
