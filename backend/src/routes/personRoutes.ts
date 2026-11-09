import { Router } from 'express';
import {
  getPeople,
  getPersonDetail,
  createPerson,
  updatePerson,
  deletePerson,
} from '../controllers/personController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { PersonSchema } from '../validators/schemas.ts';

const router = Router();

router.use(authenticate);

router.get('/', getPeople);
router.get('/:id', getPersonDetail);
router.post('/', validate(PersonSchema), createPerson);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);

export default router;

