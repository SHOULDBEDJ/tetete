import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings';

const router = Router();

router.get('/', getSettings);
router.patch('/', updateSettings);

export default router;
