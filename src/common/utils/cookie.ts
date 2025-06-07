import { CookieOptions, Response } from 'express';
import { APP_CONFIG } from '@/config/app.config';
import { calculateExpirationDate } from './data-time';

type CookiePayloadType = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const REFRESH_PATH = `${APP_CONFIG.BASE_PATH}/auth/refresh`;

const defaults: CookieOptions = {
  httpOnly: true,
  secure: APP_CONFIG.NODE_ENV === 'production' ? true : false,
  sameSite: APP_CONFIG.NODE_ENV === 'production' ? 'strict' : 'lax',
};

export const getAccessTokenCookieOptions = (): CookieOptions => {
  const expiresIn = APP_CONFIG.JWT.EXPIRES_IN;
  const expired = calculateExpirationDate(expiresIn);
  return { ...defaults, expires: expired, path: '/' };
};

export const getRefreshTokenCookieOptions = (): CookieOptions => {
  const expiresIn = APP_CONFIG.JWT.REFRESH_EXPIRES_IN;
  const expired = calculateExpirationDate(expiresIn);
  return { ...defaults, expires: expired, path: APP_CONFIG.BASE_PATH };
};

export const setAuthentcationCookies = ({ res, accessToken, refreshToken }: CookiePayloadType): Response =>
  res.cookie('accessToken', accessToken, getAccessTokenCookieOptions()).cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

export const clearAuthenticationCookies = (res: Response): Response =>
  res.clearCookie('accessToken').clearCookie('refreshToken', {
    path: REFRESH_PATH,
  });
