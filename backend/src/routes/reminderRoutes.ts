import { Router } from 'express';
import {
  getReminders,
  getUpcoming,
  createReminder,
  updateReminder,
  toggleComplete,
  deleteReminder,
} from '../controllers/reminderController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { ReminderSchema } from '../validators/schemas.ts';

const router = Router();

router.use(authenticate);

router.get('/', getReminders);
router.get('/upcoming', getUpcoming);
router.post('/', validate(ReminderSchema), createReminder);
router.put('/:id', updateReminder);
router.patch('/:id/toggle', toggleComplete);
router.delete('/:id', deleteReminder);

export default router;

