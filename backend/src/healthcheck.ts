import mongoose from 'mongoose';
import Redis from 'ioredis';

const healthCheck = async (): Promise<void> => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection failed');
      process.exit(1);
    }

    // Check Redis connection
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    await redis.ping();
    redis.disconnect();

    console.log('Health check passed');
    process.exit(0);
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(1);
  }
};

healthCheck();
