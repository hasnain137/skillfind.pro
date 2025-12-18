'use client';

import { Container } from "@/components/ui/Container";
import { Skeleton, SkeletonStats } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function ClientDashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Hero skeleton */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24 bg-white/20" />
                        <Skeleton className="h-8 w-64 bg-white/20" />
                        <Skeleton className="h-4 w-80 bg-white/20" />
                    </div>
                    <Skeleton className="h-10 w-36 rounded-lg bg-white/20" />
                </div>
                <div className="mt-4 flex gap-4">
                    <Skeleton className="h-6 w-28 rounded-full bg-white/20" />
                    <Skeleton className="h-6 w-32 rounded-full bg-white/20" />
                </div>
            </div>

            {/* Stats skeleton */}
            <SkeletonStats />

            {/* Action cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i} className="p-6">
                        <Skeleton className="h-5 w-40 mb-3" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </Card>
                ))}
            </div>

            {/* Requests list skeleton */}
            <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                            <div className="flex-1">
                                <Skeleton className="h-4 w-48 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
