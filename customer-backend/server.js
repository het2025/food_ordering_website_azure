import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';

// Import models
import './models/index.js';

// Import routes
import locationRoutes from './routes/locationRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import geocodeRoutes from './routes/geocodeRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import userRoutes from './routes/users.js';
import addressRoutes from './routes/addresses.js';
import aiRoutes from './routes/aiRoutes.js';
import pincodeRoutes from './routes/pincodeRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Define allowed origins
const allowedOrigins = process.env.NODE_ENV === 'development'
  ? true  // Allow all origins in development (enables mobile access on local network)
  : process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
      // Allow local network IP addresses
      /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):(5173|5174|5175|3000)$/
    ].filter(Boolean);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`👤 Client ${socket.id} joined room: order_${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Root Route
app.use(generalLimiter);
app.get('/', (req, res) => {
  res.json({
    message: 'QuickBites API is running successfully! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      users: '/api/users',
      orders: '/api/orders',
      addresses: '/api/addresses',
      location: '/api/location',
      geocode: '/api/geocode',
      reviews: '/api/reviews',
      pincodes: '/api/pincodes'
    }
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pincodes', pincodeRoutes);

// Debug log for geocode routes
console.log('📍 Geocode routes registered at /api/geocode');

// Error handling middleware (must be after all routes)
app.use(errorHandler);

// 404 handler (must be last)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/auth',
      '/api/restaurants',
      '/api/users',
      '/api/orders',
      '/api/addresses',
      '/api/location',
      '/api/geocode',
      '/api/reviews',
      '/api/pincodes'
    ]
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`🗺️  Geocode endpoint: http://localhost:${PORT}/api/geocode`);
  console.log('\n✅ Available routes:');
  console.log('   - GET  /api/geocode/reverse?lat=22.3&lng=73.1');
  console.log('   - GET  /api/geocode/search?query=Alkapuri');
  console.log('\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
