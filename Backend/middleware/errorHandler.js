import { ALLOWED_ORIGINS } from '../config/constants.js';

export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error('🚨 Error:', err);

    // Custom AppError (our defined errors)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation',
            origin: req.get('Origin'),
            allowedOrigins: ALLOWED_ORIGINS,
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

    // Validation errors (express-validator)
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

    // MongoDB CastError
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid resource ID'
        });
    }

    // Rate limit errors
    if (err.status === 429) {
        return res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later'
        });
    }

    // Default server error (unknown errors)
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong on our end'
            : err.message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    });
};

export const notFoundHandler = (req, res) => {
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
};