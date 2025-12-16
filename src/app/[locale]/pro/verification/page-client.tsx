
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DocumentUpload } from '@/components/professional/verification/DocumentUpload';
import { VerificationStatus } from '@/components/professional/verification/VerificationStatus';

interface PageProps {
    professional: any; // We'll pass the initial data from server component wrapper
}

export default function VerificationPageClient({ professional }: PageProps) {
    const router = useRouter();

    // We can use router.refresh() to reload server data after upload
    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Trust & Safety"
                title="Identity Verification"
                description="Verify your identity to build trust with clients and unlock full platform access."
            />

            <VerificationStatus
                isVerified={professional.isVerified}
                verificationMethod={professional.verificationMethod}
                documents={professional.documents}
            />

            {/* Only show upload form if not verified (or allow additional docs?) */}
            {/* Let's allow uploading even if verified, in case they need to update docs */}
            <DocumentUpload
                onUploadSuccess={handleRefresh}
                existingDocuments={professional.documents}
            />
        </div>
    );
}
