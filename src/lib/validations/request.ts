// Request-related validation schemas
import { z } from 'zod';
import { paginationSchema } from './common';

// Create service request
export const createRequestSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().min(1, 'Subcategory is required'),
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  locationType: z.enum(['ON_SITE', 'REMOTE']),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  country: z.string().length(2).default('FR'),
  address: z.string().max(200).optional(),
  urgency: z.enum(['URGENT', 'SOON', 'FLEXIBLE']).default('FLEXIBLE'),
  preferredStartDate: z.coerce.date().optional(),
});

// Update request
export const updateRequestSchema = z.object({
  title: z.string().min(10).max(100).optional(),
  description: z.string().min(20).max(2000).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  locationType: z.enum(['ON_SITE', 'REMOTE']).optional(),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  country: z.string().length(2).optional(),
  address: z.string().max(200).optional(),
  urgency: z.enum(['URGENT', 'SOON', 'FLEXIBLE']).optional(),
  preferredStartDate: z.coerce.date().optional(),
});

// List requests filters
export const listRequestsSchema = paginationSchema.extend({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
});

// Matching requests filters (for professionals)
export const matchingRequestsSchema = paginationSchema.extend({
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  remoteOnly: z.coerce.boolean().optional(),
});

// Close request
export const closeRequestSchema = z.object({
  reason: z.enum(['COMPLETED', 'NO_LONGER_NEEDED', 'FOUND_ELSEWHERE', 'OTHER']).optional(),
  feedback: z.string().max(500).optional(),
});

// Export types
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type ListRequestsInput = z.infer<typeof listRequestsSchema>;
export type MatchingRequestsInput = z.infer<typeof matchingRequestsSchema>;
export type CloseRequestInput = z.infer<typeof closeRequestSchema>;
