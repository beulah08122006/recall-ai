import { Router } from 'express';
import { getInsights } from '../controllers/insightController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authenticate);

router.get('/', getInsights);

export default router;

