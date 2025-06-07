import { Router } from 'express';
import { AuthController } from '@/modules/auth/auth.controller';
// Auth Strategies
import { authenticateJWT } from '@/common/auth/jwt.strategie';

const router = Router();
const authController = new AuthController();

router.get('/refresh', authController.refreshToken);

router.post('/check', authController.checkRegisterEmailOrPhone);
router.post('/register', authController.register);
router.post('/register/activate', authController.activateRegistertion);

router.post('/login', authController.login);

router.post('/password/forgot', authController.forgotPassword);
router.post('/password/active', authController.activatPassword);

router.put('/password/reset', authController.resetPassword);

router.delete('/logout', authenticateJWT, authController.logout);

export default router;
