import { prisma } from '@/lib/prisma';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/routing';

export default async function AdminVerificationQueuePage() {
    // Get pending verifications
    const pendingProfessionals = await prisma.professional.findMany({
        where: {
            OR: [
                { status: 'PENDING_REVIEW' },
                {
                    isVerified: false,
                    documents: {
                        some: { status: 'PENDING' }
                    }
                }
            ]
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            documents: {
                where: { status: 'PENDING' },
            },
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
    });

    const pendingDocCount = await prisma.verificationDocument.count({
        where: { status: 'PENDING' },
    });

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Verification Center"
                title="Pending Verifications"
                description={`${pendingProfessionals.length} professionals awaiting review • ${pendingDocCount} pending documents`}
            />

            {pendingProfessionals.length === 0 ? (
                <Card level={1} className="py-8 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-[#333333] font-medium">All caught up!</p>
                    <p className="text-sm text-[#7C7373]">No pending verifications at the moment.</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {pendingProfessionals.map((pro) => (
                        <Card key={pro.id} level={1} className="hover:shadow-lg transition-shadow">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                                        {pro.user.firstName?.[0] || '?'}{pro.user.lastName?.[0] || ''}
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#333333]">
                                            {pro.user.firstName} {pro.user.lastName}
                                        </p>
                                        <p className="text-xs text-[#7C7373]">{pro.user.email}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant={pro.status === 'PENDING_REVIEW' ? 'warning' : 'gray'}>
                                                {pro.status}
                                            </Badge>
                                            {pro.documents.length > 0 && (
                                                <Badge variant="info">
                                                    {pro.documents.length} pending doc{pro.documents.length > 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                            {!pro.isVerified && (
                                                <Badge variant="gray">Unverified</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right text-xs text-[#7C7373]">
                                        <p>Joined {new Date(pro.createdAt).toLocaleDateString()}</p>
                                        <p>Profile: {pro.profileCompletion}%</p>
                                    </div>
                                    <Link
                                        href={`/admin/professionals/${pro.id}`}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        Review →
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
