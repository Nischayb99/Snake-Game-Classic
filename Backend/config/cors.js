import cors from 'cors';
import { ALLOWED_ORIGINS } from './constants.js';

export const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or curl)
        if (!origin) return callback(null, true);

        // Check if the origin is in the allowed list
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        } else {
            console.error('CORS Error: Origin not allowed:', origin);
            console.log('Allowed origins:', ALLOWED_ORIGINS);
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
};

export const setupCors = (app) => {
    app.use(cors(corsOptions));
    app.options('*', cors());
};