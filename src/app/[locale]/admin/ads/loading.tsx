import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminAdsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-64 mb-1" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} level={1} className="p-4 text-center">
                        <Skeleton className="h-8 w-12 mx-auto mb-2" />
                        <Skeleton className="h-3 w-20 mx-auto" />
                    </Card>
                ))}
            </div>

            {/* Chart Skeleton */}
            <Card level={1} className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div>
                            <Skeleton className="h-4 w-28 mb-1" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                    <div className="text-right">
                        <Skeleton className="h-6 w-12 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <div className="flex gap-2 items-end h-32">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="flex-1 flex items-end">
                            <Skeleton className={`w-full ${i % 2 === 0 ? 'h-2/3' : 'h-1/2'}`} />
                        </div>
                    ))}
                </div>
            </Card>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-lg" />
                ))}
            </div>

            {/* Campaign Cards */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} level={1} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <div className="flex gap-3">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map((j) => (
                                <div key={j} className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4" />
                                    <div>
                                        <Skeleton className="h-4 w-12 mb-1" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
