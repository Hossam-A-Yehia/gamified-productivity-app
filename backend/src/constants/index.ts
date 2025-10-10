export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const;

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

export const ENVIRONMENT = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
} as const;

export const ERROR_NAMES = {
  VALIDATION_ERROR: 'ValidationError',
  CAST_ERROR: 'CastError',
  JWT_ERROR: 'JsonWebTokenError',
  TOKEN_EXPIRED_ERROR: 'TokenExpiredError',
  MONGO_SERVER_ERROR: 'MongoServerError'
} as const;

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation Error',
  INVALID_ID_FORMAT: 'Invalid ID format',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  DUPLICATE_FIELD: 'Duplicate field value',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  ACCESS_TOKEN_REQUIRED: 'Access token required',
  USER_NOT_FOUND: 'User not found',
  INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired token',
  TASK_NOT_FOUND_OR_COMPLETED: 'Task not found or already completed',
  USER_NOT_AUTHENTICATED: 'User not authenticated',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  RESET_TOKEN_INVALID: 'Reset token is invalid or has expired',
  INVALID_RESET_TOKEN: 'Invalid reset token',
  RESET_TOKEN_REQUIRED: 'Reset token is required',
  GOOGLE_TOKEN_REQUIRED: 'Google token is required',
  EMAIL_REQUIRED: 'Email is required',
  INVALID_NAME: 'Invalid name',
  INVALID_RESET_TOKEN_FORMAT: 'Invalid reset token format'
} as const;

export const AUTH = {
  BEARER_PREFIX: 'Bearer ',
  BEARER_PREFIX_LENGTH: 7,
  STRING_TYPE: 'string',
  TOKEN_LENGTH: 64,
  HEX_REGEX: /^[a-f0-9]+$/i
} as const;

export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  LOGOUT_SUCCESSFUL: 'Logout successful',
  PROFILE_RETRIEVED: 'Profile retrieved successfully',
  EMAIL_VERIFICATION_SENT: 'If an account with that email exists, a password reset link has been sent',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully. You can now log in with your new password.',
  RESET_TOKEN_VALID: 'Reset token is valid',
  GOOGLE_AUTH_SUCCESS: 'Google authentication successful',
  EMAIL_VERIFICATION_PLACEHOLDER: 'Email verification endpoint - to be implemented',
  PROCESSING_ERROR: 'An error occurred while processing your request'
} as const;

export const COOKIE_CONFIG = {
  ACCESS_TOKEN_MAX_AGE: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  SAME_SITE: 'lax' as const,
  HTTP_ONLY: true
} as const;

export const DEFAULTS = {
  SORT_BY: 'createdAt',
  PAGE_LIMIT: 20,
  MIN_NAME_LENGTH: 2
} as const;

export const MONGO_OPERATORS = {
  NOT_EQUAL: '$ne',
  GREATER_THAN_EQUAL: '$gte',
  LESS_THAN_EQUAL: '$lte',
  LESS_THAN: '$lt',
  IN: '$in',
  OR: '$or',
  REGEX: '$regex',
  OPTIONS: '$options'
} as const;

export const REGEX_OPTIONS = {
  CASE_INSENSITIVE: 'i'
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export type SortOrder = typeof SORT_ORDER[keyof typeof SORT_ORDER];
export type Environment = typeof ENVIRONMENT[keyof typeof ENVIRONMENT];
