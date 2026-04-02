import express from 'express';
import {
  getAllOrders,
  getOrdersByRestaurant,
  getOrdersByRestaurantId,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  getSampleOrder
} from '../controllers/adminOrderController.js';
import { authAdmin } from '../middleware/adminAuth.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', authAdmin, getAllOrders);
router.get('/by-restaurant', authAdmin, getOrdersByRestaurant);
router.get('/restaurant/:restaurantId', authAdmin, validateObjectId('restaurantId'), getOrdersByRestaurantId);
router.get('/stats', authAdmin, getOrderStats);
router.get('/debug/sample', authAdmin, getSampleOrder);
router.get('/:id', authAdmin, validateObjectId('id'), getOrderById);
router.put('/:id/status', authAdmin, validateObjectId('id'), updateOrderStatus);
router.put('/:id/cancel', authAdmin, validateObjectId('id'), cancelOrder);

export default router;
