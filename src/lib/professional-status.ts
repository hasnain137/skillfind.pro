import { StatusType } from "@/components/ui/StatusBanner";

// Helper function to map professional status to banner props
// Returns translation keys for title and description to be translated by the caller
export function getProfessionalStatusBanner(status: string): {
    status: StatusType;
    title: string;
    description: string;
} | null {
    switch (status) {
        case 'PENDING_REVIEW':
            return {
                status: 'pending',
                title: 'Components.StatusBanner.pendingReview.title',
                description: 'Components.StatusBanner.pendingReview.description',
            };
        case 'SUSPENDED':
            return {
                status: 'error',
                title: 'Components.StatusBanner.suspended.title',
                description: 'Components.StatusBanner.suspended.description',
            };
        case 'BANNED':
            return {
                status: 'error',
                title: 'Components.StatusBanner.banned.title',
                description: 'Components.StatusBanner.banned.description',
            };
        case 'INCOMPLETE':
            return {
                status: 'info',
                title: 'Components.StatusBanner.incomplete.title',
                description: 'Components.StatusBanner.incomplete.description',
            };
        default:
            return null;
    }
}
