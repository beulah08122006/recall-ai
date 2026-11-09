import { Router } from 'express';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  markReturned,
  deleteItem,
} from '../controllers/itemController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { ItemSchema } from '../validators/schemas.ts';

const router = Router();

router.use(authenticate);

router.get('/', getItems);
router.get('/:id', getItem);
router.post('/', validate(ItemSchema), createItem);
router.put('/:id', updateItem);
router.patch('/:id/returned', markReturned);
router.delete('/:id', deleteItem);

export default router;

