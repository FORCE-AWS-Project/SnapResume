/**
 * Centralized Response Messages
 */

export const ErrorMessages = {
  // General
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred',
  BAD_REQUEST: 'Invalid request',
  UNAUTHORIZED: 'User not authenticated',
  FORBIDDEN: 'You do not have permission to access this resource',
  NOT_FOUND: 'Resource not found',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later',

  // User
  USER_NOT_FOUND: 'User profile not found',
  USER_ALREADY_EXISTS: 'User already exists',

  // Resume
  RESUME_NOT_FOUND: 'Resume not found',
  RESUME_NAME_REQUIRED: 'Resume name is required',
  RESUME_TEMPLATE_REQUIRED: 'Template ID is required',
  RESUME_ID_REQUIRED: 'Resume ID is required',

  // Section
  SECTION_NOT_FOUND: 'Section not found',
  SECTION_TYPE_REQUIRED: 'Section type is required',
  SECTION_TYPE_INVALID: 'Invalid section type',

  // Template
  TEMPLATE_NOT_FOUND: 'Template not found',

  // Recommendation
  JOB_DESCRIPTION_REQUIRED: 'Job description is required',
  NO_SECTIONS_FOUND: 'No sections found. Please create some sections first',
  BEDROCK_ERROR: 'Failed to analyze with AI',

  // Auth - Cognito Errors
  AUTH_USER_NOT_FOUND: 'User not found',
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_USER_NOT_CONFIRMED: 'Email not verified. Please check your email.',
  AUTH_EMAIL_EXISTS: 'Email already registered',
  AUTH_INVALID_PASSWORD: 'Password does not meet requirements',
  AUTH_INVALID_CODE: 'Invalid verification code',
  AUTH_CODE_EXPIRED: 'Verification code has expired',
  AUTH_TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  AUTH_LIMIT_EXCEEDED: 'Limit exceeded. Please try again later.',
  AUTH_INVALID_PARAMS: 'Invalid parameters provided',
  AUTH_FAILED: 'Authentication failed',
  AUTH_TOKEN_REFRESH_FAILED: 'Token refresh failed',

  // Validation
  VALIDATION_FAILED: 'Validation failed',
  FIELD_REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_URL: 'Invalid URL',
  INVALID_DATE: 'Invalid date format',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
} as const;

export const SuccessMessages = {
  // Auth
  AUTH_REGISTER_SUCCESS: 'Registration successful. Please check your email for verification.',
  AUTH_LOGIN_SUCCESS: 'Login successful',
  AUTH_LOGOUT_SUCCESS: 'Logged out successfully',
  AUTH_PASSWORD_RESET_SENT: 'Password reset code sent to your email',
  AUTH_PASSWORD_RESET_SUCCESS: 'Password reset successful',
  AUTH_PASSWORD_CHANGED: 'Password changed successfully',

  // User
  PROFILE_CREATED: 'Profile created successfully',
  PROFILE_UPDATED: 'Profile updated successfully',

  // Resume
  RESUME_CREATED: 'Resume created successfully',
  RESUME_UPDATED: 'Resume updated successfully',
  RESUME_DELETED: 'Resume deleted successfully',

  // Section
  SECTION_CREATED: 'Section created successfully',
  SECTION_UPDATED: 'Section updated successfully',
  SECTION_DELETED: 'Section deleted successfully',

  // Template
  TEMPLATE_LOADED: 'Template loaded successfully',

  // General
  SUCCESS: 'Operation completed successfully',
} as const;

export const ErrorTypes = {
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  CONFLICT: 'Conflict',
  VALIDATION_ERROR: 'Validation Error',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  SERVICE_UNAVAILABLE: 'Service Unavailable',
} as const;

// Mapping of Cognito error codes to our error messages
export const CognitoErrorMap: Record<string, string> = {
  UserNotFoundException: ErrorMessages.AUTH_USER_NOT_FOUND,
  NotAuthorizedException: ErrorMessages.AUTH_INVALID_CREDENTIALS,
  UserNotConfirmedException: ErrorMessages.AUTH_USER_NOT_CONFIRMED,
  UsernameExistsException: ErrorMessages.AUTH_EMAIL_EXISTS,
  InvalidPasswordException: ErrorMessages.AUTH_INVALID_PASSWORD,
  CodeMismatchException: ErrorMessages.AUTH_INVALID_CODE,
  ExpiredCodeException: ErrorMessages.AUTH_CODE_EXPIRED,
  TooManyRequestsException: ErrorMessages.AUTH_TOO_MANY_REQUESTS,
  LimitExceededException: ErrorMessages.AUTH_LIMIT_EXCEEDED,
  InvalidParameterException: ErrorMessages.AUTH_INVALID_PARAMS,
};
