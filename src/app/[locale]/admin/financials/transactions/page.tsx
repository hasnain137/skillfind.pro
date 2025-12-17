import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';

export default async function AdminTransactionsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams.page) || 1;
    const limit = 50;

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            include: {
                wallet: {
                    include: {
                        professional: {
                            include: { user: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.transaction.count(),
    ]);

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Financials"
                title="Transaction Logs"
                description="View all system transactions."
            />

            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-[#7C7373]">
                            <tr>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Type</th>
                                <th className="px-6 py-3 font-medium">Professional</th>
                                <th className="px-6 py-3 font-medium">Amount</th>
                                <th className="px-6 py-3 font-medium">Description</th>
                                <th className="px-6 py-3 font-medium">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 text-[#7C7373]">
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={
                                                tx.type === 'DEPOSIT'
                                                    ? 'success'
                                                    : tx.type === 'DEBIT'
                                                        ? 'gray'
                                                        : tx.type === 'REFUND'
                                                            ? 'warning'
                                                            : 'primary'
                                            }
                                        >
                                            {tx.type}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[#333333]">
                                            {tx.wallet.professional.user.firstName} {tx.wallet.professional.user.lastName}
                                        </div>
                                        <div className="text-xs text-[#7C7373]">
                                            {tx.wallet.professional.user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        <span className={tx.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}>
                                            {tx.type === 'DEBIT' ? '-' : '+'}€{(tx.amount / 100).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[#333333]">{tx.description}</td>
                                    <td className="px-6 py-4 text-[#7C7373]">
                                        €{(tx.balanceAfter / 100).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
