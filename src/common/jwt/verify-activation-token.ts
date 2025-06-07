import jwt from 'jsonwebtoken';
import { APP_CONFIG } from '@/config/app.config';
import { compareValue } from '@/common/utils/bcrypt';
import { NotFoundException } from '@/common/errors/notFoundException';
import { redis } from '@/common/redis';
import { string } from 'zod';

interface IVerifyToken {
  user: IUser;
}

export const verifyActivationToken = async (token: string, activationCode: string, type: 'activation' | 'forgotPassword', storedCodeFromDB?: string): Promise<IVerifyToken> => {
  try {
    // Decode JWT to get user info
    const decoded = jwt.verify(token, APP_CONFIG.JWT.ACTIVATON_SECRET as string) as { user: IUser };

    

    let storedDataRaw: string | null = null;

    // Get the stored hashed code from Redis using correct prefix
    if (type === 'activation') {
      storedDataRaw = await redis.get(`activation:${decoded.user.username}`);
      if (!storedDataRaw) throw new NotFoundException(`${type === 'activation' ? 'Activation' : 'Reset'} token expired or not found`);
    } else if (type === 'forgotPassword') {
      if (!storedCodeFromDB) {
        throw new NotFoundException('Stored reset code is missing');
      }
      storedDataRaw = storedCodeFromDB;
    }

    if (!storedDataRaw) {
      throw new NotFoundException('Stored code not found');
    }

    // Compare provided code with the hashed one in Redis
    const isValidCode = await compareValue(activationCode, storedDataRaw);
    if (!isValidCode) throw new NotFoundException(`Invalid ${type === 'activation' ? 'activation' : 'reset'} code`);

    // Return user if everything is valid
    return { user: decoded.user };
  } catch (error) {
    throw new NotFoundException(`Invalid ${type === 'activation' ? 'activation' : 'reset'} token or code`);
  }
};
