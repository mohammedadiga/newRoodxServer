// Function to return a set of HTTP status codes and their meanings 📊
const httpConfig = () => ({
  // Success responses ✅
  OK: 200, // The request was successful and the response body contains the result
  CREATED: 201, // The resource was successfully created
  ACCEPTED: 202, // The request has been accepted for processing, but the processing is not completed
  NO_CONTENT: 204, // The request was successful, but there is no content to send in the response

  // Client error responses ❌
  BAD_REQUEST: 400, // The request could not be understood or was missing required parameters
  UNAUTHORIZED: 401, // Authentication failed or user does not have permissions for the desired action
  FORBIDDEN: 403, // Authentication succeeded, but the authenticated user does not have access to the resource
  NOT_FOUND: 404, // The requested resource could not be found
  METHOD_NOT_ALLOWED: 405, // The HTTP method used is not allowed for the resource
  CONFLICT: 409, // A conflict occurred, typically with an existing resource (e.g., trying to create a duplicate)
  UNPROCESSABLE_ENTITY: 422, // The request was well-formed, but the server was unable to process it due to semantic errors
  TOO_MANY_REQUESTS: 429, // The user has sent too many requests in a given amount of time

  // Server error responses ⚠️
  INTERNAL_SERVER_ERROR: 500, // A generic error message for unexpected conditions on the server
  NOT_IMPLEMENTED: 501, // The server does not support the functionality required to fulfill the request
  BAD_GATEWAY: 502, // The server, while acting as a gateway or proxy, received an invalid response from an upstream server
  SERVICE_UNAVAILABLE: 503, // The server is currently unable to handle the request due to temporary overload or maintenance
  GATEWAY_TIMEOUT: 504, // The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server
});

// Export the HTTPSTATUS object for use in other parts of the application
export const HTTP_STATUS = httpConfig(); // 📊 Expose HTTP status codes for easy use in the app

// Type for HTTP status codes, useful for strict typing in API responses and middleware
export type HTTP_STATUS_TYPE = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]; // 🏷️ Ensures that only valid status codes are used
