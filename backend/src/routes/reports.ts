import { Router } from 'express';
import { getDashboardStats, getFullReport } from '../controllers/reports';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/', getFullReport);

export default router;
