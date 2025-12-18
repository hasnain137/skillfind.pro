'use client';

import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function ClientJobsLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>

            {/* Jobs list skeleton */}
            <SkeletonTable rows={4} />
        </div>
    );
}
