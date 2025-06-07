// Enum to define custom error codes for different scenarios 💡
const enum ErrorCode {
  // Authentication Errors
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS', // Email already exists in the system
  AUTH_PHONE_ALREADY_EXISTS = 'AUTH_PHONE_ALREADY_EXISTS', // Phone number already exists in the system
  AUTH_USERNAME_ALREADY_EXISTS = 'AUTH_USERNAME_ALREADY_EXISTS', // The username already exists in the system
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN', // Invalid or expired authentication token
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND', // User not found in the system
  AUTH_NOT_FOUND = 'AUTH_NOT_FOUND', // Authentication credentials not found
  AUTH_TOO_MANY_ATTEMPTS = 'AUTH_TOO_MANY_ATTEMPTS', // Too many login attempts
  AUTH_UNAUTHORIZED_ACCESS = 'AUTH_UNAUTHORIZED_ACCESS', // Unauthorized access attempt
  AUTH_TOKEN_NOT_FOUND = 'AUTH_TOKEN_NOT_FOUND', // Token not found in request
  AUTH_USERNAME_REQUIRED = 'AUTH_USERNAME_REQUIRED', // Username is required for registration
  AUTH_INVALID_PHONE_OR_EMAIL = 'AUTH_INVALID_PHONE_OR_EMAIL', // Invalid phone or email provided
  AUTH_INVALID_INPUT = 'AUTH_INVALID_INPUT', // Invalid input provided

  // Access Control Errors
  ACCESS_FORBIDDEN = 'ACCESS_FORBIDDEN', // Access is forbidden
  ACCESS_UNAUTHORIZED = 'ACCESS_UNAUTHORIZED', // Unauthorized access

  // Validation and Resource Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR', // Validation error in request
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND', // Resource not found in the system

  // System Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR', // Internal server error (catch-all)
  VERIFICATION_ERROR = 'VERIFICATION_ERROR', // Verification-related error

  // Posts Error
  POST_NOT_FOUND = 'POST_NOT_FOUND', // Post not found in the database
  POST_INVALID_DATA = 'POST_INVALID_DATA', // Invalid post data
}

export { ErrorCode };
