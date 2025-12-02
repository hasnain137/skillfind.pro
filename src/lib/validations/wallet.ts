// Wallet and transaction validation schemas
import { z } from 'zod';
import { paginationSchema, amountSchema } from './common';

// Create deposit intent
export const createDepositSchema = z.object({
  amount: z.number().min(500, 'Minimum deposit is €5.00').max(100000, 'Maximum deposit is €1000.00'), // in cents
  paymentMethod: z.enum(['STRIPE', 'PAYPAL']).default('STRIPE'),
});

// Transaction filters
export const listTransactionsSchema = paginationSchema.extend({
  type: z.enum(['DEPOSIT', 'DEBIT', 'REFUND', 'ADMIN_ADJUSTMENT']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Admin wallet adjustment
export const adminWalletAdjustmentSchema = z.object({
  professionalId: z.string().min(1, 'Professional ID is required'),
  amount: z.number().int(), // Can be negative for debits
  reason: z.string().min(10, 'Reason is required').max(500),
  type: z.enum(['ADMIN_ADJUSTMENT', 'REFUND']),
});

// Click event (PPC billing)
export const recordClickSchema = z.object({
  offerId: z.string().min(1, 'Offer ID is required'),
  clickType: z.enum(['OFFER_VIEW', 'PROFILE_VIEW', 'CONTACT_REVEAL']).default('OFFER_VIEW'),
});

// Export types
export type CreateDepositInput = z.infer<typeof createDepositSchema>;
export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>;
export type AdminWalletAdjustmentInput = z.infer<typeof adminWalletAdjustmentSchema>;
export type RecordClickInput = z.infer<typeof recordClickSchema>;
