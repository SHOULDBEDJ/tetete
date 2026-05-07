import { Router } from 'express';
import { 
    getIncomes, 
    createIncome, 
    deleteIncome, 
    getIncomeTypes,
    createIncomeType,
    deleteIncomeType,
    updateIncomeType
} from '../controllers/income';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth to all routes
router.use(authenticate as any);

router.get('/types', getIncomeTypes);
router.post('/types', createIncomeType);
router.patch('/types/:id', updateIncomeType);
router.delete('/types/:id', deleteIncomeType);

router.get('/', getIncomes);
router.post('/', createIncome);
router.delete('/:id', deleteIncome);

export default router;
