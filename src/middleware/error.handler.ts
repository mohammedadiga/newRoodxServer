import { ErrorRequestHandler } from 'express';
import { z } from 'zod';
import { HTTP_STATUS } from '@/config/httpStatus.config';
import { formatZodError } from '@/common/errors/formatZodError';
import { AppError } from '@/common/errors/appError';

// Global Error Handler Middleware
export const ErrorHandler: ErrorRequestHandler = (err, req, res, next): any => {
  // Handle refresh path cookies 🍪
  // if(req.path === REFRESH_PATH) clearAuthenticationCookies(res); // 🛑 Uncomment if authentication cookies are used

  // Handling invalid JSON format error 📄
  if (err instanceof SyntaxError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Invalid JSON format, please check your request body 🛠️', // 🛠️ Invalid JSON format message
    });
  }

  // Handle Zod validation error and format it 🛠️
  if (err instanceof z.ZodError) {
    return formatZodError(res, err); // 📝 Return formatted Zod validation errors
  }

  // Handle custom app errors 🌟
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message, // 📢 Custom error message
      errorCode: err.errorCode, // 🔑 Custom error code
    });
  }

  // Catch all for internal server errors 💥
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: 'Internal Server Error 🛑', // 🛑 Internal server error message
    error: err?.message || 'Unknown error occurred ❓', // ❓ Fallback error message
  });

  // Log the error (optional)
  console.error(err);
};
