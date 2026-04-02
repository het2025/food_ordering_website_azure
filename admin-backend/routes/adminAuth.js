import express from 'express';
import { loginAdmin, getCurrentAdmin, updatePassword } from '../controllers/adminAuthController.js';
import { authAdmin } from '../middleware/adminAuth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/login', authLimiter, loginAdmin);

// Protected routes
router.get('/me', authAdmin, getCurrentAdmin);
router.put('/password', authAdmin, updatePassword);

export default router;
