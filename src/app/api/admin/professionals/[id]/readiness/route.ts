import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { calculateProfileCompletion, canProfessionalBeActive } from '@/lib/services/profile-completion';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;

        const completion = await calculateProfileCompletion(id);
        const { canBeActive, isPendingReview, reasons } = await canProfessionalBeActive(id);

        // Merge concepts into a unified checklist for Admin
        const checklist = [
            ...completion.completedSteps.map(label => ({ label, isComplete: true })),
            ...completion.missingSteps.map(label => ({ label, isComplete: false }))
        ];

        return successResponse({
            checklist,
            completionPercentage: completion.percentage,
            canBeActive,
            isPendingReview,
            blockingReasons: reasons
        });
    } catch (error) {
        return handleApiError(error);
    }
}
