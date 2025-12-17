import { StatusType } from "@/components/ui/StatusBanner";

// Helper function to map professional status to banner props
export function getProfessionalStatusBanner(status: string): {
    status: StatusType;
    title: string;
    description: string;
} | null {
    if (!status) return null;

    switch (status) {
        case 'PENDING_REVIEW':
            return {
                status: 'pending',
                title: 'Account Under Review',
                description: "Your profile is currently being reviewed by our team. You can browse and update your profile, but cannot send offers yet.",
            };
        case 'SUSPENDED':
            return {
                status: 'error',
                title: 'Account Suspended',
                description: "Your account has been suspended. Please contact support to resolve this issue.",
            };
        case 'BANNED':
            return {
                status: 'error',
                title: 'Account Banned',
                description: "Your account has been deactivated. Please contact support for more information.",
            };
        case 'INCOMPLETE':
            return {
                status: 'info',
                title: 'Complete Your Profile',
                description: "Please complete your profile details to get verified and start receiving requests.",
            };
        default:
            return null;
    }
}

