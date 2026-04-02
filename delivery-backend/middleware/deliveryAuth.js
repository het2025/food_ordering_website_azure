import jwt from 'jsonwebtoken';
import { DeliveryBoy } from '../models/DeliveryBoy.js';

export const authDelivery = async (req, res, next) => {
  try {
    // Hard fail if JWT_SECRET is not configured
    if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET environment variable is not set');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing'
      });
    }

    // No fallback — if JWT_SECRET is wrong or missing, this throws
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!deliveryBoy) {
      return res.status(401).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }

    if (!deliveryBoy.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    req.deliveryBoy = deliveryBoy;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    console.error('Auth delivery error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};
