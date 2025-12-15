import { Link } from '@/i18n/routing';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

export default async function AdminProfessionalsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams.page) || 1;
    const limit = 20;
    const status = resolvedParams.status as string | undefined;

    const where: any = {};
    if (status) {
        where.status = status;
    }

    const [professionals, total] = await Promise.all([
        prisma.professional.findMany({
            where,
            include: {
                user: true,
                wallet: true,
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.professional.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SectionHeading
                    eyebrow="User Management"
                    title="Professionals"
                    description="Manage professional accounts and verification status."
                />
                <div className="flex gap-2">
                    <Link href="/admin/professionals?status=PENDING_REVIEW">
                        <Button variant={status === 'PENDING_REVIEW' ? 'default' : 'outline'} className="text-xs">
                            Pending Review
                        </Button>
                    </Link>
                    <Link href="/admin/professionals">
                        <Button variant={!status ? 'default' : 'outline'} className="text-xs">
                            All
                        </Button>
                    </Link>
                </div>
            </div>

            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-[#7C7373]">
                            <tr>
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Verification</th>
                                <th className="px-6 py-3 font-medium">Balance</th>
                                <th className="px-6 py-3 font-medium">Joined</th>
                                <th className="px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {professionals.map((pro) => (
                                <tr key={pro.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[#333333]">
                                            {pro.user.firstName} {pro.user.lastName}
                                        </div>
                                        <div className="text-xs text-[#7C7373]">{pro.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={
                                                pro.status === 'ACTIVE'
                                                    ? 'success'
                                                    : pro.status === 'PENDING_REVIEW'
                                                        ? 'warning'
                                                        : pro.status === 'BANNED'
                                                            ? 'destructive'
                                                            : 'gray'
                                            }
                                        >
                                            {pro.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {pro.isVerified ? (
                                            <span className="flex items-center gap-1 text-green-600">
                                                ✅ Verified
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Unverified</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        €{((pro.wallet?.balance || 0) / 100).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-[#7C7373]">
                                        {new Date(pro.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/professionals/${pro.id}`}>
                                            <Button variant="ghost" className="text-xs">
                                                View Details
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {professionals.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-[#7C7373]">
                                        No professionals found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Basic Pagination */}
            <div className="flex justify-center gap-2">
                {page > 1 && (
                    <Link href={`/admin/professionals?page=${page - 1}${status ? `&status=${status}` : ''}`}>
                        <Button variant="outline" className="text-xs">Previous</Button>
                    </Link>
                )}
                <span className="flex items-center text-sm text-[#7C7373]">
                    Page {page} of {totalPages || 1}
                </span>
                {page < totalPages && (
                    <Link href={`/admin/professionals?page=${page + 1}${status ? `&status=${status}` : ''}`}>
                        <Button variant="outline" className="text-xs">Next</Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
