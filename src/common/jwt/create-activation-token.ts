// Utility functions for JWT handling
import jwt from 'jsonwebtoken';
import { APP_CONFIG } from '@/config/app.config';
import { hashValue } from '@/common/utils/bcrypt';
// Redis
import { redis } from '@/common/redis';

interface IActivationToken {
  code: string; // Original activation code
  token: string; // Activation token string
  activationCode: string; // Activation code string
}

// Updated function that works for both activation and forgot password
export const createActivationToken = async (user: any, type: 'activation' | 'forgotPassword'): Promise<IActivationToken> => {
  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the code for security
  const hashedCode = await hashValue(code);

  // Only store in Redis if it's for activation
  if (type === 'activation') {
    await redis.setex(`activation:${user.username}`, 300, hashedCode);
  }

  // Generate the JWT token
  const token = jwt.sign({ user }, APP_CONFIG.JWT.ACTIVATON_SECRET as string, { expiresIn: '5m' });

  // Return the original code (to send to the user) and the token
  return { code: code, activationCode: hashedCode, token };
};
