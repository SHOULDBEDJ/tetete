import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getProfile);
router.patch('/', authenticate, updateProfile);

export default router;
