import { HTTP_STATUS, HTTP_STATUS_TYPE } from '@/config/httpStatus.config';
import { ErrorCode } from '@/common/enums/error-code';
import { AppError } from './appError';

// Not Found Exception - 🕵️‍♂️ "Resource not found"
export class NotFoundException extends AppError {
  constructor(message = 'Resource not found 🕵️‍♂️', errorCode?: ErrorCode) {
    super(message, HTTP_STATUS.NOT_FOUND, errorCode || ErrorCode.RESOURCE_NOT_FOUND);
  }
}

// Bad Request Exception - 🚫 "Bad Request"
export class BadRequestException extends AppError {
  constructor(message = 'Bad Request 🚫', errorCode?: ErrorCode) {
    super(message, HTTP_STATUS.BAD_REQUEST, errorCode);
  }
}

// Unauthorized Access Exception - 🔒 "Unauthorized Access"
export class UnauthorizedException extends AppError {
  constructor(message = 'Unauthorized Access 🔒', errorCode?: ErrorCode) {
    super(message, HTTP_STATUS.UNAUTHORIZED, errorCode || ErrorCode.ACCESS_UNAUTHORIZED);
  }
}

// Internal Server Error - 🛠️ "Internal Server Error"
export class InternalServerException extends AppError {
  constructor(message = 'Internal Server Error 🛠️', errorCode?: ErrorCode) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode || ErrorCode.INTERNAL_SERVER_ERROR);
  }
}

// General HTTP Exception - 🌐 "Http Exception Error"
export class HttpException extends AppError {
  constructor(message = 'Http Exception Error 🌐', statusCode: HTTP_STATUS_TYPE, errorCode?: ErrorCode) {
    super(message, statusCode, errorCode);
  }
}
