'use client';

import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";

export default function ProRequestsLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* Filters skeleton */}
            <div className="flex gap-3 flex-wrap">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-40 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
            </div>

            {/* Requests list skeleton */}
            <SkeletonTable rows={5} />
        </div>
    );
}
