'use client';

import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";

export default function ProJobsLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-56" />
            </div>

            {/* Stats skeleton */}
            <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-12" />
                    </div>
                ))}
            </div>

            {/* Jobs list skeleton */}
            <SkeletonTable rows={4} />
        </div>
    );
}
