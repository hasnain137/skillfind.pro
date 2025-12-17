'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Link } from '@/i18n/routing';

interface StatusCardProps {
    status: 'ACTIVE' | 'INCOMPLETE' | 'PENDING_REVIEW' | 'SUSPENDED' | 'BANNED' | 'REJECTED';
    isVerified: boolean;
    verificationMethod: string;
}

export function StatusCard({ status, isVerified, verificationMethod }: StatusCardProps) {
    const isSuspended = status === 'SUSPENDED' || status === 'BANNED';
    const canSendOffers = status === 'ACTIVE';

    const getStatusColor = () => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700';
            case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-700';
            case 'SUSPENDED':
            case 'BANNED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'ACTIVE': return 'Active';
            case 'PENDING_REVIEW': return 'Pending Review';
            case 'SUSPENDED': return 'Suspended';
            case 'BANNED': return 'Banned';
            case 'INCOMPLETE': return 'Incomplete';
            default: return status;
        }
    };

    return (
        <Card level={1} className={`border-l-4 ${isSuspended ? 'border-l-red-500' : 'border-l-blue-500'}`}>
            <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">Account Status</h3>
                    <Badge className={getStatusColor()}>{getStatusLabel()}</Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Verification Status */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Verification:</span>
                    {isVerified ? (
                        <span className="flex items-center text-green-600 font-medium gap-1">
                            ✓ Verified
                        </span>
                    ) : (
                        <Link href="/pro/profile" className="text-blue-600 hover:underline">
                            Verify Now →
                        </Link>
                    )}
                </div>

                {/* Offer Capability */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Sending Offers:</span>
                    {canSendOffers ? (
                        <span className="text-green-600 font-medium">Enabled</span>
                    ) : (
                        <span className="text-red-600 font-medium">Disabled</span>
                    )}
                </div>

                {/* Additional Context */}
                {!canSendOffers && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200">
                        {status === 'INCOMPLETE' && "Complete your profile to start sending offers."}
                        {status === 'PENDING_REVIEW' && "Your profile is under review. You will be able to send offers once approved."}
                        {status === 'SUSPENDED' && "Your account is suspended. Please contact support."}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
