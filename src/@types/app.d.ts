import { Request } from 'express';

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      sessionId?: string;
    }
  }
}
