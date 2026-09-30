import { Router } from 'express';
import healthRoutes from './health.routes.js';
import meRoutes from './me.routes.js';
import farmsRoutes from './farms.routes.js';
import advisoriesRoutes from './advisories.routes.js';
import metaRoutes from './meta.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/me', meRoutes);
router.use('/farms', farmsRoutes);
router.use('/advisories', advisoriesRoutes);
router.use('/meta', metaRoutes);

export default router;
