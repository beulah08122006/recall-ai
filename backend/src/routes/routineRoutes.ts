import { Router } from 'express';
import {
  getRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from '../controllers/routineController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { RoutineSchema } from '../validators/schemas.ts';

const router = Router();

router.use(authenticate);

router.get('/', getRoutines);
router.post('/', validate(RoutineSchema), createRoutine);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);

export default router;

