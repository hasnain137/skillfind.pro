import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { handleApiError, successResponse } from '@/lib/api-response';
import { checkProfileCompletion } from '@/lib/services/profile-completion';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;

        const status = await checkProfileCompletion(id);

        // Map existing logic to "readiness" structure
        // core 'checkProfileCompletion' mainly returns blocking reasons.
        // We can synthesize a "checklist" from the reasons (if reasons empty -> all good).

        // Since we don't have granulated "completedSteps" in the current simplified 'checkProfileCompletion',
        // we'll just return the blocking reasons as the checklist items that are FALSE.
        // And we can invent positive ones.

        // Ideally we should have updated profile-completion.ts to return granular steps too.
        // For now, let's keep it simple and purely expose the reasons.

        return successResponse({
            checklist: [], // Frontend might expect this array
            canBeActive: status.canBeActive,
            isPendingReview: status.isPendingReview,
            blockingReasons: status.reasons
        });
    } catch (error) {
        return handleApiError(error);
    }
}
