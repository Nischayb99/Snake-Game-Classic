import dotenv from 'dotenv';
import { validateEnvVars } from './config/envValidation.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';

// Config imports
import connectDB from './config/db.js';
import { PORT, ALLOWED_ORIGINS } from './config/constants.js';
import { setupCors } from './config/cors.js';
import { setupSession } from './config/session.js';

// Middleware imports
import { setupSecurity } from './middleware/security.js';
import { setupRateLimiting } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import rootRoutes from './routes/rootRoutes.js';

// Utils imports
import { setupProcessHandlers } from './utils/helpers.js';

// Load environment variables
dotenv.config();

// Validate environment variables (skip in production to avoid crashes)
if (process.env.NODE_ENV !== 'production') {
  validateEnvVars();
}

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Setup security middleware
setupSecurity(app);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Setup CORS
setupCors(app);

// Setup rate limiting
setupRateLimiting(app);

// Session configuration
setupSession(app);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/', rootRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);

// Error handling middleware
app.use(errorHandler);
app.use('*', notFoundHandler);

// Setup process handlers
setupProcessHandlers();

// Start server - Render friendly logging
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Snake Game API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.NODE_ENV === 'production') {
    console.log('🚀 Production mode - Ready for requests');
    console.log(`🔗 Health Check: https://your-app.onrender.com/api/health`);
  } else {
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  }
});

// Handle server startup errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
});

export default app;