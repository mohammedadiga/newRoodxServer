import { SessionService } from '@/modules/session/session.service';
// Middleware
import { AsyncHandler } from '@/middleware/async.handler';
import { HTTP_STATUS } from '@/config/httpStatus.config';
import { BadRequestException, UnauthorizedException } from '@/common/errors/catch-errors';
// Models
import { getModifiedSessions } from '@/models/auth.model';
// Redis
import { redis } from '@/common/redis';

export class SessionController {
  private sessionService: SessionService;

  constructor() {
    this.sessionService = new SessionService();
  }

  // Add your controller methods here 🛠️
  // ? Get  all session
  public getAllSession = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const sessionId = req.sessionId;
    console.log(sessionId);

    const { sessions } = await this.sessionService.getAllSession(userId);
    const modifiedSessions = getModifiedSessions(sessions, sessionId);
    console.log(modifiedSessions);
    res.status(HTTP_STATUS.OK).json({
      message: 'Retrieving all sessions successfully',
      sessions: modifiedSessions,
    });
  });

  // ? Get Your session
  public getSession = AsyncHandler(async (req, res) => {
    const sessionId = req?.sessionId;
    if (!sessionId) throw new BadRequestException('Session ID not found. Please log in.');
    const { user } = await this.sessionService.getSessionById(sessionId);
    // upload session to redis
    redis.set(`user:${sessionId}`, JSON.stringify(user) as any);
    res.status(HTTP_STATUS.OK).json({ message: 'Session retrieved successfully', user });
  });

  //? Delete session
  public deleteSession = AsyncHandler(async (req, res) => {
    const userId = req?.user?._id;
    const sessionId = req.params.id;
    if (req.sessionId === sessionId) throw new BadRequestException('Session cannot be deleted. Please logout.');
    await this.sessionService.deleteSession(sessionId, userId);
    // Delete session from Redis instead of setting it
    await redis.del(`user:${sessionId}`);
    res.status(HTTP_STATUS.OK).json({ message: 'Session remove successfully' });
  });
}
