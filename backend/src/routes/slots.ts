import { Router } from 'express';
import { getSlots, createSlot, updateSlot, deleteSlot } from '../controllers/slots';

const router = Router();

router.get('/', getSlots);
router.post('/', createSlot);
router.patch('/:id', updateSlot);
router.delete('/:id', deleteSlot);

export default router;
