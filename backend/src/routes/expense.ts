import { Router } from 'express';
import { 
    getExpenses, 
    createExpense, 
    deleteExpense, 
    getExpenseTypes,
    createExpenseType,
    deleteExpenseType,
    updateExpenseType
} from '../controllers/expense';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth to all routes
router.use(authenticate as any);

router.get('/types', getExpenseTypes);
router.post('/types', createExpenseType);
router.patch('/types/:id', updateExpenseType);
router.delete('/types/:id', deleteExpenseType);

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);

export default router;
