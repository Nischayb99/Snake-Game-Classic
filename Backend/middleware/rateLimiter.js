import rateLimit from 'express-rate-limit';

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

export const setupRateLimiting = (app) => {
    // Different rate limits for different route types
    app.use('/api/auth/login', createRateLimiter(15 * 60 * 1000, 10, 'Too many login attempts, please try again later.'));
    app.use('/api/auth/signup', createRateLimiter(60 * 60 * 1000, 5, 'Too many signup attempts, please try again later.'));
    app.use('/api/auth/save-game', createRateLimiter(60 * 1000, 60, 'Too many game saves, please slow down.'));
    app.use('/api/auth/', createRateLimiter(15 * 60 * 1000, 200, 'Too many requests, please try again later.'));
    app.use('/api/friends/', createRateLimiter(15 * 60 * 1000, 100, 'Too many friend requests, please try again later.'));
};