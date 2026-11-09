import { Router } from 'express';
import {
  ask,
  getHistory,
  clearHistory,
  extractEntity,
  getBriefing,
  checkContradiction,
} from '../controllers/assistantController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { ChatMessageSchema } from '../validators/schemas.ts';

const router = Router();

router.use(authenticate);

router.post('/ask', validate(ChatMessageSchema), ask);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

// Phase 1 Intelligence Features
router.post('/extract', extractEntity);
router.get('/briefing', getBriefing);
router.post('/check-contradiction', checkContradiction);

export default router;

