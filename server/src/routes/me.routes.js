import { Router } from 'express';
import { getMe, updateMe, deleteAccount } from '../controllers/me.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { profileUpdateSchema } from '../validators/misc.js';

const router = Router();

router.use(requireAuth);

router.get('/', getMe);
router.patch('/', validate(profileUpdateSchema, 'body'), updateMe);
router.delete('/', deleteAccount);

export default router;
