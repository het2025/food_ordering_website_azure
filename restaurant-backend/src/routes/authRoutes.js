import express from 'express';
import {
  registerRestaurantOwner,
  loginRestaurantOwner,
  getCurrentRestaurantOwner,
  updateRestaurantOwnerProfile,
  updateRestaurantOwnerPassword,
  logoutRestaurantOwner
} from '../controllers/restaurantOwnerAuthController.js';  // Ensure controller exists
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js';  // Middleware verifies JWT, sets req.user

import { upload } from '../middleware/uploadMiddleware.js';
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

// Public routes (no auth)
router.post('/register', authLimiter, upload.single('image'), registerRestaurantOwner);  // Creates RestaurantOwner, auto-logs in
router.post('/login', authLimiter, loginRestaurantOwner);  // Validates creds, returns token

// Protected routes (require valid token)
router.get('/me', authRestaurantOwner, getCurrentRestaurantOwner);  // Returns current user profile
router.put('/profile', authRestaurantOwner, updateRestaurantOwnerProfile);  // Updates user info (e.g., name, email)
router.put('/password', authRestaurantOwner, updateRestaurantOwnerPassword);  // Updates password (old/new validation)
router.post('/logout', authRestaurantOwner, logoutRestaurantOwner); // Track lastLogout

export default router;
