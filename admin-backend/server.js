import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import adminAuthRoutes from './routes/adminAuth.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import restaurantRoutes from './routes/restaurants.js';
import orderRoutes from './routes/orders.js';
import payoutRoutes from './routes/adminPayoutRoutes.js';
import analyticsRoutes from './routes/adminAnalyticsRoutes.js';
import deliveryUsersRoutes from './routes/deliveryUsers.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://gray-mud-0b9e65000.6.azurestaticapps.net' // Add your frontend domain explicitly
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Give access to any origin for now to prevent blocking on production
    // You can restrict this later if needed.
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-JSON'],
  maxAge: 86400
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/delivery-users', deliveryUsersRoutes);
app.use('/api/admin/restaurants', restaurantRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/admin/payouts', payoutRoutes); // ✅ NEW: Payout routes
app.use('/api/admin/analytics', analyticsRoutes); // ✅ NEW: Analytics routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Centralized error handling middleware (must be AFTER all routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Admin Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
