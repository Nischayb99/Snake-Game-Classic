import express from 'express';
import { API_ENDPOINTS } from '../config/constants.js';

const router = express.Router();

// Root route - Enhanced API information
router.get('/', (req, res) => {
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
        endpoints: API_ENDPOINTS,
        documentation: 'Visit /api/health for detailed server status'
    });
});

export default router;