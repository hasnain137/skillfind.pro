// Custom error classes and error handling utilities

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Predefined error types
export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access denied') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource', message?: string) {
    super(404, 'NOT_FOUND', message || `${resource} not found`);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
  }
}

export class InsufficientBalanceError extends ApiError {
  constructor(message = 'Insufficient wallet balance') {
    super(402, 'INSUFFICIENT_BALANCE', message);
  }
}

export class LimitExceededError extends ApiError {
  constructor(message: string) {
    super(429, 'LIMIT_EXCEEDED', message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, 'BAD_REQUEST', message, details);
  }
}

/**
 * Map error codes to ApiError instances
 */
export function mapErrorCodeToApiError(errorCode: string): ApiError {
  const errorMap: Record<string, ApiError> = {
    UNAUTHORIZED: new UnauthorizedError(),
    FORBIDDEN: new ForbiddenError(),
    USER_NOT_FOUND: new NotFoundError('User'),
    EMAIL_NOT_VERIFIED: new ForbiddenError('Email verification required'),
    PHONE_NOT_VERIFIED: new ForbiddenError('Phone verification required'),
    TERMS_NOT_ACCEPTED: new ForbiddenError('Terms acceptance required'),
    AGE_REQUIREMENT_NOT_MET: new ForbiddenError('Must be 18 years or older'),
    PROFESSIONAL_PROFILE_NOT_FOUND: new NotFoundError('Professional profile'),
    INSUFFICIENT_BALANCE: new InsufficientBalanceError(),
  };

  return errorMap[errorCode] || new ApiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}
