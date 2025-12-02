// Common validation schemas using Zod
import { z } from 'zod';

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ID validation
export const idSchema = z.string().min(1, 'ID is required');

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Phone validation (international format)
export const phoneSchema = z.string().regex(
  /^\+[1-9]\d{1,14}$/,
  'Phone must be in international format (e.g., +43123456789)'
);

// URL validation
export const urlSchema = z.string().url('Invalid URL');

// Date validation
export const dateSchema = z.coerce.date();

// Currency amount (in cents)
export const amountSchema = z.number().int().min(0, 'Amount must be positive');

// Location schema
export const locationSchema = z.object({
  city: z.string().min(2, 'City name too short').optional(),
  region: z.string().optional(),
  country: z.string().length(2, 'Country code must be 2 characters').optional(),
});

// File upload schema
export const fileUploadSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  mimeType: z.enum([
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ]),
});

// Helper to create enum schema
export function createEnumSchema<T extends string>(values: readonly T[], fieldName = 'value') {
  return z.enum(values as [T, ...T[]]).refine(() => true, {
    message: `${fieldName} must be one of: ${values.join(', ')}`
  });
}

// Export types
export type PaginationInput = z.infer<typeof paginationSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
