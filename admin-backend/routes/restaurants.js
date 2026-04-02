import express from 'express';
import {
  getAllRestaurants,
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,
  updateRestaurantStatus,
  deleteRestaurant
} from '../controllers/adminRestaurantController.js';
import { authAdmin } from '../middleware/adminAuth.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', authAdmin, getAllRestaurants);
router.get('/pending', authAdmin, getPendingRestaurants);
router.post('/:id/approve', authAdmin, validateObjectId('id'), approveRestaurant);
router.post('/:id/reject', authAdmin, validateObjectId('id'), rejectRestaurant);
router.put('/:id/status', authAdmin, validateObjectId('id'), updateRestaurantStatus);
router.delete('/:id', authAdmin, validateObjectId('id'), deleteRestaurant);

export default router;
