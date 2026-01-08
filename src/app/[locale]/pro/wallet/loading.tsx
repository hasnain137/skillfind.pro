'use client';

import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function ProWalletLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
            </div>

            {/* Balance card skeleton */}
            <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-800">
                <div className="text-center space-y-2">
                    <Skeleton className="h-4 w-24 mx-auto bg-white/20" />
                    <Skeleton className="h-12 w-32 mx-auto bg-white/20" />
                    <Skeleton className="h-10 w-40 mx-auto rounded-lg bg-white/20" />
                </div>
            </Card>

            {/* Stats skeleton */}
            <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-6 w-16" />
                    </Card>
                ))}
            </div>

            {/* Transactions skeleton */}
            <Card className="p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-32 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-16" />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
