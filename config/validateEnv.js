export const validateEnv = () => {
    const required = ['MONGO_URI', 'SECRET_KEY', 'PORT'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    console.log('✅ Environment variables validated');
};