import { ExtractJwt, StrategyOptionsWithRequest, Strategy as JwtStrategy } from 'passport-jwt';
import passport, { PassportStatic } from 'passport';
import { ErrorCode } from '@/common/enums/error-code';
//
import { UnauthorizedException } from '@/common/errors/catch-errors';
import { APP_CONFIG } from '@/config/app.config';
// Models
import userService from '@/models/auth.model';

interface JwtPayload {
  userId: string;
  sessionId: string;
}

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        throw new UnauthorizedException('Unauthorized access token', ErrorCode.AUTH_TOKEN_NOT_FOUND);
      }
      return accessToken;
    },
  ]),
  secretOrKey: APP_CONFIG.JWT.SECRET,
  audience: ['user'],
  algorithms: ['HS256'],
  passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(options, async (req, payload: JwtPayload, done) => {
      try {
        const user = await userService.findById(payload.userId);
        if (!user) return done(null, false);
        req.sessionId = payload.sessionId;
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

export const authenticateJWT = passport.authenticate('jwt', { session: false });
