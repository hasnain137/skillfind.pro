import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import ReviewModerationActions from './ReviewModerationActions';

export default async function AdminReviewsPage() {
    const pendingReviews = await prisma.review.findMany({
        where: { moderationStatus: 'PENDING' },
        include: {
            client: { include: { user: true } },
            job: {
                include: {
                    professional: { include: { user: true } },
                    request: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Content Management"
                title="Review Moderation"
                description="Approve or reject client reviews."
            />

            {pendingReviews.length === 0 ? (
                <Card padding="lg" className="text-center text-[#7C7373]">
                    <p>No pending reviews to moderate. 🎉</p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {pendingReviews.map((review) => (
                        <Card key={review.id} padding="lg">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[#333333]">
                                            {review.client.user.firstName} {review.client.user.lastName}
                                        </span>
                                        <span className="text-[#7C7373]">reviewed</span>
                                        <span className="font-bold text-[#333333]">
                                            {review.job.professional.user.firstName} {review.job.professional.user.lastName}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#7C7373]">
                                        Job: {review.job.request.title} • {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <Badge variant="warning">Pending</Badge>
                            </div>

                            <div className="mb-4 rounded-lg bg-gray-50 p-4">
                                <div className="mb-2 flex items-center gap-1 text-yellow-500">
                                    {'★'.repeat(review.rating)}
                                    <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                                </div>
                                {review.title && (
                                    <h4 className="mb-1 font-bold text-[#333333]">{review.title}</h4>
                                )}
                                <p className="text-sm text-[#333333]">{review.content}</p>
                            </div>

                            <ReviewModerationActions reviewId={review.id} />
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
