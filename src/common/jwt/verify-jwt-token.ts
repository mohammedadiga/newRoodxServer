import jwt, { VerifyOptions } from 'jsonwebtoken';
import { APP_CONFIG } from '@/config/app.config';
import { AccessTPayload } from '@/common/jwt/sign-jwt-token';

// JWT VERIFYING FUNCTION 🔍
export const verifyJwtToken = <TPayload extends object = AccessTPayload>(token: string, options?: VerifyOptions & { secret?: string }) => {
  try {
    const { secret = APP_CONFIG.JWT.SECRET, ...opts } = options || {};
    const payload = jwt.verify(token, secret, opts) as TPayload;
    return { payload };
  } catch (err: any) {
    return { error: err.message };
  }
};
