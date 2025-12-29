// POST /api/wallet/webhook - Handle payment provider webhooks (Stripe)
import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { successResponse, handleApiError } from '@/lib/api-response';
import { creditWallet } from '@/lib/services/wallet';
import { prisma } from '@/lib/prisma';
import { BadRequestError } from '@/lib/errors';

// NOTE: This is a STUB implementation for Stripe webhooks
// In production, verify webhook signature and handle all event types

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      if (!webhookSecret) {
        console.warn('STRIPE_WEBHOOK_SECRET is not set. Skipping signature verification (DEV MODE ONLY WARNING).');
        // In production this should error out. For now, if secret is missing, we can't verify.
        // But strict security means we should probably return 500 or 400.
        // However, since we are setting up, let's just error if it's missing to force user to set it.
        throw new Error('STRIPE_WEBHOOK_SECRET not configured');
      }
      throw new BadRequestError('Missing Stripe signature');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const professionalId = session.metadata?.professionalId;
      const amount = session.amount_total;
      const transactionId = session.metadata?.transactionId; // The pending transaction ID

      if (professionalId && amount && transactionId) {
        console.log(`Processing deposit for professional ${professionalId}: €${amount / 100}`);

        // Idempotency: Check if we already processed this Stripe PaymentIntent
        const existingTx = await prisma.transaction.findFirst({
          where: { referenceId: session.payment_intent as string }
        });

        if (existingTx) {
          console.log(`Transaction already processed for payment intent ${session.payment_intent}`);
          return successResponse({ received: true, status: 'already_processed' });
        }

        // Cleanup: If we have a pending transaction, we should use its ID for the new completed transaction 
        // or delete it to avoid duplicates in history.
        // Since recordTransaction creates a NEW one, let's try to delete the pending one first 
        // to keep the history clean (User saw "Pending", now sees "Completed" - effectively unrelated but cleaner than keeping Pending forever)

        try {
          await prisma.transaction.delete({
            where: { id: transactionId } // This is the 'pending' one
          });
        } catch (e) {
          // It might not exist or already deleted, ignore
          console.log('Pending transaction not found or already deleted');
        }

        await creditWallet({
          professionalId: professionalId,
          amount: amount, // Stripe uses cents, match our system
          type: 'DEPOSIT',
          description: `Stripe deposit ${session.payment_intent}`,
          referenceId: session.payment_intent as string,
        });
      }
    }

    // Handle identity.verification_session.verified
    if (event.type === 'identity.verification_session.verified') {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const professionalId = session.metadata?.professionalId;

      if (professionalId) {
        console.log(`Processing identity verification for professional ${professionalId}`);

        // Check if professional exists
        const existingPro = await prisma.professional.findUnique({
          where: { id: professionalId }
        });

        if (existingPro) {
          if (existingPro.isVerified) {
            console.log(`Professional ${professionalId} is already verified. Skipping Stripe identity update.`);
          } else {
            // Prevent activation if banned or suspended
            const newStatus = (existingPro.status === 'BANNED' || existingPro.status === 'SUSPENDED')
              ? existingPro.status
              : 'ACTIVE';

            // ATOMIC UPDATE: Only update if isVerified is still false
            await prisma.$transaction(async (tx) => {
              const result = await tx.professional.updateMany({
                where: {
                  id: professionalId,
                  isVerified: false // Critical: Only update if not yet verified
                },
                data: {
                  isVerified: true,
                  verificationMethod: 'STRIPE_IDENTITY',
                  stripeIdentityVerificationId: session.id,
                  verifiedAt: new Date(),
                  status: newStatus
                }
              });

              if (result.count > 0) {
                // Create a record in VerificationDocument for visibility
                await tx.verificationDocument.create({
                  data: {
                    professionalId: professionalId,
                    type: 'OTHER',
                    fileName: 'Stripe Verification Report',
                    fileUrl: session.url || '',
                    status: 'APPROVED',
                    reviewedBy: 'STRIPE_AUTOMATION',
                    reviewedAt: new Date(),
                    adminNotes: `Verified via Stripe Identity Session: ${session.id}`
                  }
                });
                console.log(`Successfully verified professional ${professionalId} via Stripe Identity`);
              } else {
                console.log(`Professional ${professionalId} was verified by another process (Admin/Other) just now. Skipping Stripe update.`);
              }
            });
          }
        } else {
          console.warn(`Professional ${professionalId} not found during identity verification webhook.`);
        }
      }
    }

    return successResponse({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
