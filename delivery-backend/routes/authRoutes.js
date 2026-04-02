import express from 'express';
import {
  registerDelivery,
  loginDelivery,
  getCurrentDelivery,
  logoutDelivery
} from '../controllers/deliveryAuthController.js';
import { authDelivery } from '../middleware/deliveryAuth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, registerDelivery);
router.post('/login', authLimiter, loginDelivery);
router.get('/me', authDelivery, getCurrentDelivery);
router.post('/logout', authDelivery, logoutDelivery);

export default router;
