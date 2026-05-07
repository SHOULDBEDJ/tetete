import { Router } from 'express';
import { login, getProfile } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate as any, getProfile);

export default router;
