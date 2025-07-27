import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import session from 'express-session';
import passport from 'passport';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for deployment platforms (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for development, configure for production
}));

// Compression middleware for better performance
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for game data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Enhanced CORS setup for development and production
const allowedOrigins = [
  process.env.PRODUCTION_FRONTEND_URL,
  process.env.LOCALHOST_FRONTEND_URL,
  'https://snake-game-classic.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173', // Vite preview
  'https://snake-game-2-61m3.onrender.com'
];

// Remove undefined/null origins
const validOrigins = allowedOrigins.filter(origin => origin && origin.trim() !== '');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list
    if (validOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error('CORS Error: Origin not allowed:', origin);
      console.log('Allowed origins:', validOrigins);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie',
    'Accept',
    'Origin',
    'X-Requested-With',
    'X-Game-Session-Id',
    'X-Device-Type'
  ],
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours for preflight cache
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Enhanced Rate limiting with different limits for different endpoints
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { success: false, message },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/';
  }
});

// Different rate limits for different route types
app.use('/api/auth/login', createRateLimiter(15 * 60 * 1000, 10, 'Too many login attempts, please try again later.'));
app.use('/api/auth/signup', createRateLimiter(60 * 60 * 1000, 5, 'Too many signup attempts, please try again later.'));
app.use('/api/auth/save-game', createRateLimiter(60 * 1000, 60, 'Too many game saves, please slow down.'));
app.use('/api/auth/', createRateLimiter(15 * 60 * 1000, 200, 'Too many requests, please try again later.'));
app.use('/api/friends/', createRateLimiter(15 * 60 * 1000, 100, 'Too many friend requests, please try again later.'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'snake-game-session'
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Root route - Enhanced API information
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Snake Game API Server',
    version: '2.0.0',
    environment: process.env.NODE_ENV,
    features: [
      'Enhanced User Authentication with OAuth',
      'Comprehensive Game Statistics Tracking',
      'Advanced Achievement System',
      'Social Features & Friend System',
      'Multi-tier Leaderboards',
      'Real-time Performance Analytics',
      'Device-specific Optimizations',
      'Session Management',
      'Power-up Tracking'
    ],
    endpoints: {
      health: 'GET /api/health',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        logout: 'GET /api/auth/logout',
        profile: 'GET /api/auth/me',
        gameStats: 'GET /api/auth/game-stats',
        achievements: 'GET /api/auth/achievements',
        saveGame: 'POST /api/auth/save-game',
        preferences: 'PUT /api/auth/preferences',
        leaderboard: 'GET /api/auth/leaderboard',
        myRank: 'GET /api/auth/my-rank'
      },
      friends: {
        search: 'GET /api/friends/search',
        profile: 'GET /api/friends/user/:id',
        sendRequest: 'POST /api/friends/request/:id',
        acceptRequest: 'POST /api/friends/accept/:id',
        getFriends: 'GET /api/friends',
        leaderboard: 'GET /api/friends/leaderboard'
      }
    },
    documentation: 'Visit /api/health for detailed server status'
  });
});

// Enhanced Health check route with system information
app.get('/api/health', async (req, res) => {
  try {
    // Basic health check
    const healthData = {
      success: true,
      message: 'Server is running optimally',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(process.uptime()),
        formatted: formatUptime(process.uptime())
      },
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      server: {
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
        },
        cpu: process.cpuUsage(),
        platform: process.platform,
        arch: process.arch
      }
    };

    // Check MongoDB connection
    try {
      const mongoose = await import('mongoose');
      if (mongoose.default.connection.readyState === 1) {
        healthData.database = {
          status: 'Connected',
          name: mongoose.default.connection.name,
          host: mongoose.default.connection.host,
          port: mongoose.default.connection.port
        };
      } else {
        healthData.database = {
          status: 'Disconnected',
          readyState: mongoose.default.connection.readyState
        };
      }
    } catch (error) {
      healthData.database = {
        status: 'Error',
        error: error.message
      };
    }

    // API Status
    healthData.api = {
      cors: validOrigins.length > 0 ? 'Configured' : 'Not Configured',
      rateLimit: 'Active',
      authentication: 'JWT + OAuth',
      session: 'Configured'
    };

    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to format uptime
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      origin: req.get('Origin'),
      allowedOrigins: validOrigins,
      hint: 'Make sure your frontend URL is added to the allowed origins list'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later'
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: {
      general: [
        'GET /',
        'GET /api/health'
      ],
      auth: [
        'POST /api/auth/signup',
        'POST /api/auth/login',
        'GET /api/auth/logout',
        'GET /api/auth/me',
        'PUT /api/auth/update-profile',
        'POST /api/auth/save-game',
        'GET /api/auth/game-stats',
        'GET /api/auth/achievements',
        'PUT /api/auth/preferences',
        'GET /api/auth/leaderboard',
        'GET /api/auth/my-rank'
      ],
      friends: [
        'GET /api/friends/search',
        'GET /api/friends/user/:id',
        'POST /api/friends/request/:id',
        'POST /api/friends/accept/:id',
        'POST /api/friends/reject/:id',
        'DELETE /api/friends/remove/:id',
        'GET /api/friends',
        'GET /api/friends/requests',
        'GET /api/friends/leaderboard',
        'GET /api/friends/mutual/:id'
      ]
    },
    hint: 'Check the API documentation at GET / for complete endpoint information'
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server with enhanced logging
const server = app.listen(PORT, () => {
  console.log('\n🎮 Snake Game API Server Started Successfully!');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);

  if (process.env.NODE_ENV === 'production') {
    console.log('🚀 Production mode - All security features enabled');
  } else {
    console.log('🛠️  Development mode - Debug features enabled');
  }

  console.log('\n🔧 Configured Features:');
  console.log('   ✅ Enhanced Authentication (JWT + OAuth)');
  console.log('   ✅ Comprehensive Game Statistics');
  console.log('   ✅ Advanced Achievement System');
  console.log('   ✅ Social Features & Friends');
  console.log('   ✅ Multi-tier Leaderboards');
  console.log('   ✅ Real-time Analytics');
  console.log('   ✅ Rate Limiting & Security');
  console.log('   ✅ CORS Configuration');

  console.log('\n🌐 Allowed CORS Origins:');
  validOrigins.forEach(origin => console.log(`   • ${origin}`));

  console.log('\n📚 API Documentation: GET /');
  console.log('🏥 Health Check: GET /api/health');
  console.log('\n' + '='.repeat(50));
});

// Handle server startup errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Try using a different port with: PORT=3001 npm start');
  } else {
    console.error('❌ Server startup error:', err);
  }
  process.exit(1);
});

export default app;