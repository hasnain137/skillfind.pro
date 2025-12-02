// Offer-related validation schemas
import { z } from 'zod';
import { paginationSchema } from './common';

// Create offer
export const createOfferSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  message: z.string().min(50, 'Message must be at least 50 characters').max(1000, 'Message too long'),
  proposedPrice: z.number().min(0, 'Price must be positive').optional(),
  estimatedDuration: z.string().max(200).optional(),
  availableTimeSlots: z.string().max(300).optional(),
});

// Update offer
export const updateOfferSchema = z.object({
  message: z.string().min(50).max(1000).optional(),
  proposedPrice: z.number().min(0).optional(),
  estimatedDuration: z.string().max(200).optional(),
  availableTimeSlots: z.string().max(300).optional(),
});

// List offers
export const listOffersSchema = paginationSchema.extend({
  requestId: z.string().optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']).optional(),
});

// Accept offer
export const acceptOfferSchema = z.object({
  offerId: z.string().min(1, 'Offer ID is required'),
});

// Withdraw offer
export const withdrawOfferSchema = z.object({
  reason: z.enum(['NO_LONGER_AVAILABLE', 'CLIENT_REQUEST', 'PRICING_ERROR', 'OTHER']).optional(),
});

// Export types
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type ListOffersInput = z.infer<typeof listOffersSchema>;
export type AcceptOfferInput = z.infer<typeof acceptOfferSchema>;
export type WithdrawOfferInput = z.infer<typeof withdrawOfferSchema>;
