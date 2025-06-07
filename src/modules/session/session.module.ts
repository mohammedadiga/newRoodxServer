import sessionRouter from '@/modules/session/session.routes';
import { SessionService } from '@/modules/session/session.service';
import { SessionController } from '@/modules/session/session.controller';

// Create instances of SessionService and SessionController
const sessionService = new SessionService();
const sessionController = new SessionController();

export { sessionController, sessionService };
export const SessionModule = {
  routes: sessionRouter,
};
