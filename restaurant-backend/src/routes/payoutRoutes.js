import express from 'express';
import { requestPayout, getPayouts } from '../controllers/restaurantOwnerPayoutController.js';
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js';

const router = express.Router();

router.use(authRestaurantOwner);

router.post('/request', requestPayout);
router.get('/', getPayouts);

export default router;
