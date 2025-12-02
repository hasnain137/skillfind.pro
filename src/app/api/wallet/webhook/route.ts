// POST /api/wallet/webhook - Handle payment provider webhooks (Stripe)
import { NextRequest } from 'next/server';
import { successResponse, handleApiError } from '@/lib/api-response';
import { creditWallet } from '@/lib/services/wallet';
import { prisma } from '@/lib/prisma';
import { BadRequestError } from '@/lib/errors';

// NOTE: This is a STUB implementation for Stripe webhooks
// In production, verify webhook signature and handle all event types

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    
    // STUB: In production, verify Stripe signature
    // const sig = request.headers.get('stripe-signature');
    // const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    // For now, parse as JSON
    const event = JSON.parse(body);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const transactionId = paymentIntent.metadata?.transactionId;

        if (!transactionId) {
          throw new BadRequestError('Missing transaction ID in payment metadata');
        }

        // Get pending transaction
        const transaction = await prisma.transaction.findUnique({
          where: { id: transactionId },
          include: {
            wallet: {
              include: {
                professional: true,
              },
            },
          },
        });

        if (!transaction) {
          throw new BadRequestError('Transaction not found');
        }

        // Credit the wallet
        await creditWallet({
          professionalId: transaction.wallet.professional.id,
          amount: transaction.amount,
          type: 'DEPOSIT',
          description: `Wallet deposit completed - ${paymentIntent.payment_method}`,
          referenceId: paymentIntent.id,
        });

        // Note: Transaction status tracking would require additional fields in schema
        // For now, the successful creditWallet call indicates completion

        // TODO: Send confirmation email
        console.log(`✅ Deposit completed for professional ${transaction.wallet.professional.id}: €${transaction.amount / 100}`);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const transactionId = paymentIntent.metadata?.transactionId;

        if (transactionId) {
          // Note: Transaction model doesn't track failure status
          // In production, consider adding status tracking or logging to separate table
          
          // TODO: Send failure notification email
          console.log(`❌ Deposit failed for transaction ${transactionId}: ${paymentIntent.last_payment_error?.message}`);
        }

        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return successResponse({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
