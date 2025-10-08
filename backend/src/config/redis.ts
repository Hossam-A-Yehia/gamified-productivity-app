import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redis.connect();
    console.log('✅ Redis connected');
  } catch (error) {
    console.error('❌ Redis connection failed:', (error as Error).message);
    // Don't exit process for Redis failure as it's not critical for basic functionality
  }
};

// Handle Redis connection events
redis.on('connect', () => {
  console.log('🔗 Redis connecting...');
});

redis.on('ready', () => {
  console.log('✅ Redis ready');
});

redis.on('error', (error) => {
  console.error('❌ Redis error:', error.message);
});

redis.on('close', () => {
  console.log('⚠️ Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  redis.disconnect();
  console.log('🔌 Redis connection closed through app termination');
});
