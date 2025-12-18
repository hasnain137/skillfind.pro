'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertTriangle, User, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Dispute {
    id: string;
    reason: string;
    description: string;
    status: string;
    raisedBy: string;
    createdAt: string;
    resolution?: string;
    job: {
        id: string;
        agreedPrice: number;
        request: {
            title: string;
            category: string;
        };
        client: {
            user: {
                firstName: string;
                lastName: string;
                email: string;
            };
        };
        professional: {
            title: string;
            user: {
                firstName: string;
                lastName: string;
                email: string;
            };
        };
    };
}

export function DisputesList() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('OPEN');
    const [resolving, setResolving] = useState<string | null>(null);

    useEffect(() => {
        fetchDisputes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    async function fetchDisputes() {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/disputes?status=${status}`);
            const json = await res.json();
            if (json.success) {
                setDisputes(json.data?.disputes || []);
            }
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
        } finally {
            setLoading(false);
        }
    }

    async function resolveDispute(disputeId: string, resolution: string) {
        setResolving(disputeId);
        try {
            const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resolution }),
            });
            if (res.ok) {
                fetchDisputes();
            }
        } catch (error) {
            console.error('Failed to resolve dispute:', error);
        } finally {
            setResolving(null);
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <Card key={i} level={1}>
                        <CardContent className="p-6">
                            <Skeleton className="h-6 w-1/2 mb-4" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Status Filter */}
            <div className="flex gap-2 mb-4">
                {['OPEN', 'RESOLVED', 'DISMISSED'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${status === s
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-[#7C7373] hover:bg-gray-200'
                            }`}
                    >
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {disputes.length === 0 ? (
                <Card level={1}>
                    <CardContent className="py-8 text-center">
                        <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-3" />
                        <p className="text-[#333333] font-medium">No {status.toLowerCase()} disputes</p>
                        <p className="text-sm text-[#7C7373]">All clear!</p>
                    </CardContent>
                </Card>
            ) : (
                disputes.map(dispute => (
                    <Card key={dispute.id} level={1}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-[#333333]">{dispute.reason}</h3>
                                        <p className="text-xs text-[#7C7373]">
                                            Raised by {dispute.raisedBy === 'CLIENT' ? 'Client' : 'Professional'} • {new Date(dispute.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={dispute.status === 'OPEN' ? 'warning' : dispute.status === 'RESOLVED' ? 'success' : 'destructive'}>
                                    {dispute.status}
                                </Badge>
                            </div>

                            {/* Job Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 text-sm mb-2">
                                    <Briefcase className="h-4 w-4 text-[#7C7373]" />
                                    <span className="font-medium">{dispute.job.request.title}</span>
                                    <span className="text-[#7C7373]">• €{(dispute.job.agreedPrice / 100).toFixed(2)}</span>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-500" />
                                        <div>
                                            <span className="text-[#7C7373]">Client: </span>
                                            <span className="font-medium">{dispute.job.client.user.firstName} {dispute.job.client.user.lastName}</span>
                                            <p className="text-xs text-[#7C7373]">{dispute.job.client.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-green-500" />
                                        <div>
                                            <span className="text-[#7C7373]">Pro: </span>
                                            <span className="font-medium">{dispute.job.professional.user.firstName} {dispute.job.professional.user.lastName}</span>
                                            <p className="text-xs text-[#7C7373]">{dispute.job.professional.user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <p className="text-sm text-[#7C7373] mb-1">Description:</p>
                                <p className="text-sm text-[#333333]">{dispute.description || 'No additional details provided.'}</p>
                            </div>

                            {/* Resolution (if resolved) */}
                            {dispute.resolution && (
                                <div className="bg-green-50 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-green-800">
                                        <strong>Resolution:</strong> {dispute.resolution}
                                    </p>
                                </div>
                            )}

                            {/* Action buttons (only for open disputes) */}
                            {dispute.status === 'OPEN' && (
                                <div className="flex gap-2 pt-2 border-t border-[#E5E7EB]">
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            const resolution = prompt('Enter resolution notes:');
                                            if (resolution) resolveDispute(dispute.id, resolution);
                                        }}
                                        isLoading={resolving === dispute.id}
                                        className="text-sm"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Resolve
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => resolveDispute(dispute.id, 'Dismissed - insufficient evidence')}
                                        isLoading={resolving === dispute.id}
                                        className="text-sm"
                                    >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Dismiss
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
