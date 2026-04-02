import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser
} from '../controllers/adminUserController.js';
import { authAdmin } from '../middleware/adminAuth.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', authAdmin, getAllUsers);
router.get('/:id', authAdmin, validateObjectId('id'), getUserById);
router.put('/:id/status', authAdmin, validateObjectId('id'), updateUserStatus);
router.delete('/:id', authAdmin, validateObjectId('id'), deleteUser);

export default router;
