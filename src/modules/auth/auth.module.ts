import authRoutes from '@/modules/auth/auth.routes';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthController } from '@/modules/auth/auth.controller';

// Create instances of AuthService and AuthController
const authService = new AuthService();
const authController = new AuthController();

export { authController, authService };

export const AuthModule = {
  routes: authRoutes,
};
