import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

export default async function AdminClientsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams.page) || 1;
    const limit = 20;

    const [clients, total] = await Promise.all([
        prisma.client.findMany({
            include: {
                user: true,
                _count: {
                    select: { requests: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.client.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="User Management"
                title="Clients"
                description="Manage client accounts."
            />

            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-[#7C7373]">
                            <tr>
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Location</th>
                                <th className="px-6 py-3 font-medium">Requests</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Joined</th>
                                <th className="px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[#333333]">
                                            {client.user.firstName} {client.user.lastName}
                                        </div>
                                        <div className="text-xs text-[#7C7373]">{client.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {client.city ? `${client.city}, ${client.country}` : 'Not specified'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {client._count.requests}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={client.user.isActive ? 'success' : 'destructive'}>
                                            {client.user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-[#7C7373]">
                                        {new Date(client.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="ghost" className="text-xs" disabled>
                                            Manage
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {clients.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-[#7C7373]">
                                        No clients found.
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
                    <Link href={`/admin/clients?page=${page - 1}`}>
                        <Button variant="outline" className="text-xs">Previous</Button>
                    </Link>
                )}
                <span className="flex items-center text-sm text-[#7C7373]">
                    Page {page} of {totalPages || 1}
                </span>
                {page < totalPages && (
                    <Link href={`/admin/clients?page=${page + 1}`}>
                        <Button variant="outline" className="text-xs">Next</Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
