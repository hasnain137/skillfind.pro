// src/components/dashboard/StatusCard.tsx
'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Link } from '@/i18n/routing';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

interface StatusCardProps {
    status: 'ACTIVE' | 'INCOMPLETE' | 'PENDING_REVIEW' | 'SUSPENDED' | 'BANNED' | 'REJECTED';
    isVerified: boolean;
    verificationMethod: string;
}

export function StatusCard({ status, isVerified, verificationMethod }: StatusCardProps) {
    const isSuspended = status === 'SUSPENDED' || status === 'BANNED';
    const canSendOffers = status === 'ACTIVE' && isVerified;

    const getStatusColor = () => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 ring-green-600/20';
            case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-700 ring-yellow-600/20';
            case 'SUSPENDED':
            case 'BANNED': return 'bg-red-100 text-red-700 ring-red-600/20';
            default: return 'bg-gray-100 text-gray-700 ring-gray-600/20';
        }
    };

    return (
        <Card level={1} className="h-full border border-white/40 shadow-lg">
            <CardHeader className="pb-4 border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${isSuspended ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            {isSuspended ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Account</p>
                            <h3 className="text-lg font-bold text-[#3B4D9D]">Status</h3>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {/* Main Status Display */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <span className="text-sm font-semibold text-[#333333]">Current State</span>
                    <Badge className={`${getStatusColor()} border-0 px-3 py-1 text-xs font-bold ring-1`}>
                        {status.replace('_', ' ')}
                    </Badge>
                </div>

                {/* Verification Status */}
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-gray-200">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Verification</span>
                    {isVerified ? (
                        <span className="flex items-center text-green-600 text-sm font-bold gap-1.5 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                            <CheckCircle2 className="w-4 h-4" />
                            Verified
                        </span>
                    ) : (
                        <Link href="/pro/profile" className="flex items-center bg-[#3B4D9D] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#2a3a7a] transition-all shadow-md hover:shadow-lg gap-1">
                            Verify Now <ChevronRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>

                {/* Offer Capability */}
                <div className="flex justify-between items-center text-sm p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-gray-200">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Offers</span>
                    {canSendOffers ? (
                        <div className="flex items-center gap-2 text-[#333333] font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            Enabled
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 shadow-sm">
                            <XCircle className="w-4 h-4" />
                            Disabled
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
