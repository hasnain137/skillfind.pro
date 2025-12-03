'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface AdminProfessionalActionsProps {
    professionalId: string;
    currentStatus: string;
    documents: {
        id: string;
        type: string;
        status: string;
        fileUrl: string;
        fileName: string;
    }[];
}

export default function AdminProfessionalActions({
    professionalId,
    currentStatus,
    documents,
}: AdminProfessionalActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    async function handleStatusChange(newStatus: string) {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        setLoading('status');
        try {
            const res = await fetch(`/api/admin/professionals/${professionalId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update status');
            router.refresh();
        } catch (error) {
            alert('Error updating status');
            console.error(error);
        } finally {
            setLoading(null);
        }
    }

    async function handleDocumentAction(documentId: string, action: 'APPROVED' | 'REJECTED') {
        if (!confirm(`Are you sure you want to ${action} this document?`)) return;

        setLoading(documentId);
        try {
            const res = await fetch(`/api/admin/documents/${documentId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action }),
            });

            if (!res.ok) throw new Error('Failed to review document');
            router.refresh();
        } catch (error) {
            alert('Error reviewing document');
            console.error(error);
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="space-y-8">
            {/* Account Actions */}
            <div className="flex flex-wrap gap-4">
                {currentStatus !== 'ACTIVE' && (
                    <Button
                        variant="success"
                        onClick={() => handleStatusChange('ACTIVE')}
                        disabled={!!loading}
                    >
                        {loading === 'status' ? 'Updating...' : 'Activate Account'}
                    </Button>
                )}
                {currentStatus !== 'SUSPENDED' && (
                    <Button
                        variant="warning"
                        onClick={() => handleStatusChange('SUSPENDED')}
                        disabled={!!loading}
                    >
                        Suspend Account
                    </Button>
                )}
                {currentStatus !== 'BANNED' && (
                    <Button
                        variant="destructive"
                        onClick={() => handleStatusChange('BANNED')}
                        disabled={!!loading}
                    >
                        Ban Account
                    </Button>
                )}
            </div>

            {/* Documents Review */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#333333]">Verification Documents</h3>
                {documents.length === 0 ? (
                    <p className="text-sm text-[#7C7373]">No documents uploaded.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {documents.map((doc) => (
                            <div key={doc.id} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                                <div className="mb-3 flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-[#333333]">{doc.type}</p>
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {doc.fileName} ↗
                                        </a>
                                    </div>
                                    <Badge
                                        variant={
                                            doc.status === 'APPROVED'
                                                ? 'success'
                                                : doc.status === 'REJECTED'
                                                    ? 'destructive'
                                                    : 'warning'
                                        }
                                    >
                                        {doc.status}
                                    </Badge>
                                </div>

                                {doc.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="success"
                                            className="w-full text-xs"
                                            onClick={() => handleDocumentAction(doc.id, 'APPROVED')}
                                            disabled={!!loading}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="w-full text-xs"
                                            onClick={() => handleDocumentAction(doc.id, 'REJECTED')}
                                            disabled={!!loading}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
