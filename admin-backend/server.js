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

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const allowedOrigins = (origin, callback) => {
  callback(null, true);
};

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-JSON'],
  maxAge: 86400
}));

// REMOVE THIS LINE - It's causing the error:
// app.options('*', cors());  ❌ DELETE THIS LINE

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
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
