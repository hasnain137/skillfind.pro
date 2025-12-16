
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, X, CheckCircle } from 'lucide-react';

interface DocumentUploadProps {
    onUploadSuccess: () => void;
    existingDocuments: any[];
}

const DOCUMENT_TYPES = [
    { value: 'IDENTITY_CARD', label: 'Identity Card (ID)' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'DRIVERS_LICENSE', label: 'Driver\'s License' },
    { value: 'BUSINESS_LICENSE', label: 'Business License / Kbis' },
    { value: 'DIPLOMA', label: 'Diploma / Degree' },
    { value: 'CERTIFICATION', label: 'Professional Certification' },
    { value: 'PORTFOLIO_SAMPLE', label: 'Portfolio Sample' },
    { value: 'OTHER', label: 'Other Document' },
];

export function DocumentUpload({ onUploadSuccess, existingDocuments }: DocumentUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0].value);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File is too large. Max 5MB allowed.');
            return;
        }

        setIsUploading(true);
        try {
            // 1. Upload file itself
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const error = await uploadRes.json();
                throw new Error(error.error || 'Failed to upload file');
            }

            const { url: fileUrl } = await uploadRes.json();

            // 2. Save document metadata
            const metadataRes = await fetch('/api/professionals/documents/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: selectedType,
                    fileUrl,
                    fileName: file.name,
                    fileSize: file.size,
                }),
            });

            if (!metadataRes.ok) {
                throw new Error('Failed to save document info');
            }

            toast.success('Document uploaded successfully!');
            onUploadSuccess();

            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (documentId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const res = await fetch(`/api/professionals/documents/upload?documentId=${documentId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            toast.success('Document deleted');
            onUploadSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Could not delete document');
        }
    };

    return (
        <div className="space-y-6">
            <Card padding="lg">
                <h3 className="text-lg font-bold text-[#333333] mb-4">Upload Verification Documents</h3>
                <p className="text-sm text-[#7C7373] mb-6">
                    Please upload official documents to verify your identity and expertise.
                    Once approved by our team, your profile will receive a &quot;Verified&quot; badge.
                </p>

                <div className="flex gap-4 items-end mb-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-[#7C7373] mb-1.5">
                            Document Type
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                        >
                            {DOCUMENT_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            className="hidden"
                        />
                        <Button
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="min-w-[140px]"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Select File
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <p className="text-xs text-[#7C7373] flex items-center gap-2">
                    <span>ℹ️ Accepted formats: PDF, JPG, PNG (Max 5MB)</span>
                </p>
            </Card>

            <div className="space-y-4">
                <h4 className="text-base font-bold text-[#333333]">Uploaded Documents</h4>
                {existingDocuments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-[#E5E7EB]">
                        <p className="text-[#7C7373] text-sm">No documents uploaded yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {existingDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E5E7EB]">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-[#333333] truncate">{doc.type}</p>
                                        <p className="text-xs text-[#7C7373] truncate">{doc.fileName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Badge variant={
                                        doc.status === 'APPROVED' ? 'success' :
                                            doc.status === 'REJECTED' ? 'destructive' : 'warning'
                                    }>
                                        {doc.status}
                                    </Badge>

                                    {doc.status !== 'APPROVED' && (
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Delete document"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
