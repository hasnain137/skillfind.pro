import { ApiError } from './errors';
import { ZodError } from 'zod';

export type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    fieldErrors?: Record<string, string[]>;
};

/**
 * Handle errors in Server Actions and return a standardized response object.
 * This mirrors logic in handleApiError but returns a plain object instead of NextResponse.
 */
export function handleActionError(error: unknown): ActionResponse {
    console.error('Action Error:', error);

    if (error instanceof ApiError) {
        return {
            success: false,
            error: error.message,
            code: error.code,
        };
    }

    if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
            const path = err.path.join('.');
            if (!fieldErrors[path]) {
                fieldErrors[path] = [];
            }
            fieldErrors[path].push(err.message);
        });

        return {
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            fieldErrors,
        };
    }

    if (error instanceof Error) {
        // Check for common error messages if they aren't typed errors yet
        if (error.message === 'UNAUTHORIZED') {
            return { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' };
        }

        // In development, we might want to see the real error
        // In production, keep it generic for unexpected errors
        return {
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
            code: 'INTERNAL_ERROR',
        };
    }

    return {
        success: false,
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
    };
}
