export const validateEnv = () => {
  const required = ['MONGO_URI', 'SECRET_KEY', 'REFRESH_SECRET', 'PORT'];

  if (process.env.NODE_ENV === 'production') {
    required.push('FRONTEND_URL', 'BACKEND_URL');
  }

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(', ')}`
    );
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
};
