'use client';

import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function ClientRequestsLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-36 rounded-lg" />
            </div>

            {/* Requests list skeleton */}
            <SkeletonTable rows={5} />
        </div>
    );
}
