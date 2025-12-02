// POST /api/wallet/deposit - Create deposit payment intent
import { NextRequest } from 'next/server';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { getOrCreateWallet } from '@/lib/services/wallet';
import { createDepositSchema } from '@/lib/validations/wallet';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

// NOTE: This is a STUB implementation
// In production, integrate with real Stripe API

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireProfessional();

    // Get professional profile
    const professional = await prisma.professional.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Parse and validate request body
    const body = await request.json();
    const data = createDepositSchema.parse(body);

    // Get or create wallet
    const wallet = await getOrCreateWallet(professional.id);

    // Create pending transaction record
    const transaction = await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: data.amount,
        type: 'DEPOSIT',
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance, // Will be updated after payment confirmation
        description: `Wallet deposit - ${data.paymentMethod} (pending)`,
        referenceId: `pending_${Date.now()}`,
      },
    });

    // STUB: In production, create Stripe Payment Intent here
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: data.amount,
    //   currency: 'eur',
    //   customer: professional.stripeCustomerId,
    //   metadata: {
    //     transactionId: transaction.id,
    //     professionalId: professional.id,
    //     userId: userId,
    //   },
    // });

    // For now, create a mock payment URL
    const mockPaymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/mock?amount=${data.amount}&txId=${transaction.id}`;

    // In production, this would be the Stripe hosted checkout URL
    const paymentUrl = process.env.STRIPE_SECRET_KEY 
      ? `https://checkout.stripe.com/pay/cs_test_...` // Real Stripe URL
      : mockPaymentUrl; // Mock for development

    return successResponse({
      deposit: {
        transactionId: transaction.id,
        amount: {
          cents: data.amount,
          euros: data.amount / 100,
          formatted: `€${(data.amount / 100).toFixed(2)}`,
        },
        paymentMethod: data.paymentMethod,
        status: 'pending',
        paymentUrl,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
      instructions: {
        message: process.env.STRIPE_SECRET_KEY
          ? 'Complete payment using the provided URL'
          : 'DEVELOPMENT MODE: Payment integration not configured. Use mock URL for testing.',
        nextSteps: [
          'Click the payment URL to complete the deposit',
          'Payment will be processed securely',
          'Your wallet will be credited immediately upon successful payment',
          'You will receive an email confirmation',
        ],
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
