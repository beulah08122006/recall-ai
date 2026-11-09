import { Router } from 'express';
import {
  getCarryItems,
  createCarryItem,
  updateCarryItem,
  toggleCarryChecked,
  deleteCarryItem,
  clearCompletedCarry,
} from '../controllers/carryController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { CarryItemSchema } from '../validators/schemas.ts';

const router = Router();

router.use(authenticate);

router.get('/', getCarryItems);
router.post('/', validate(CarryItemSchema), createCarryItem);
router.put('/:id', updateCarryItem);
router.patch('/:id/toggle', toggleCarryChecked);
router.delete('/:id', deleteCarryItem);
router.post('/clear-completed', clearCompletedCarry);

export default router;

