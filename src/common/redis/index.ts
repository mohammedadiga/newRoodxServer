import Redis from 'ioredis';
import { APP_CONFIG } from '@/config/app.config';
import { BadRequestException } from '@/common/errors/catch-errors';

const redisClient = () => {
  if (APP_CONFIG.REDIS_URL) {
    console.log(`redis connected`);
    return APP_CONFIG.REDIS_URL;
  }
  throw new BadRequestException('Redis connection failed');
};

export const redis = new Redis(redisClient());
