// POST /api/wallet/deposit - Create deposit payment intent
import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
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

    // VERIFICATION GATE: Pros must be fully verified to add funds
    if (!professional.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'VERIFICATION_REQUIRED',
            message: 'You must complete identity and document verification before adding funds to your wallet.'
          }
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: data.amount, // in cents
          product_data: {
            name: 'Wallet Top-up',
            description: `Add €${(data.amount / 100).toFixed(2)} to your SkillFind wallet`,
          },
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pro/wallet?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pro/wallet?canceled=true&transactionId=${transaction.id}`,
      metadata: {
        professionalId: professional.id,
        transactionId: transaction.id,
      },
      customer_email: professional.user.email,
    });

    // Update transaction with session ID as reference (optional but good for tracking)
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { referenceId: session.id }
    });

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
        paymentUrl: session.url,
        expiresAt: new Date(session.expires_at * 1000),
      },
      instructions: {
        message: 'Complete payment using the provided URL',
        nextSteps: [
          'Click the payment URL to complete the deposit',
          'Payment will be processed securely by Stripe',
          'Your wallet will be credited immediately upon successful payment',
        ],
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
