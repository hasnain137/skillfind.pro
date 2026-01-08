'use server';

import { prisma } from '@/lib/prisma';

const IDENTITY_DOC_TYPES = ['IDENTITY_CARD', 'PASSPORT', 'DRIVERS_LICENSE'];

/**
 * Centralized verification status computation.
 * 
 * Rules:
 * - isVerified = true ONLY if BOTH identity AND qualifications are verified
 * - Identity can be verified via Stripe or Manual Admin action
 * - Qualifications must be explicitly approved by Admin
 * 
 * Call this function after ANY change to:
 * - qualificationVerified
 * - stripeIdentityVerificationId
 * - Identity document approval
 * - Adding new services (which resets qualificationVerified)
 */
export async function updateProfessionalVerificationStatus(professionalId: string): Promise<{
    isVerified: boolean;
    hasIdentity: boolean;
    hasQualifications: boolean;
}> {
    const professional = await prisma.professional.findUnique({
        where: { id: professionalId },
        include: { documents: true }
    });

    if (!professional) {
        throw new Error(`Professional ${professionalId} not found`);
    }

    // Check identity: Either Stripe ID verification or manually approved identity doc
    const hasIdentity = !!professional.stripeIdentityVerificationId ||
        professional.documents.some(d =>
            IDENTITY_DOC_TYPES.includes(d.type) &&
            d.status === 'APPROVED'
        );

    // Check qualifications: Must be explicitly approved
    const hasQualifications = professional.qualificationVerified;

    // Compute final verification status
    const shouldBeVerified = hasIdentity && hasQualifications;

    // Only update if changed
    if (professional.isVerified !== shouldBeVerified) {
        await prisma.professional.update({
            where: { id: professionalId },
            data: {
                isVerified: shouldBeVerified,
                verifiedAt: shouldBeVerified ? new Date() : null,
            }
        });
        console.log(`[Verification] Professional ${professionalId}: isVerified changed to ${shouldBeVerified}`);
    }

    return {
        isVerified: shouldBeVerified,
        hasIdentity,
        hasQualifications
    };
}

/**
 * Admin override: Force set qualificationVerified
 */
export async function setQualificationVerified(
    professionalId: string,
    verified: boolean,
    adminId: string
): Promise<void> {
    await prisma.professional.update({
        where: { id: professionalId },
        data: { qualificationVerified: verified }
    });

    // Log admin action
    await prisma.adminAction.create({
        data: {
            adminId,
            action: verified ? 'USER_VERIFIED' : 'USER_REJECTED',
            targetType: 'PROFESSIONAL_QUALIFICATION',
            targetId: professionalId,
            metadata: { qualificationVerified: verified }
        }
    });

    // Recompute verification status
    await updateProfessionalVerificationStatus(professionalId);
}

/**
 * Admin override: Force set identity verification
 */
export async function setIdentityVerified(
    professionalId: string,
    verified: boolean,
    adminId: string
): Promise<void> {
    if (verified) {
        // Set a manual identity verification marker
        await prisma.professional.update({
            where: { id: professionalId },
            data: {
                verificationMethod: 'MANUAL',
                verifiedBy: adminId,
                // We use a placeholder to indicate manual identity verification
                stripeIdentityVerificationId: `MANUAL_${adminId}_${Date.now()}`
            }
        });
    } else {
        // Clear identity verification
        await prisma.professional.update({
            where: { id: professionalId },
            data: {
                stripeIdentityVerificationId: null,
                verificationMethod: 'MANUAL',
                verifiedBy: adminId
            }
        });
    }

    // Log admin action
    await prisma.adminAction.create({
        data: {
            adminId,
            action: verified ? 'USER_VERIFIED' : 'USER_REJECTED',
            targetType: 'PROFESSIONAL_IDENTITY',
            targetId: professionalId,
            metadata: { identityVerified: verified }
        }
    });

    // Recompute verification status
    await updateProfessionalVerificationStatus(professionalId);
}
