'use client';

import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";

export default function ProOffersLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>

            {/* Offers list skeleton */}
            <SkeletonTable rows={5} />
        </div>
    );
}
