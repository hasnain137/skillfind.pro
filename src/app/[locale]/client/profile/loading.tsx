import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ClientProfileLoading() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-48 mb-1" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* Profile Form Skeleton */}
            <Card padding="lg">
                {/* Basic Information */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-40" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Skeleton className="h-3 w-20 mb-2" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <div>
                            <Skeleton className="h-3 w-20 mb-2" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <div>
                            <Skeleton className="h-3 w-16 mb-2" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-3 w-48 mt-1" />
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="border-t border-[#E5E7EB] pt-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-44" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Skeleton className="h-3 w-24 mb-2" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <div>
                            <Skeleton className="h-3 w-24 mb-2" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-3 w-56 mt-1" />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="border-t border-[#E5E7EB] pt-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Skeleton className="h-3 w-12 mb-2" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <div>
                            <Skeleton className="h-3 w-16 mb-2" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <div>
                            <Skeleton className="h-3 w-20 mb-2" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </Card>
        </div>
    );
}
