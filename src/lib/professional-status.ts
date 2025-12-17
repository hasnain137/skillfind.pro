import { ProfessionalStatus } from "@prisma/client";

export type StatusDetails = {
    status: 'success' | 'warning' | 'error' | 'info';
    title: string;
    description: string;
} | null;

export function getStatusDetails(status: ProfessionalStatus): StatusDetails {
    switch (status) {
        case 'ACTIVE':
            return {
                status: 'success',
                title: 'Account Active',
                description: "Your account is verified and active. You can now receive requests and send offers.",
            };
        case 'PENDING_REVIEW':
            return {
                status: 'warning',
                title: 'Verification Pending',
                description: "Your profile is currently under review by our team. We'll notify you once verification is complete.",
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
