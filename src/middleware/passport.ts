import passport from 'passport';
import { setupJwtStrategy } from '@/common/auth/jwt.strategie';

const intializePassport = () => {
  setupJwtStrategy(passport);
};

intializePassport();

export default passport;
