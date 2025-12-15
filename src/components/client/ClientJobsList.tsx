'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ReviewModal from '@/components/reviews/ReviewModal';

type Job = {
    id: string;
    status: string;
    agreedPrice: number | null;
    startedAt: Date | null;
    createdAt: Date;
    completedAt: Date | null;
    request: {
        title: string;
        category: {
            nameEn: string;
        };
    };
    professional: {
        user: {
            firstName: string | null;
            lastName: string | null;
        };
    };
    review?: {
        id: string;
    } | null;
};

type ClientJobsListProps = {
    activeJobs: Job[];
    completedJobs: Job[];
};

const STATUS_VARIANT: Record<string, "primary" | "warning" | "success" | "gray"> = {
    PENDING: "primary",
    IN_PROGRESS: "warning",
    COMPLETED: "success",
    CANCELLED: "gray",
    DISPUTED: "gray",
};

export default function ClientJobsList({ activeJobs, completedJobs }: ClientJobsListProps) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [reviewJobId, setReviewJobId] = useState<string | null>(null);



    return (
        <div className="space-y-6">
            {/* Active Jobs */}
            {activeJobs.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                        <span>⚡</span> Active Jobs ({activeJobs.length})
                    </h2>
                    {activeJobs.map((job) => {
                        const statusConfig = STATUS_VARIANT[job.status] || "gray";
                        const canComplete = job.status === 'IN_PROGRESS';

                        return (
                            <Link key={job.id} href={`/client/jobs/${job.id}`} className="block">
                                <Card className="group hover:border-[#2563EB] hover:shadow-md transition-all duration-200 cursor-pointer" padding="lg">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-[#333333] group-hover:text-[#2563EB] transition-colors truncate">
                                                    {job.request.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-[#7C7373]">
                                                    <span className="flex items-center gap-1">
                                                        👤 {job.professional.user.firstName || 'Professional'} {job.professional.user.lastName || ''}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        📂 {job.request.category.nameEn}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge variant={statusConfig}>{job.status}</Badge>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="flex items-center gap-1 font-semibold text-green-600">
                                                    💰 €{job.agreedPrice?.toFixed(2) || '0.00'}
                                                </span>
                                                <span className="flex items-center gap-1 text-[#7C7373]">
                                                    📅 Started {new Date(job.startedAt || job.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {canComplete && (
                                                <div className="z-10 relative">
                                                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                                        ⏳ Waiting for completion
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </section>
            )}

            {/* Completed Jobs */}
            {completedJobs.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                        <span>🟢</span> Completed Jobs ({completedJobs.length})
                    </h2>
                    {completedJobs.map((job) => (
                        <div key={job.id} className="relative">
                            <Link href={`/client/jobs/${job.id}`}>
                                <Card className="group hover:border-green-500 hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-br from-green-50 to-white border-green-200" padding="lg">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-[#333333] group-hover:text-green-600 transition-colors truncate">
                                                {job.request.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-[#7C7373] mt-1">
                                                <span className="flex items-center gap-1">
                                                    ✅ Completed {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1 font-semibold text-green-600">
                                                    💰 €{job.agreedPrice?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="success">Completed</Badge>
                                    </div>
                                </Card>
                            </Link>
                            {/* Leave Review Button if not reviewed */}
                            {!job.review && (
                                <div className="absolute top-4 right-28 z-10">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="bg-white border border-yellow-300 text-yellow-700 hover:bg-yellow-50 shadow-sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setReviewJobId(job.id);
                                        }}
                                    >
                                        ⭐ Leave Review
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Review Modal */}
            {reviewJobId && (
                <ReviewModal
                    isOpen={!!reviewJobId}
                    onClose={() => setReviewJobId(null)}
                    jobId={reviewJobId}
                    onSuccess={() => {
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
