import { NextRequest, NextResponse } from 'next/server';
import { requireProfessional } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { successResponse, handleApiError, errorResponse } from '@/lib/api-response';
import { BadRequestError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await requireProfessional();

        // 1. Fetch professional and check status
        const professional = await prisma.professional.findUnique({
            where: { userId: userId },
        });

        if (!professional) {
            throw new BadRequestError('Professional not found');
        }

        if (professional.isVerified) {
            return errorResponse(400, 'ALREADY_VERIFIED', 'Professional is already verified.');
        }

        if (professional.status === 'BANNED' || professional.status === 'SUSPENDED') {
            return errorResponse(403, 'FORBIDDEN', 'Account is not eligible for verification.');
        }

        // 2. Create Stripe Verification Session
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const verificationSession = await stripe.identity.verificationSessions.create({
            type: 'document',
            metadata: {
                professionalId: professional.id,
                userId: userId,
            },
            return_url: `${origin}/pro/profile?activeTab=verification`, // Redirect back to profile verification tab
        });

        return successResponse({
            clientSecret: verificationSession.client_secret,
            url: verificationSession.url,
            id: verificationSession.id
        });
    } catch (error) {
        return handleApiError(error);
    }
}
