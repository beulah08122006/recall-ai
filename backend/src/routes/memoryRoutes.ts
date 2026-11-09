import { Router } from 'express';
import {
  getMemories,
  getMemory,
  createMemory,
  updateMemory,
  deleteMemory,
} from '../controllers/memoryController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { MemorySchema } from '../validators/schemas.ts';

const router = Router();

router.use(authenticate);

router.get('/', getMemories);
router.get('/:id', getMemory);
router.post('/', validate(MemorySchema), createMemory);
router.put('/:id', updateMemory);
router.delete('/:id', deleteMemory);

export default router;

