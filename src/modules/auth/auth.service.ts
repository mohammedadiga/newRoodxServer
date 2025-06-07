// JWT
import { verifyJwtToken } from '@/common/jwt/verify-jwt-token';
// Utils
import { anHourFromNew, calculateExpirationDate, oneDayInMs, thrreMinutesAgo } from '@/common/utils/data-time';
import { extractUserInfo } from '@/common/utils/formatUserInfo';
import { ErrorCode } from '@/common/enums/error-code';
import { verificationEnum } from '@/common/enums/verification-code';
import { generateUniqueCode } from '@/common/utils/uuid';
import { maskEmail, maskPhone } from '@/common/utils/masking';
import { hashValue } from '@/common/utils/bcrypt';
// Errors
import { BadRequestException, HttpException, UnauthorizedException } from '@/common/errors/catch-errors';
// JWT token
import { createActivationToken } from '@/common/jwt/create-activation-token';
import { verifyActivationToken } from '@/common/jwt/verify-activation-token';
import { refreshTokenSignOptions, RefreshTPayload, signJwtToken } from '@/common/jwt/sign-jwt-token';
import { HTTP_STATUS } from '@/config/httpStatus.config';
// Models
import UserModel from '@/models/auth.model';
// Config
import { APP_CONFIG } from '@/config/app.config';

export class AuthService {
  // Add authentication logic here 🛡️

  // ? Check if email or phone already exists
  public async checkEmailOrPhoneExists(userInfo: string) {
    // Use the utility function to get the formatted email or phone 📧📱
    const userData = extractUserInfo(userInfo);

    if (userData.username) {
      // If username is provided, show error for invalid phone or email 🚫
      throw new BadRequestException('Please use email or phone instead.', ErrorCode.AUTH_INVALID_PHONE_OR_EMAIL);
    }

    if (!userData.email && !userData.phone) {
      // If no valid email or phone is provided, throw an error 🚫
      throw new BadRequestException('Please provide a valid email or phone number.', ErrorCode.AUTH_INVALID_INPUT);
    }

    // Check if user already exists with email or phone 🔍
    const existingUser = await UserModel.findOne({
      $or: [{ email: userData.email }, { phone: userData.phone }],
    });

    // If user exists, throw error based on whether it's email or phone conflict ⚠️
    if (existingUser) {
      if (userData.email && existingUser.email === userData.email) {
        throw new BadRequestException('The email address is already registered. Please use a different email.', ErrorCode.AUTH_EMAIL_ALREADY_EXISTS); // Email conflict
      }
      if (userData.phone && existingUser.phone === userData.phone) {
        throw new BadRequestException('The phone number is already registered. Please use a different phone number.', ErrorCode.AUTH_PHONE_ALREADY_EXISTS); // Phone conflict
      }
    }

    // If no conflict, return the result ✅
    return {
      message: 'User does not exist 🙌',
      userData,
    };
  }

  // ? Register user
  public async userRegister(body: { date?: string; birthday?: string } & Omit<Partial<IUser>, 'date' | 'birthday'>) {
    // Check if the user already exists in the database
    const existingUser = await UserModel.findOne({
      $or: [{ email: body.email }, { phone: body.phone }, { username: body.username }],
    });

    if (existingUser) {
      // Check for conflicts with username, email, or phone
      if (existingUser.username === body.username) {
        throw new BadRequestException('', ErrorCode.AUTH_USERNAME_ALREADY_EXISTS);
      }
      if (existingUser.email === body.email) {
        throw new BadRequestException(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS); // Email conflict
      }
      if (existingUser.phone === body.phone) {
        throw new BadRequestException(ErrorCode.AUTH_PHONE_ALREADY_EXISTS); // Phone conflict
      }
    }

    // Create an activation token
    const activationToken = await createActivationToken(body, 'activation');
    const code = activationToken.code;

    return {
      message: body.email ? 'please_check_your_email' : 'please_check_your_phone_number',
      activationToken: activationToken.token,
      code,
    };
  }

  // ? Activattion Register user
  public async activateRegistertion(body: { userAgent: string; activationToken: string; activationCode: string }) {
    const { activationToken, activationCode, userAgent } = body;

    const User = await verifyActivationToken(activationToken, activationCode, 'activation');
    if (!User) throw new UnauthorizedException('Invalid activation link');

    const { email, phone, username } = User.user;

    // Check if the user already exists in the database
    const existingUser = await UserModel.findOne({
      $or: [{ email: email }, { phone: phone }, { username: username }],
    });

    if (existingUser) {
      // Check for conflicts with username, email, or phone
      if (existingUser.username === username) {
        throw new BadRequestException('Username already exists');
      }
      if (email && existingUser.email === email) {
        throw new BadRequestException('Email already exists');
      }
      if (phone && existingUser.phone === phone) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    const userData = {
      ...User.user,
      email: email || `${username}_email_not_found`,
      phone: phone || `${username}_phone_not_found`,
    };

    const user = await UserModel.create(userData);

    // sign access token & refresh token
    const session: any = { userAgent };
    user.session.push(session);
    await user.save();

    const savedSession = user.session[user.session.length - 1];
    const sessionId = savedSession._id;

    const accessToken = signJwtToken({ userId: user._id, sessionId: sessionId });
    const refreshToken = signJwtToken({ sessionId: sessionId }, refreshTokenSignOptions);

    return { accessToken, refreshToken };
  }

  // ? Login user
  public async login(body: { userAgent: string; userInfo: string; password: string }) {
    const { userAgent, userInfo, password } = body;

    // Use the helper function to extract email or phone or username
    const userData = extractUserInfo(userInfo);

    // Check if the user already exists in the database
    const user = await UserModel.findOne({
      $or: [{ email: userData.email }, { phone: userData.phone }, { username: userData.username }],
    });

    // Check for conflicts with username, email, or phone
    if (!user) throw new BadRequestException('Invalid username or password', ErrorCode.AUTH_USER_NOT_FOUND);

    // Compare the password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) throw new BadRequestException('Invalid email or password', ErrorCode.AUTH_USER_NOT_FOUND);

    //  Check if the user enable 2FA return user = null
    if (user.userPreferences.enable2FA) {
      return {
        user: null,
        accessToken: '',
        refreshToken: '',
        mfaRequired: true,
      };
    }

    // sign access token & refresh token
    const session: any = { userAgent };
    user.session.push(session);
    await user.save();

    const savedSession = user.session[user.session.length - 1];
    const sessionId = savedSession._id;

    const accessToken = signJwtToken({ userId: user._id, sessionId: sessionId });
    const refreshToken = signJwtToken({ sessionId: sessionId }, refreshTokenSignOptions);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      mfaRequired: false,
    };
  }

  // ? Refresh Token
  public async refreshToken(refreshToken: string) {
    const now = Date.now();

    // Verify the validity of the Refresh Token
    const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken, { secret: refreshTokenSignOptions.secret });
    if (!payload) throw new UnauthorizedException('Invalid refresh token');

    // Find the session associated with the user
    const user = await UserModel.findOne({ 'session._id': payload.sessionId }, { 'session.$': 1 });
    if (!user || !user.session || user.session.length === 0) throw new BadRequestException('Session not found or invalid');

    const session = user.session[0];
    if (!session) throw new UnauthorizedException('Session does not exist');

    // Check if the session requires refreshing
    const sessionRequiresRefresh = session.expiredAt.getTime() - now <= oneDayInMs;

    if (sessionRequiresRefresh) {
      // Refresh the session expiration time
      session.expiredAt = calculateExpirationDate(APP_CONFIG.JWT.REFRESH_EXPIRES_IN);

      // Save the session after modifying its expiration time
      await session.save();
    }

    // Create a new Refresh Token if necessary
    const newRefreshToken = sessionRequiresRefresh ? signJwtToken({ sessionId: session._id }, refreshTokenSignOptions) : undefined;

    // Create a new Access Token
    const accessToken = signJwtToken({
      userId: user.id,
      sessionId: session._id,
    });

    return { accessToken, newRefreshToken };
  }

  // ? Logout user
  public async logout(sessionId: ISession['_id']) {
    await UserModel.findOneAndUpdate({ 'session._id': sessionId }, { $pull: { session: { _id: sessionId } } }, { new: true });
    return;
  }

  // ? Forgot Password
  public async forgotPassword(userInfo: string) {
    // Use the utility function to get the formatted email or phone
    const userData = extractUserInfo(userInfo);

    // Check if the user already exists in the database
    const user = await UserModel.findOne({
      $or: [{ email: userData.email }, { phone: userData.phone }, { username: userData.username }],
    });

    // Check for conflicts with username, email, or phone
    if (!user) throw new BadRequestException('User not found', ErrorCode.AUTH_USER_NOT_FOUND);

    // Create an activation token
    const activationToken = await createActivationToken(user._id, 'forgotPassword');
    const activationCode = activationToken.activationCode;
    const code = activationToken.code;

    // Check mail rate limit is 2 email per 3 or 10
    const timeAgo = thrreMinutesAgo();
    const maxAttempts = 3; // Maximum attempts allowed in the time frame
    const maxStoredAttempts = 5;

    user.verifications = user.verifications.filter((v: IVerification) => v.expiredAt > new Date());

    const recentAttempts = user.verifications.filter((v: IVerification) => v.type === verificationEnum.PASSWORD_RESET && v.createdAt > timeAgo);

    if (recentAttempts.length >= maxAttempts) {
      throw new HttpException("You've requested password resets too frequently. Please wait a few minutes and try again.", HTTP_STATUS.TOO_MANY_REQUESTS, ErrorCode.AUTH_TOO_MANY_ATTEMPTS);
    }

    const expiresAt = anHourFromNew();
    const newVerification: IVerification = {
      token: activationToken.token,
      code: activationCode,
      type: verificationEnum.PASSWORD_RESET,
      expiredAt: expiresAt,
      createdAt: new Date(),
    };

    user?.verifications.push(newVerification);
    if (user.verifications.length > maxStoredAttempts) {
      user.verifications.shift();
    }
    await user?.save();

    const maskedContact = userData.email ? userData.email : userData.username ? maskEmail(user.email || '') : userData.phone;

    return {
      message: userData.email || userData.username ? 'please_check_your_email' : 'please_check_your_phone_number',
      maskedContact: maskedContact,
      activationToken: activationToken.token,
      code,
    };
  }

  // ? Activate forgot password code
  public async activatePassword(body: { userAgent: string; activationToken: string; activationCode: string }) {
    const { activationToken, activationCode } = body;

    // Find the user who has a verification record matching the token and type PASSWORD_RESET
    const user = await UserModel.findOne({
      verifications: {
        $elemMatch: {
          token: activationToken,
          type: verificationEnum.PASSWORD_RESET,
        },
      },
    });

    // If no user found, throw unauthorized error
    if (!user) {
      throw new UnauthorizedException('Invalid activation link: user not found');
    }

    // Find the specific verification record matching the activation token
    const verificationRecord = user.verifications.find((v: IVerification) => v.token === activationToken);
    if (!verificationRecord) {
      throw new UnauthorizedException('Invalid activation link: verification record not found');
    }

    // Get the stored verification code from the DB
    const storedCodeFromDB = verificationRecord.code;

    // Verify the activation token and the provided activation code against the stored code
    const verifiedUser = await verifyActivationToken(activationToken, activationCode, 'forgotPassword', storedCodeFromDB);
    if (!verifiedUser) {
      throw new UnauthorizedException('Invalid activation link or code');
    }

    // Fetch the user by ID after verification
    const foundUser = await UserModel.findById(verifiedUser.user); // <== user id
    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    // Generate a new token indicating the password was successfully verified
    const expiresAt = anHourFromNew();
    const activateCode: Partial<IVerification> = {
      token: generateUniqueCode(),
      code: generateUniqueCode(),
      type: verificationEnum.PASSWORD_VERIFIED,
      expiredAt: expiresAt,
    };

    // Remove all previous PASSWORD_RESET verifications from the user
    foundUser.verifications = foundUser.verifications.filter((v: IVerification) => v.type !== verificationEnum.PASSWORD_RESET);

    // Add the new verification token indicating success
    foundUser.verifications.push(activateCode);

    // Save the updated user document
    await foundUser.save();

    // Return the new token and user ID for further steps
    return {
      token: activateCode.token,
      userId: verifiedUser.user, // <== user id
    };
  }

  // ? Reset Password code
  public async resetPassword(body: { token: string; userId: string; password: string }) {
    const { token, userId, password } = body;

    // Find the user by userId
    const user = await UserModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    // Check if the verification code is valid and not expired
    const validCode = user.verifications.find((v: IVerification) => v.token === token && v.type === verificationEnum.PASSWORD_VERIFIED && v.expiredAt > new Date());
    if (!validCode) throw new BadRequestException('Invalid or expired verification code');

    // Hash the new password
    const hashedPassword = await hashValue(password);

    // Update the user's password
    const updatedUser = await UserModel.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
    if (!updatedUser) throw new BadRequestException('Unable to reset password');

    // Remove the password verification code from the user's verifications
    user.verifications = user.verifications.filter((v: IVerification) => v.type !== verificationEnum.PASSWORD_VERIFIED && v.type !== verificationEnum.PASSWORD_RESET);

    // Optionally, remove all sessions associated with the user after password reset
    await UserModel.findByIdAndUpdate(userId, { $set: { session: [] } });

    // Save the updated user data
    await user.save();

    return { message: 'Password successfully reset' };
  }
}
