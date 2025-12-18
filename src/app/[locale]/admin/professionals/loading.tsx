'use client';

import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function AdminProfessionalsLoading() {
    return (
        <div className="p-6 space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>

            {/* Filters skeleton */}
            <div className="flex gap-3 flex-wrap">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-10 w-36 rounded-lg" />
                <Skeleton className="h-10 w-40 rounded-lg" />
            </div>

            {/* Table skeleton */}
            <SkeletonTable rows={8} />
        </div>
    );
}
