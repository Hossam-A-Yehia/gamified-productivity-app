import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-productivity-app'
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  // JWT
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-token-key-here',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-token-key-here',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d'
  },
  
  // Email
  email: {
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASS || ''
  },
  
  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173/'
  },
  
  // Security
  bcrypt: {
    saltRounds: 12
  },
  
  // Password Reset
  passwordReset: {
    tokenExpiry: 15 * 60 * 1000, // 15 minutes in milliseconds
    tokenLength: 32
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Some features may not work properly. Please check your .env file.');
}
