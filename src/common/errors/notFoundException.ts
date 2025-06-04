import { HTTP_STATUS, HTTP_STATUS_TYPE } from '@/config/httpStatus.config';

// Custom NotFoundException class

export class NotFoundException extends Error {
  public status: number;
  public statusCode: HTTP_STATUS_TYPE = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  public errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'NotFoundException';
    this.status = HTTP_STATUS.NOT_FOUND;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
