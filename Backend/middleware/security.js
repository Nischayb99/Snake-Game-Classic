import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

export const setupSecurity = (app) => {
    // Trust proxy for deployment platforms
    app.set('trust proxy', 1);

    // Security Middleware
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false // Disable CSP for development, configure for production
    }));

    // Compression middleware for better performance
    app.use(compression());

    // Logging middleware
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined'));
    }
};