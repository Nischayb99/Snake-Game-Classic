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
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Enhanced CORS setup for development and production
const allowedOrigins = [
  process.env.PRODUCTION_FRONTEND_URL,
  process.env.LOCALHOST_FRONTEND_URL,
  'https://snake-game-classic.vercel.app', // Your Vercel deployment
  'http://localhost:5173', // Local development
  'http://localhost:3000', // Alternative local port
  'https://snake-game-2-61m3.onrender.com' // Your backend domain (for self-requests)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error('CORS Error: Origin not allowed:', origin);
      console.log('Allowed origins:', allowedOrigins);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Handle preflight requests
app.options('*', cors());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // max 200 requests per window per IP
  message: { success: false, message: 'Too many attempts, please try again later.' }
});
app.use('/api/auth/', authLimiter);

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Root route - Welcome message
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Snake Game API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      friends: '/api/friends/*',
      leaderboard: '/api/auth/leaderboard'
    },
    documentation: 'Visit /api/health to check server status'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: 'Connected',
    environment: process.env.NODE_ENV
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/signup',
      'GET /api/auth/leaderboard'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});