import { Router } from 'express';
import { register, login, me, updateProfile } from '../controllers/authController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { RegisterSchema, LoginSchema, ProfileUpdateSchema } from '../validators/schemas.ts';

const router = Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, validate(ProfileUpdateSchema), updateProfile);

export default router;

