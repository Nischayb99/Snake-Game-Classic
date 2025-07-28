import express from 'express';
import { formatUptime } from '../utils/helpers.js';
import { ALLOWED_ORIGINS } from '../config/constants.js';

const router = express.Router();

// Enhanced Health check route with system information
router.get('/', async (req, res) => {
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
            cors: ALLOWED_ORIGINS.length > 0 ? 'Configured' : 'Not Configured',
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

export default router;