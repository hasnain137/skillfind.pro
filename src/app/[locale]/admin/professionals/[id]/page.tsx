import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import AdminProfessionalActions from './AdminProfessionalActions';
import WalletTopUp from './WalletTopUp';
import { AdminReadinessChecklist } from '@/components/admin/AdminReadinessChecklist';

import { Prisma } from '@prisma/client';

type ProfessionalWithDetails = Prisma.ProfessionalGetPayload<{
    include: {
        user: true;
        wallet: true;
        documents: true;
        services: {
            include: {
                subcategory: {
                    include: { category: true }
                }
            }
        }
    }
}>;

export default async function AdminProfessionalDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const professional = await prisma.professional.findUnique({
        where: { id },
        include: {
            user: true,
            wallet: true,
            documents: true,
            services: {
                include: {
                    subcategory: {
                        include: { category: true }
                    }
                }
            }
        },
    }) as any;

    if (!professional) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <SectionHeading
                eyebrow="User Management"
                title={`${professional.user.firstName} ${professional.user.lastName}`}
                description={`Professional ID: ${professional.id}`}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Profile & Stats */}
                <div className="space-y-6 lg:col-span-2">
                    <AdminReadinessChecklist professionalId={professional.id} />
                    <Card padding="lg">
                        <h3 className="mb-4 text-lg font-bold text-[#333333]">Profile Details</h3>
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs text-[#7C7373]">Email</dt>
                                <dd className="text-sm font-medium text-[#333333]">{professional.user.email}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#7C7373]">Phone</dt>
                                <dd className="text-sm font-medium text-[#333333]">
                                    {professional.user.phoneNumber || 'Not provided'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#7C7373]">Location</dt>
                                <dd className="text-sm font-medium text-[#333333]">
                                    {professional.city}, {professional.country}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#7C7373]">Joined</dt>
                                <dd className="text-sm font-medium text-[#333333]">
                                    {new Date(professional.createdAt).toLocaleDateString()}
                                </dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-xs text-[#7C7373]">Bio</dt>
                                <dd className="text-sm text-[#333333]">{professional.bio || 'No bio provided.'}</dd>
                            </div>
                        </dl>
                    </Card>

                    <Card padding="lg">
                        <h3 className="mb-4 text-lg font-bold text-[#333333]">Services</h3>
                        <div className="flex flex-wrap gap-2">
                            {professional.services.map((service: any) => (
                                <Badge key={service.id} variant="gray">
                                    {service.subcategory?.category?.nameEn} › {service.subcategory?.nameEn}
                                </Badge>
                            ))}
                            {professional.services.length === 0 && (
                                <p className="text-sm text-[#7C7373]">No services listed.</p>
                            )}
                        </div>
                    </Card>

                    <AdminProfessionalActions
                        professionalId={professional.id}
                        currentStatus={professional.status}
                        isVerified={professional.isVerified}
                        documents={professional.documents.map((d: any) => ({
                            id: d.id,
                            type: d.type,
                            status: d.status,
                            fileUrl: d.fileUrl,
                            fileName: d.fileName,
                            rejectionReason: d.rejectionReason
                        }))}
                    />
                </div>

                {/* Right Column: Wallet & Status */}
                <div className="space-y-6">
                    <Card padding="lg">
                        <h3 className="mb-4 text-lg font-bold text-[#333333]">Account Status</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-[#7C7373]">Current Status</p>
                                <Badge
                                    variant={
                                        professional.status === 'ACTIVE'
                                            ? 'success'
                                            : professional.status === 'PENDING_REVIEW'
                                                ? 'warning'
                                                : professional.status === 'BANNED'
                                                    ? 'destructive'
                                                    : 'gray'
                                    }
                                    className="mt-1"
                                >
                                    {professional.status}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs text-[#7C7373]">Verification</p>
                                <div className="mt-1 flex items-center gap-2">
                                    {professional.isVerified ? (
                                        <span className="text-sm font-medium text-green-600">Verified</span>
                                    ) : (
                                        <span className="text-sm font-medium text-gray-500">Unverified</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="lg">
                        <h3 className="mb-4 text-lg font-bold text-[#333333]">Wallet</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-[#7C7373]">Current Balance</p>
                                <p className="text-2xl font-bold text-[#333333]">
                                    €{((professional.wallet?.balance || 0) / 100).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-[#7C7373]">Total Spent</p>
                                <p className="text-sm font-medium text-[#333333]">
                                    €{((professional.wallet?.totalSpent || 0) / 100).toFixed(2)}
                                </p>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <WalletTopUp professionalId={professional.id} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
