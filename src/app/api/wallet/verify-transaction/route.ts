import { NextRequest } from 'next/server';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { completeDeposit } from '@/lib/services/wallet';
import { z } from 'zod';

export async function POST(request: NextRequest) {
    try {
        await requireProfessional();

        const body = await request.json();
        const schema = z.object({
            transactionId: z.string().min(1)
        });

        const data = schema.parse(body);

        const result = await completeDeposit(data.transactionId);

        return successResponse(result);
    } catch (error) {
        return handleApiError(error);
    }
}
