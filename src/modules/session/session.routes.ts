import { Router } from 'express';
import { SessionController } from '@/modules/session/session.controller';
// Auth Strategies
import { authenticateJWT } from '@/common/auth/jwt.strategie';

const router = Router();
const sessionController = new SessionController();

router.get('/all', authenticateJWT, sessionController.getAllSession);
router.get('/', authenticateJWT, sessionController.getSession);
router.delete('/:id', authenticateJWT, sessionController.deleteSession);

export default router;
