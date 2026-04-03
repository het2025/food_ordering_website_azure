import express from 'express';
import { getDeliveryUsers } from '../controllers/adminDeliveryUserController.js';
import { authAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authAdmin);

router.route('/')
  .get(getDeliveryUsers);

export default router;
