import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('join_restaurant', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`👨‍🍳 Client ${socket.id} joined restaurant room: restaurant_${restaurantId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// CORS
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Restaurant Owner backend is running',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5004
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Restaurant Owner backend API – Use /api/health for status' });
});

// ✅ MOUNT ALL ROUTES
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes mounted at /api/auth');

app.use('/api/profile', profileRoutes);
console.log('✅ Profile routes mounted at /api/profile');

app.use('/api/menu', menuRoutes);
console.log('✅ Menu routes mounted at /api/menu');

app.use('/api/orders', orderRoutes);
console.log('✅ Order routes mounted at /api/orders');

app.use('/api/dashboard', dashboardRoutes);
console.log('✅ Dashboard routes mounted at /api/dashboard');

app.use('/api/payouts', payoutRoutes);
console.log('✅ Payout routes mounted at /api/payouts');

// 404 Handler
app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, error: err.message })
  });
});

const PORT = process.env.PORT || 5004;

const startServer = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Handle EADDRINUSE gracefully - retry after waiting
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${PORT} is busy. Retrying in 3 seconds...`);
        setTimeout(() => {
          server.close();
          server.listen(PORT);
        }, 3000);
      } else {
        console.error('Server error:', e);
        process.exit(1);
      }
    });

    server.listen(PORT, () => {
      console.log(`🚀 Restaurant Owner backend listening on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
      console.log(`🔌 Socket.IO initialized on port ${PORT}`);
    });

    // Graceful shutdown — SIGINT works on Windows (Ctrl+C / nodemon restart)
    const gracefulShutdown = (signal) => {
      console.log(`🛑 ${signal} received. Closing server gracefully...`);
      server.close(() => {
        console.log('✅ Server closed. Port released.');
        process.exit(0);
      });
      // Force exit after 5 seconds if close hangs
      setTimeout(() => {
        console.warn('⚠️ Forcing exit after timeout');
        process.exit(0);
      }, 5000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    console.error('💥 Check .env for MONGO_URI or network issues');
    process.exit(1);
  }
};

startServer();
