// Review-related validation schemas
import { z } from 'zod';
import { paginationSchema } from './common';

// Create review
export const createReviewSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().min(5, 'Title too short').max(100, 'Title too long').optional(),
  content: z.string().min(20, 'Review must be at least 20 characters').max(1000, 'Review too long'),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags').optional(),
  wouldRecommend: z.boolean().default(true),
});

// Professional response to review
export const createReviewResponseSchema = z.object({
  response: z.string().min(20, 'Response must be at least 20 characters').max(500, 'Response too long'),
});

// List reviews
export const listReviewsSchema = paginationSchema.extend({
  professionalId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  wouldRecommend: z.coerce.boolean().optional(),
});

// Export types
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateReviewResponseInput = z.infer<typeof createReviewResponseSchema>;
export type ListReviewsInput = z.infer<typeof listReviewsSchema>;
