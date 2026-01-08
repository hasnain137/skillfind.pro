// src/lib/services/notifications.ts
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    actionUrl?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
    console.log(`[Notification] Creating ${params.type} for user ${params.userId}: ${params.title}`);
    return prisma.notification.create({
        data: {
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            entityType: params.entityType,
            entityId: params.entityId,
            actionUrl: params.actionUrl,
        },
    });
}

/**
 * Notify client when a new offer is received
 */
export async function notifyNewOffer(
    clientUserId: string,
    professionalName: string,
    requestTitle: string,
    requestId: string
) {
    return createNotification({
        userId: clientUserId,
        type: 'NEW_OFFER',
        title: 'New offer received!',
        message: `${professionalName} sent you an offer for "${requestTitle}"`,
        entityType: 'request',
        entityId: requestId,
        actionUrl: `/client/requests/${requestId}`,
    });
}

/**
 * Notify professional when their offer is accepted
 */
export async function notifyOfferAccepted(
    proUserId: string,
    clientName: string,
    requestTitle: string,
    jobId: string
) {
    return createNotification({
        userId: proUserId,
        type: 'OFFER_ACCEPTED',
        title: 'Offer accepted! 🎉',
        message: `${clientName} accepted your offer for "${requestTitle}"`,
        entityType: 'job',
        entityId: jobId,
        actionUrl: `/pro/jobs/${jobId}`,
    });
}

/**
 * Notify professional when their offer is rejected
 */
export async function notifyOfferRejected(
    proUserId: string,
    requestTitle: string
) {
    return createNotification({
        userId: proUserId,
        type: 'OFFER_REJECTED',
        title: 'Offer not selected',
        message: `Your offer for "${requestTitle}" was not selected`,
        entityType: 'offer',
    });
}

/**
 * Notify about job status change
 */
export async function notifyJobStarted(
    clientUserId: string,
    proName: string,
    jobId: string
) {
    return createNotification({
        userId: clientUserId,
        type: 'JOB_STARTED',
        title: 'Job has started',
        message: `${proName} has started working on your job`,
        entityType: 'job',
        entityId: jobId,
        actionUrl: `/client/jobs/${jobId}`,
    });
}

/**
 * Notify about job completion
 */
export async function notifyJobCompleted(
    clientUserId: string,
    proName: string,
    jobId: string
) {
    return createNotification({
        userId: clientUserId,
        type: 'JOB_COMPLETED',
        title: 'Job completed! ✅',
        message: `${proName} has completed your job. Leave a review!`,
        entityType: 'job',
        entityId: jobId,
        actionUrl: `/client/jobs/${jobId}/review`,
    });
}

/**
 * Notify professional about new review
 */
export async function notifyNewReview(
    proUserId: string,
    clientName: string,
    rating: number,
    jobId: string
) {
    return createNotification({
        userId: proUserId,
        type: 'NEW_REVIEW',
        title: `New ${rating}⭐ review`,
        message: `${clientName} left you a review`,
        entityType: 'review',
        entityId: jobId,
        actionUrl: `/pro/jobs/${jobId}`,
    });
}

/**
 * Notify about low wallet balance
 */
export async function notifyLowBalance(
    proUserId: string,
    currentBalance: number
) {
    return createNotification({
        userId: proUserId,
        type: 'LOW_BALANCE',
        title: 'Low wallet balance ⚠️',
        message: `Your balance is €${(currentBalance / 100).toFixed(2)}. Top up to continue receiving requests.`,
        actionUrl: '/pro/wallet',
    });
}

/**
 * Notify professional when a clicking charge is applied
 */
export async function notifyClickCharge(
    proUserId: string,
    amountCents: number,
    clientName: string,
    remainingBalanceCents: number
) {
    return createNotification({
        userId: proUserId,
        type: 'WALLET_DEBIT',
        title: `€${(amountCents / 100).toFixed(2)} charged`,
        message: `${clientName} viewed your profile. Balance: €${(remainingBalanceCents / 100).toFixed(2)}`,
        actionUrl: '/pro/wallet',
    });
}

/**
 * Notify professional about a new matching request
 */
export async function notifyNewMatchingRequest(
    proUserId: string,
    requestTitle: string,
    requestId: string,
    subcategoryName: string
) {
    return createNotification({
        userId: proUserId,
        type: 'MATCHING_REQUEST',
        title: 'New request for you! 🎯',
        message: `A new request for "${requestTitle}" matches your service "${subcategoryName}"`,
        entityType: 'request',
        entityId: requestId,
        actionUrl: `/pro/requests/${requestId}/offer`,
    });
}

/**
 * Notify professional about existing matching requests when they add a service
 */
export async function notifyExistingMatches(
    proUserId: string,
    subcategoryName: string,
    matchCount: number
) {
    return createNotification({
        userId: proUserId,
        type: 'MATCHING_REQUEST',
        title: 'Matching requests found! ✨',
        message: `We found ${matchCount} active ${matchCount === 1 ? 'request' : 'requests'} for your new service "${subcategoryName}"`,
        actionUrl: '/pro/requests',
    });
}
