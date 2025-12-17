// src/app/pro/wallet/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProfessionalByClerkId } from "@/lib/get-professional";
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

    const professional = await getProfessionalByClerkId(userId);

    if (!professional) {
        redirect('/auth-redirect');
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
            take: 20, // Increased to show more history
        }),
    ]);

    const balanceEuros = wallet.balance / 100;

    const totalSpent = recentTransactions
        .filter(tx => tx.type === 'DEBIT')
        .reduce((sum, tx) => sum + tx.amount, 0) / 100;

    const isLowBalance = balanceEuros < 2;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            <SectionHeading
                eyebrow="Financials"
                title="Wallet"
                description="Manage your balance and view your transaction history."
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Balance Card (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Credit Card Style Balance */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
                        {/* Abstract Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none overflow-hidden">
                            <div className="w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/40 via-transparent to-transparent blur-3xl animate-pulse" />
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                        </div>

                        <div className="relative p-8 flex flex-col justify-between h-full min-h-[220px]">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Available Balance</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl md:text-5xl font-bold tracking-tight">€{balanceEuros.toFixed(2)}</span>
                                    <span className="text-slate-400 font-medium">EUR</span>
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-8">
                                <div className="space-y-4">
                                    {isLowBalance && (
                                        <Badge variant="warning" className="bg-yellow-500/10 text-yellow-200 border-yellow-500/20 backdrop-blur-sm">
                                            ⚠️ Low Balance
                                        </Badge>
                                    )}
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                        <span>Wallet Active & Ready</span>
                                    </div>
                                </div>
                                <Button
                                    className="bg-white text-slate-950 hover:bg-blue-50 shadow-lg shadow-white/5 font-semibold px-6"
                                    size="lg"
                                >
                                    + Add Funds
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History Section - moved to col-span-2 for tablet/desktop */}
                    <Card padding="none" className="overflow-hidden border-slate-200 shadow-sm hidden lg:block">
                        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                Transaction History
                            </h3>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                                Export CSV
                            </Button>
                        </div>
                        {recentTransactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3">📝</div>
                                <h3 className="text-sm font-semibold text-slate-900">No transactions yet</h3>
                                <p className="text-sm text-slate-500 mt-1">Activity will show up here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recentTransactions.map((tx) => {
                                    const isDeposit = tx.type === 'DEPOSIT';
                                    return (
                                        <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className={`
                                                    h-10 w-10 rounded-full flex items-center justify-center text-lg shadow-sm border
                                                    ${isDeposit ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-600'}
                                                `}>
                                                    {isDeposit ? '↓' : '↑'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${isDeposit ? 'text-green-600' : 'text-slate-900'}`}>
                                                    {isDeposit ? '+' : '-'}€{(tx.amount / 100).toFixed(2)}
                                                </p>
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    COMPLETED
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column: Stats (1/3) */}
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <Card padding="md" className="border-slate-200">
                            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Today's Activity</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{clicksToday}</p>
                                    <p className="text-xs text-slate-500">Profile Clicks</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    👁️
                                </div>
                            </div>
                        </Card>

                        <Card padding="md" className="border-slate-200">
                            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Total Spent</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">€{totalSpent.toFixed(2)}</p>
                                    <p className="text-xs text-slate-500">Last 20 txns</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                                    📉
                                </div>
                            </div>
                        </Card>

                        <Card padding="md" className="border-slate-200">
                            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Cost Per Lead</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">€0.10</p>
                                    <p className="text-xs text-slate-500">Flat Rate</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                                    🏷️
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Transaction History (Mobile Only - visible below lg) */}
                    <div className="lg:hidden">
                        <h3 className="font-semibold text-slate-900 mb-4 px-1">Recent Transactions</h3>
                        <Card padding="none" className="overflow-hidden border-slate-200 shadow-sm">
                            {recentTransactions.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-500">No transactions yet</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {recentTransactions.map((tx) => {
                                        const isDeposit = tx.type === 'DEPOSIT';
                                        return (
                                            <div key={tx.id} className="flex items-center justify-between p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${isDeposit ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {isDeposit ? '↓' : '↑'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{tx.description}</p>
                                                        <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-bold ${isDeposit ? 'text-green-600' : 'text-slate-900'}`}>
                                                    {isDeposit ? '+' : '-'}€{(tx.amount / 100).toFixed(2)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h4 className="font-semibold text-slate-900 text-sm mb-2">About Your Wallet</h4>
                        <ul className="text-xs text-slate-600 space-y-2">
                            <li className="flex gap-2">
                                <span className="text-slate-400">•</span>
                                <span>Funds are used to pay for profile views (€0.10/click).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-slate-400">•</span>
                                <span>Auto-reload is not currently enabled.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-slate-400">•</span>
                                <span>Keep at least €2.00 to stay visible.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
