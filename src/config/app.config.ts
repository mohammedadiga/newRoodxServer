import { getEnv } from '@/common/utils/getEnv';
import type { StringValue } from 'ms';

// Application configuration

export const APP_CONFIG = {
  PORT: getEnv('PORT', '3000'),
  NODE_ENV: getEnv('NODE_ENV', 'production'),
  APP_ORIGIN: getEnv('APP_ORIGIN', 'http://localhost:3000'),
  BASE_PATH: getEnv('BASE_PATH', '/api/v1'),
  MONGO_URI: getEnv('MONGO_URI', 'mongodb://localhost:27017/mydatabase'),
  REDIS_URL: getEnv('REDIS_URL', 'REDIS-URL'),
  JWT: {
    ACTIVATON_SECRET: getEnv('JWT_ACTIVATON_SECRET', 'your_activaton_secret_key'),

    SECRET: getEnv('JWT_SECRET', 'your_secret_key'),
    REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET', 'your_refresh_secret_key'),

    EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '15m') as StringValue,
    REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '30d') as StringValue,
  },
};
