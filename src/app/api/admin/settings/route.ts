import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

const updateSettingsSchema = z.object({
    clickFee: z.number().min(0),
    minimumWalletBalance: z.number().min(0),
    maxOffersPerRequest: z.number().min(1),
    phoneVerificationEnabled: z.boolean(),
});

export async function PATCH(request: NextRequest) {
    try {
        const { userId } = await requireAdmin();

        const body = await request.json();
        const data = updateSettingsSchema.parse(body);

        // Update the first settings record (singleton pattern)
        // We use updateMany because we might not know the ID, but there should only be one
        const settings = await prisma.platformSettings.findFirst();

        let updatedSettings;
        if (settings) {
            updatedSettings = await prisma.platformSettings.update({
                where: { id: settings.id },
                data: {
                    ...data,
                    updatedBy: userId,
                },
            });
        } else {
            updatedSettings = await prisma.platformSettings.create({
                data: {
                    ...data,
                    updatedBy: userId,
                },
            });
        }

        return successResponse({ settings: updatedSettings }, 'Settings updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
