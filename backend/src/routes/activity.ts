import { Router } from 'express';
import { getActivityLogs, createActivityLog } from '../controllers/activity';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getActivityLogs);
router.post('/', authenticate, createActivityLog);

export default router;
