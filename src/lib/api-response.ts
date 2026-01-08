// Standardized API response helpers
import { NextResponse } from 'next/server';
import { ApiError } from './errors';
import { ZodError } from 'zod';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: ApiSuccessResponse['meta']
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    meta,
  });
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Resource created successfully',
    },
    { status: 201 }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  statusCode: number,
  code: string,
  message: string,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status: statusCode }
  );
}

// Helpers
export function unauthorizedResponse(message = 'Authentication required') {
  return errorResponse(401, 'UNAUTHORIZED', message);
}

export function forbiddenResponse(message = 'Access denied') {
  return errorResponse(403, 'FORBIDDEN', message);
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(404, 'NOT_FOUND', message);
}

export function validationErrorResponse(message = 'Invalid request data', details?: any) {
  return errorResponse(400, 'VALIDATION_ERROR', message, details);
}

/**
 * Handle errors and convert to appropriate response
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  // ApiError (our custom errors)
  if (error instanceof ApiError) {
    return errorResponse(
      error.statusCode,
      error.code,
      error.message,
      error.details
    );
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return errorResponse(
      400,
      'VALIDATION_ERROR',
      'Invalid request data',
      error.issues.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }))
    );
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: any };

    if (prismaError.code === 'P2002') {
      return errorResponse(
        409,
        'CONFLICT',
        'A record with this data already exists',
        prismaError.meta
      );
    }

    if (prismaError.code === 'P2025') {
      return errorResponse(
        404,
        'NOT_FOUND',
        'Record not found'
      );
    }
  }

  // Generic errors
  if (error instanceof Error) {
    // Map known error messages to ApiErrors
    if (error.message === 'UNAUTHORIZED') {
      return errorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }
    if (error.message === 'FORBIDDEN') {
      return errorResponse(403, 'FORBIDDEN', 'Access denied');
    }
    if (error.message === 'USER_NOT_FOUND') {
      return errorResponse(404, 'NOT_FOUND', 'User not found');
    }
    if (error.message === 'BANNED') {
      return errorResponse(403, 'FORBIDDEN', 'Your account has been banned');
    }

    // Development mode: show full error
    if (process.env.NODE_ENV === 'development') {
      return errorResponse(
        500,
        'INTERNAL_ERROR',
        error.message,
        { stack: error.stack }
      );
    }
  }

  // Default error
  return errorResponse(
    500,
    'INTERNAL_ERROR',
    'An unexpected error occurred'
  );
}
