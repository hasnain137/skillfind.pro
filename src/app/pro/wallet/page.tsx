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

    const totalSpent = recentTransactions
        .filter(tx => tx.type === 'CLICK_CHARGE')
        .reduce((sum, tx) => sum + tx.amount, 0) / 100;

    const isLowBalance = balanceEuros < 2;

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Wallet"
                title="Balance & Transactions"
                description="Manage your funds and track your spending on client leads."
            />

            {/* Main Balance Card - Full Width */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-[#2563EB] via-[#1D4FD8] to-[#1E40AF] text-white border-none" padding="lg">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
                <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">Current Balance</p>
                            <p className="mt-2 text-5xl font-bold">€{balanceEuros.toFixed(2)}</p>
                            {isLowBalance && (
                                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-100">
                                    ⚠️ Low Balance - Add funds to continue
                                </div>
                            )}
                        </div>
                        <div className="text-4xl">💰</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-4">
                        <div>
                            <p className="text-xs text-blue-200">Clicks Today</p>
                            <p className="text-xl font-bold">{clicksToday}/{dailyLimit}</p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-200">Remaining</p>
                            <p className="text-xl font-bold">{clicksRemaining}</p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-200">Total Spent</p>
                            <p className="text-xl font-bold">€{totalSpent.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            variant="ghost"
                            className="w-full bg-white text-[#2563EB] hover:bg-blue-50 border border-blue-100 shadow-md"
                        >
                            💳 Add Funds to Wallet
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Info Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card padding="lg" className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="text-2xl mb-2">👁️</div>
                    <p className="text-xs text-blue-700 font-medium">Cost per Click</p>
                    <p className="text-2xl font-bold text-blue-600">€0.10</p>
                </Card>
                <Card padding="lg" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="text-2xl mb-2">⚡</div>
                    <p className="text-xs text-green-700 font-medium">Daily Limit</p>
                    <p className="text-2xl font-bold text-green-600">{dailyLimit} clicks</p>
                </Card>
                <Card padding="lg" className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="text-2xl mb-2">🔄</div>
                    <p className="text-xs text-purple-700 font-medium">Resets</p>
                    <p className="text-2xl font-bold text-purple-600">Midnight</p>
                </Card>
            </div>

            {/* Transactions */}
            <Card padding="none" className="overflow-hidden">
                <div className="border-b border-[#E5E7EB] px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
                        <span>📝</span> Recent Transactions
                    </h3>
                </div>

                {recentTransactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-5xl mb-4">💳</div>
                        <h3 className="text-lg font-semibold text-[#333333] mb-2">No transactions yet</h3>
                        <p className="text-sm text-[#7C7373] max-w-md mx-auto">
                            Your transaction history will appear here when you add funds or profile clicks are charged.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#E5E7EB]">
                        {recentTransactions.map((tx) => {
                            const isDeposit = tx.type === 'DEPOSIT';
                            const isClick = tx.type === 'CLICK_CHARGE';
                            
                            return (
                                <div key={tx.id} className="group flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${
                                            isDeposit ? 'bg-green-100' : 'bg-blue-100'
                                        }`}>
                                            {isDeposit ? '💰' : '👁️'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#333333]">
                                                {tx.description}
                                            </p>
                                            <p className="text-xs text-[#7C7373] mt-0.5">
                                                {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-base font-bold ${
                                            isDeposit ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {isDeposit ? '+' : '-'}€{(tx.amount / 100).toFixed(2)}
                                        </p>
                                        <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'gray'}>
                                            {tx.status}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Help Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200" padding="lg">
                <h3 className="text-base font-bold text-[#333333] flex items-center gap-2 mb-3">
                    <span>💡</span> How Wallet Works
                </h3>
                <div className="space-y-2 text-sm text-[#7C7373]">
                    <p>• <strong>€0.10 per click:</strong> You're only charged when a client views your full profile after seeing your offer</p>
                    <p>• <strong>Daily limit:</strong> Protects you from overspending - currently set to {dailyLimit} clicks per day</p>
                    <p>• <strong>Minimum balance:</strong> Keep at least €2.00 to continue receiving requests</p>
                    <p>• <strong>Auto-resets:</strong> Your daily click counter resets at midnight each day</p>
                </div>
            </Card>
        </div>
    );
}
