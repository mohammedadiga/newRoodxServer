import { getEnv } from '@/common/utils/getEnv';

// Application configuration

export const APP_CONFIG = {
  PORT: getEnv('PORT', '3000'),
  NODE_ENV: getEnv('NODE_ENV', 'production'),
  APP_ORIGIN: getEnv('APP_ORIGIN', 'http://localhost:3000'),
  BASE_PATH: getEnv('BASE_PATH', '/api/v1'),
  MONGO_URI: getEnv('MONGO_URI', 'mongodb://localhost:27017/mydatabase'),
};
