import { AuthService } from '@/modules/auth/auth.service';
// Middleware
import { AsyncHandler } from '@/middleware/async.handler';
import { HTTP_STATUS } from '@/config/httpStatus.config';
import { UnauthorizedException } from '@/common/errors/catch-errors';
// validators
import { activatePasswordSchema, activateSchema, checkExistUserSchema, forgotPasswordSchema, loginSchema, registerSchema } from '@/modules/auth/validators/auth.validation';
// Cookie configuration
import { clearAuthenticationCookies, getAccessTokenCookieOptions, getRefreshTokenCookieOptions, setAuthentcationCookies } from '@/common/utils/cookie';
// Redis
import { redis } from '@/common/redis';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Add your controller methods here 🛠️
  // ? Check Email Already Exists
  public checkRegisterEmailOrPhone = AsyncHandler(async (req, res) => {
    const { userInfo } = checkExistUserSchema.parse(req.body);
    const { message, userData } = await this.authService.checkEmailOrPhoneExists(userInfo);
    res.status(HTTP_STATUS.OK).json({ message, userData });
  });

  // ? Register user Controller
  public register = AsyncHandler(async (req, res) => {
    const body = registerSchema.parse({ ...req.body });
    const { message, activationToken, code } = await this.authService.userRegister(body);
    res.status(HTTP_STATUS.OK).json({ message, activationToken, code });
  });

  // ? Activate email user Controller
  public activateRegistertion = AsyncHandler(async (req, res) => {
    const userAgent = req.headers['user-agent'];
    const body = activateSchema.parse({ ...req.body, userAgent });
    const { accessToken, refreshToken } = await this.authService.activateRegistertion(body);
    setAuthentcationCookies({ res, accessToken, refreshToken }).status(HTTP_STATUS.OK).json({
      message: 'User registered successfully',
    });
  });

  // ? Login Controller
  public login = AsyncHandler(async (req, res) => {
    const userAgent = req.headers['user-agent'];
    const body = loginSchema.parse({ ...req.body, userAgent });
    const { accessToken, refreshToken, mfaRequired } = await this.authService.login(body);
    if (mfaRequired) {
      res.status(HTTP_STATUS.OK).json({
        message: 'Verify MFA authentication',
        mfaRequired,
      });
    }
    setAuthentcationCookies({ res, accessToken, refreshToken }).status(HTTP_STATUS.OK).json({
      message: 'User login successfully',
      mfaRequired,
    });
  });

  // ? Refresh token Controller
  public refreshToken = AsyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
    const { accessToken, newRefreshToken } = await this.authService.refreshToken(refreshToken);
    if (newRefreshToken) res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());
    res.status(HTTP_STATUS.OK).cookie('accessToken', accessToken, getAccessTokenCookieOptions()).json({ message: 'Refresh access token successfully' });
  });

  // ? Logout user Controller
  public logout = AsyncHandler(async (req, res) => {
    const sessionId = req.sessionId;
    if (!sessionId) throw new UnauthorizedException('Session is invalid.');
    // redis.del(sessionId);
    await this.authService.logout(sessionId);
    // Delete session from Redis instead of setting it
    await redis.del(`user:${sessionId}`);
    clearAuthenticationCookies(res).status(HTTP_STATUS.OK).json({
      message: 'User logout successfully',
    });
  });

  // ? Forgot password Controller
  public forgotPassword = AsyncHandler(async (req, res) => {
    const { userInfo } = forgotPasswordSchema.parse(req.body);
    const { message, activationToken, code, maskedContact } = await this.authService.forgotPassword(userInfo);
    res.status(HTTP_STATUS.OK).json({ message, activationToken, code, maskedContact });
  });

  // ? Activat Password Controller
  public activatPassword = AsyncHandler(async (req, res) => {
    const userAgent = req.headers['user-agent'];
    const body = activateSchema.parse({ ...req.body, userAgent });
    const { token, userId } = await this.authService.activatePassword(body);
    res.status(HTTP_STATUS.OK).json({ token, userId });
  });

  // ? Reset password Controller
  public resetPassword = AsyncHandler(async (req, res) => {
    const body = activatePasswordSchema.parse({ ...req.body });
    const { message } = await this.authService.resetPassword(body);
    res.status(HTTP_STATUS.OK).json({ message });
  });
}
