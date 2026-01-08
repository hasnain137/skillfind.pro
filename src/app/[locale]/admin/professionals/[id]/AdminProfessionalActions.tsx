'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface AdminProfessionalActionsProps {
    professionalId: string;
    currentStatus: string;
    isVerified: boolean;
    qualificationVerified: boolean;
    hasIdentity: boolean;
    documents: {
        id: string;
        type: string;
        status: string;
        fileUrl: string;
        fileName: string;
        rejectionReason?: string | null;
    }[];
}

export default function AdminProfessionalActions({
    professionalId,
    currentStatus,
    isVerified,
    qualificationVerified,
    hasIdentity,
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

    async function handleVerificationChange(newStatus: boolean) {
        if (!confirm(`Are you sure you want to ${newStatus ? 'verify' : 'unverify'} this professional?`)) return;

        setLoading('verify');
        try {
            const res = await fetch(`/api/admin/professionals/${professionalId}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update verification status');
            router.refresh();
        } catch (error) {
            alert('Error updating verification status');
            console.error(error);
        } finally {
            setLoading(null);
        }
    }

    async function handleDocumentVerificationChange(verified: boolean) {
        if (!confirm(`Are you sure you want to ${verified ? 'approve' : 'revoke'} document verification?`)) return;

        setLoading('qualifications');
        try {
            const res = await fetch(`/api/admin/verify-qualification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ professionalId, approved: verified }),
            });

            if (!res.ok) throw new Error('Failed to update document verification');
            router.refresh();
        } catch (error) {
            alert('Error updating document verification');
            console.error(error);
        } finally {
            setLoading(null);
        }
    }

    async function handleIdentityVerificationChange(verified: boolean) {
        if (!confirm(`Are you sure you want to ${verified ? 'verify' : 'revoke'} identity verification?`)) return;

        setLoading('identity');
        try {
            const res = await fetch(`/api/admin/professionals/${professionalId}/identity`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified }),
            });

            if (!res.ok) throw new Error('Failed to update identity verification');
            router.refresh();
        } catch (error) {
            alert('Error updating identity verification');
            console.error(error);
        } finally {
            setLoading(null);
        }
    }

    async function handleDocumentAction(documentId: string, action: 'APPROVED' | 'REJECTED') {
        let rejectionReason = undefined;

        if (action === 'REJECTED') {
            const reason = prompt('Please enter the reason for rejection:');
            if (reason === null) return; // Cancelled
            if (!reason.trim()) {
                alert('Rejection reason is required.');
                return;
            }
            rejectionReason = reason;
        } else {
            if (!confirm(`Are you sure you want to approve this document?`)) return;
        }

        setLoading(documentId);
        try {
            const res = await fetch(`/api/admin/documents/${documentId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action, rejectionReason }),
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
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleStatusChange('ACTIVE')}
                        disabled={!!loading}
                    >
                        {loading === 'status' ? 'Updating...' : 'Activate Account'}
                    </Button>
                )}
                {currentStatus !== 'SUSPENDED' && (
                    <Button
                        variant="default"
                        className="bg-amber-500 hover:bg-amber-600 text-white"
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

            {/* Verification Actions - 4 Buttons */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
                <h3 className="text-lg font-bold text-[#333333]">Verification Controls</h3>

                {/* Document Verification Row */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-medium text-[#333333]">Document Verification</p>
                        <p className="text-xs text-[#7C7373]">
                            Status: {qualificationVerified ?
                                <span className="text-green-600 font-medium">Verified</span> :
                                <span className="text-amber-600 font-medium">Not Verified</span>}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!qualificationVerified ? (
                            <Button
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                onClick={() => handleDocumentVerificationChange(true)}
                                disabled={!!loading}
                            >
                                {loading === 'qualifications' ? 'Updating...' : 'Verify Documents'}
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                className="text-xs"
                                onClick={() => handleDocumentVerificationChange(false)}
                                disabled={!!loading}
                            >
                                {loading === 'qualifications' ? 'Updating...' : 'Unverify Documents'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Identity Verification Row */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-medium text-[#333333]">Identity Verification</p>
                        <p className="text-xs text-[#7C7373]">
                            Status: {hasIdentity ?
                                <span className="text-green-600 font-medium">Verified</span> :
                                <span className="text-amber-600 font-medium">Not Verified</span>}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!hasIdentity ? (
                            <Button
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                onClick={() => handleIdentityVerificationChange(true)}
                                disabled={!!loading}
                            >
                                {loading === 'identity' ? 'Updating...' : 'Verify Identity'}
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                className="text-xs"
                                onClick={() => handleIdentityVerificationChange(false)}
                                disabled={!!loading}
                            >
                                {loading === 'identity' ? 'Updating...' : 'Unverify Identity'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Combined Status Display */}
                <div className="p-4 border rounded-lg bg-white">
                    <p className="text-sm text-[#7C7373]">
                        <strong>Overall Profile Status:</strong>{' '}
                        {isVerified ? (
                            <span className="text-green-600 font-medium">✓ Fully Verified</span>
                        ) : (
                            <span className="text-amber-600 font-medium">
                                ⚠ Not Verified ({!qualificationVerified && 'Documents pending'}{!qualificationVerified && !hasIdentity && ', '}{!hasIdentity && 'Identity pending'})
                            </span>
                        )}
                    </p>
                </div>
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
                                {doc.status === 'REJECTED' && doc.rejectionReason && (
                                    <div className="mb-3 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                                        <strong>Reason:</strong> {doc.rejectionReason}
                                    </div>
                                )}

                                {doc.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="default"
                                            className="w-full text-xs bg-green-600 hover:bg-green-700 text-white"
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
