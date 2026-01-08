import { Prisma } from '@prisma/client';

export type RequestMatchingCriteria = {
    city: string | null;
    country: string | null;
    remoteAvailability: 'NO_REMOTE' | 'ONLY_REMOTE' | 'YES_AND_ONSITE' | string; // loose string for safety
    subcategoryIds: string[];
};

/**
 * Builds the Prisma where clause for finding matching requests for a professional.
 * Encapsulates logic for:
 * - Status (OPEN)
 * - Subcategory matching
 * - Location matching (City/Country vs Remote)
 */
export function buildMatchingRequestsWhereClause(criteria: RequestMatchingCriteria): Prisma.RequestWhereInput {
    const { city, country, remoteAvailability, subcategoryIds } = criteria;

    // Base clause: Status OPEN and matching subcategories
    const whereClause: Prisma.RequestWhereInput = {
        status: 'OPEN',
        subcategoryId: {
            in: subcategoryIds,
        },
    };

    // Location matching logic
    if (remoteAvailability === 'NO_REMOTE') {
        // Professional only works on-site - filter for same city AND country
        // If professional has no location set, they cannot match on-site requests properly
        if (!city || !country) {
            // Return a clause that matches nothing to avoid showing incorrect requests
            return {
                ...whereClause,
                id: '__NO_MATCH__',
            };
        }
        whereClause.city = city;
        whereClause.country = country;
        whereClause.locationType = 'ON_SITE';
    } else if (remoteAvailability === 'ONLY_REMOTE') {
        // Professional only works remotely
        whereClause.locationType = 'REMOTE';
    } else {
        // YES_AND_ONSITE (or default) - Can see remote OR local on-site
        const orConditions: Prisma.RequestWhereInput[] = [
            { locationType: 'REMOTE' }
        ];

        // Only add On-Site option if location is available
        if (city && country) {
            orConditions.push({
                locationType: 'ON_SITE',
                city: city,
                country: country,
            });
        }

        whereClause.OR = orConditions;
    }

    return whereClause;
}
