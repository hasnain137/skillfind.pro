// User-related validation schemas
import { z } from 'zod';
import { emailSchema, phoneSchema, dateSchema } from './common';
import { UserRole } from '@prisma/client';

// Complete signup (role selection after Clerk signup)
export const completeSignupSchema = z.object({
  role: z.enum(['CLIENT', 'PROFESSIONAL']),
  dateOfBirth: dateSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  city: z.string().min(2, 'City is required').optional(),
  country: z.string().length(2, 'Country code must be 2 characters (e.g., FR, US)').optional(),
  termsAccepted: z.literal(true).optional(),
});

// Update user profile
export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phoneNumber: phoneSchema.optional(),
  city: z.string().min(2).max(100).optional(),
  region: z.string().max(100).optional(),
  country: z.string().length(2).optional(),
  avatar: z.string().url().optional(),
});

// Client profile (extends user)
export const createClientProfileSchema = z.object({
  // Currently no additional fields beyond user
});

// Professional profile creation
export const createProfessionalProfileSchema = z.object({
  title: z.string().min(5, 'Title too short').max(100, 'Title too long'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(2000, 'Bio too long'),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  remoteAvailability: z.enum(['YES_AND_ONSITE', 'ONLY_REMOTE', 'NO_REMOTE']).default('YES_AND_ONSITE'),
  termsAccepted: z.literal(true),
});

// Update professional profile
export const updateProfessionalProfileSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  bio: z.string().min(10).max(2000).optional(),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  city: z.string().min(2).max(100).optional(),
  country: z.string().length(2).optional(),
  isAvailable: z.boolean().optional(),
  remoteAvailability: z.enum(['YES_AND_ONSITE', 'ONLY_REMOTE', 'NO_REMOTE']).optional(),
});

// Professional service
export const createServiceSchema = z.object({
  subcategoryId: z.string().min(1, 'Subcategory is required'),
  priceFrom: z.number().int().min(0).optional(),
  priceTo: z.number().int().min(0).optional(),

  description: z.string().min(50, 'Description must be at least 50 characters').max(500).optional().or(z.literal('')),
}).refine(
  (data) => data.priceFrom !== undefined || data.priceTo !== undefined,
  {
    message: 'Must provide at least one of priceFrom or priceTo',
  }
);

export const updateServiceSchema = z.object({
  priceFrom: z.number().int().min(0).optional(),
  priceTo: z.number().int().min(0).optional(),
  description: z.string().max(500).optional(),
});

// Export types
export type CompleteSignupInput = z.infer<typeof completeSignupSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type CreateProfessionalProfileInput = z.infer<typeof createProfessionalProfileSchema>;
export type UpdateProfessionalProfileInput = z.infer<typeof updateProfessionalProfileSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
