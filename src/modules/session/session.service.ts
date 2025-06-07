// Middleware
import { ErrorCode } from '@/common/enums/error-code';
import { BadRequestException } from '@/common/errors/catch-errors';
// Models
import UserModel from '@/models/auth.model';

export class SessionService {
  // Add session logic here 🛡️

  // ? Get all sessions by user id
  public async getAllSession(userId: IUser['_id']) {
    const user = await UserModel.findById(userId);
    if (!user) throw new BadRequestException('User not found', ErrorCode.AUTH_USER_NOT_FOUND);
    return { sessions: user.session };
  }

  // ? Get session by session id and user id
  public async getSessionById(sessionId: ISession['_id']) {
    const user = await UserModel.findOne({ 'session._id': sessionId });
    if (!user) throw new BadRequestException('Session not found');
    return { user: user.toJSON() };
  }

  // ? Delete session by session id and user id
  public async deleteSession(sessionId: ISession['_id'], userId: IUser['_id']) {
    const user = await UserModel.findOneAndUpdate({ _id: userId, 'session._id': sessionId }, { $pull: { session: { _id: sessionId } } }, { new: true });
    if (!user) throw new Error('User not found');
    return;
  }
}
