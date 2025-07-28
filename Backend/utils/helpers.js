export const formatUptime = (uptime) => {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export const setupProcessHandlers = () => {
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
        process.exit(1);
    });

    // Uncaught exception handler
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        process.exit(1);
    });
};