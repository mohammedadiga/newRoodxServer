import jwt, { SignOptions } from 'jsonwebtoken';
import { APP_CONFIG } from '@/config/app.config';

// TYPES
export type AccessTPayload = { userId: IUser['_id']; sessionId: ISession['_id'] }; // Access token payload type
export type RefreshTPayload = { sessionId: ISession['_id'] }; // Refresh token payload type

// OPTIONS & DEFAULTS
const defaults: SignOptions = { audience: ['user'] }; // Default signing options

type SignOptsAndSecret = SignOptions & { secret: string }; // Extend sign options to include the secret

// JWT Token Options with expiry time and secret key configuration
export const accessTokenSignOptions: SignOptsAndSecret = { expiresIn: APP_CONFIG.JWT.EXPIRES_IN /* 15m */, secret: APP_CONFIG.JWT.SECRET }; // Access token options
export const refreshTokenSignOptions: SignOptsAndSecret = { expiresIn: APP_CONFIG.JWT.REFRESH_EXPIRES_IN  /* 30d */, secret: APP_CONFIG.JWT.REFRESH_SECRET }; // Refresh token options

// JWT SIGNING FUNCTION 🔑
export const signJwtToken = (payload: AccessTPayload | RefreshTPayload, optional?: SignOptsAndSecret) => {
  const { secret, ...opts } = optional || accessTokenSignOptions; // Use default options if not provided
  return jwt.sign(payload, secret, { ...defaults, ...opts }); // Return signed JWT token
};
