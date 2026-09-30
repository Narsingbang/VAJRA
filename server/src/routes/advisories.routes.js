import { Router } from 'express';
import {
  createAdvisoryHandler,
  listAdvisoriesHandler,
  getAdvisoryHandler,
  deleteAdvisoryHandler,
  askFollowupHandler,
  submitFeedbackHandler
} from '../controllers/advisories.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { handleAdvisoryUpload } from '../middleware/upload.js';
import { aiRequestLimiter } from '../middleware/rateLimit.js';
import { advisoryInputSchema } from '../validators/inputs.js';
import {
  listQuerySchema,
  uuidParamSchema,
  followupSchema,
  feedbackSchema
} from '../validators/misc.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  aiRequestLimiter,
  handleAdvisoryUpload,
  validate(advisoryInputSchema, 'body'),
  createAdvisoryHandler
);

router.get('/', validate(listQuerySchema, 'query'), listAdvisoriesHandler);

router.get('/:id', validate(uuidParamSchema, 'params'), getAdvisoryHandler);

router.delete('/:id', validate(uuidParamSchema, 'params'), deleteAdvisoryHandler);

router.post(
  '/:id/followups',
  aiRequestLimiter,
  validate(uuidParamSchema, 'params'),
  validate(followupSchema, 'body'),
  askFollowupHandler
);

router.put(
  '/:id/feedback',
  validate(uuidParamSchema, 'params'),
  validate(feedbackSchema, 'body'),
  submitFeedbackHandler
);

export default router;
