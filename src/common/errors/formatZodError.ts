import { ZodError } from 'zod';
import { Response } from 'express';
import { HTTP_STATUS } from '@/config/httpStatus.config';

/**
 * Function to format Zod validation errors into a response 📋
 */
export const formatZodError = (res: Response, error: ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join('.'), // 🧩 Field path for nested objects
    message: err.message, // ❌ Validation error message
  }));

  // Responding with a bad request due to validation error 💥
  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    message: 'Validation failed 🚫', // 🚫 Validation failed message
    errors: errors, // 📍 List of errors
  });
};
