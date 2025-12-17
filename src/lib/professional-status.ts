import { ProfessionalStatus } from "@prisma/client";


import { StatusType } from "@/components/ui/StatusBanner";

export interface StatusBannerProps {
    status: StatusType;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
}

export function getProfessionalStatusBanner(status: ProfessionalStatus): StatusBannerProps | null {
    switch (status) {
        case 'PENDING_REVIEW':
            return {
                status: 'warning',
                title: 'Verification Pending',
                description: "Your documents are under review. We'll notify you once verified.",
            };
        case 'SUSPENDED':
            return {
                status: 'error',
                title: 'Attention Required',
                description: "Your verification request was rejected. Please check the rejection reason.",
                // In 472db05, there might have been an action here, but for now matching the text
                // logic we just restored in Phase 1's VerificationStatus.
            };
        case 'INCOMPLETE':
            return {
                status: 'info',
                title: 'Complete Your Profile',
                description: "Finish setting up your profile to get verified and receive jobs.",
                action: {
                    label: "Complete Profile",
                    href: "/pro/profile"
                }
            };
        default:
            return null;
    }
}
