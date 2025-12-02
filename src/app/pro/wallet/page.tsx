// src/app/pro/wallet/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateWallet } from "@/lib/services/wallet";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function WalletPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/login');
    }

    const professional = await prisma.professional.findUnique({
        where: { userId },
    });

    if (!professional) {
        redirect('/complete-profile');
    }

    // Get wallet and stats directly (mirroring API logic)
    const wallet = await getOrCreateWallet(professional.id);

    const [clicksToday, recentTransactions] = await Promise.all([
        prisma.clickEvent.count({
            where: {
                professionalId: professional.id,
                clickedAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        }),
        prisma.transaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
        }),
    ]);

    const balanceEuros = wallet.balance / 100;
    const dailyLimit = professional.dailyClickLimit || 10;
    const clicksRemaining = Math.max(0, dailyLimit - clicksToday);

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Wallet"
                title="Balance & Transactions"
                description="Manage your funds and track your spending on client leads."
            />

            <div className="grid gap-4 md:grid-cols-3">
                {/* Balance Card */}
                <Card padding="lg" className="md:col-span-1 bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-white border-none">
                    <p className="text-sm font-medium text-blue-100">Current Balance</p>
                    <p className="mt-2 text-3xl font-bold">€{balanceEuros.toFixed(2)}</p>
                    <div className="mt-6">
                        <Button
                            variant="ghost"
                            className="w-full bg-white text-[#2563EB] hover:bg-blue-50 border border-blue-100"
                        >
                            Add Funds
                        </Button>
                    </div>
                </Card>

                {/* Stats Cards */}
                <Card padding="lg" className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-[#333333]">Daily Activity</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-[#F9FAFB] p-4">
                            <p className="text-xs text-[#7C7373]">Clicks Today</p>
                            <p className="mt-1 text-2xl font-semibold text-[#333333]">
                                {clicksToday} <span className="text-sm font-normal text-[#7C7373]">/ {dailyLimit}</span>
                            </p>
                        </div>
                        <div className="rounded-xl bg-[#F9FAFB] p-4">
                            <p className="text-xs text-[#7C7373]">Remaining</p>
                            <p className="mt-1 text-2xl font-semibold text-[#333333]">{clicksRemaining}</p>
                        </div>
                    </div>
                    <p className="text-xs text-[#7C7373]">
                        Your daily limit resets at midnight. You are only charged when a client views your full profile.
                    </p>
                </Card>
            </div>

            {/* Transactions */}
            <Card padding="none" className="overflow-hidden">
                <div className="border-b border-[#E5E7EB] px-6 py-4">
                    <h3 className="font-semibold text-[#333333]">Recent Transactions</h3>
                </div>

                {recentTransactions.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#7C7373]">
                        No transactions yet.
                    </div>
                ) : (
                    <div className="divide-y divide-[#E5E7EB]">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                                <div>
                                    <p className="text-sm font-medium text-[#333333]">
                                        {tx.description}
                                    </p>
                                    <p className="text-xs text-[#7C7373]">
                                        {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-semibold ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-[#333333]'
                                        }`}>
                                        {tx.type === 'DEPOSIT' ? '+' : '-'}€{(tx.amount / 100).toFixed(2)}
                                    </p>
                                    <Badge variant="success">
                                        Completed
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
