import { Router } from 'express';
import { getUsers, updateUserStatus, createUser, updateUser, deleteUser } from '../controllers/users';

const router = Router();

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/status', updateUserStatus);

export default router;
