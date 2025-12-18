'use client';

import { Skeleton, SkeletonStats } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function AdminDashboardLoading() {
    return (
        <div className="p-6 space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Stats skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-4">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-20" />
                    </Card>
                ))}
            </div>

            {/* Charts/tables skeleton */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </Card>
                <Card className="p-6">
                    <Skeleton className="h-5 w-40 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-32 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
