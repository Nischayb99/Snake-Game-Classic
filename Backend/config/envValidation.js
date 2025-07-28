export const validateEnvVars = () => {
    const required = [
        'JWT_SECRET',
        'MONGO_URI'
    ];

    const optional = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'EMAIL_USER',
        'EMAIL_PASS'
    ];

    const missing = required.filter(env => !process.env[env]);
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        process.exit(1);
    }

    const missingOptional = optional.filter(env => !process.env[env]);
    if (missingOptional.length > 0) {
        console.warn('⚠️  Optional environment variables missing:', missingOptional.join(', '));
        console.warn('   Some features may not work properly');
    }

    console.log('✅ Environment variables validated');
};