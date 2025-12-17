'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useRouter } from 'next/navigation';

interface Document {
    id: string;
    type: string;
    url: string;
    status: string;
    createdAt: Date;
}

interface DocumentUploadProps {
    documents: Document[];
    isEditable?: boolean; // false if Pending/Verified
}

export function DocumentUpload({ documents: initialDocuments, isEditable = true }: DocumentUploadProps) {
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (result: any) => {
        if (result.event !== 'success') return;

        setIsUploading(true);
        try {
            const res = await fetch('/api/professionals/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: result.info.secure_url,
                    type: 'IDENTITY_PROOF', // Default type for now
                    name: result.info.original_filename
                }),
            });

            if (res.ok) {
                const newDoc = await res.json();
                setDocuments([...documents, newDoc.data]);
                router.refresh();
            }
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const res = await fetch(`/api/professionals/documents/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setDocuments(documents.filter(d => d.id !== id));
                router.refresh();
            }
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-[#333333] mb-4">Upload Verification Documents</h3>
            <p className="text-sm text-[#7C7373] mb-6">
                Please upload official documents to verify your identity and expertise.
                Once approved by our team, your profile will receive a &quot;Verified&quot; badge.
            </p>

            <div className="space-y-4">
                {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded text-blue-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-gray-900">{doc.type}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(doc.createdAt).toLocaleDateString()} • {doc.status}
                                </p>
                            </div>
                        </div>
                        {isEditable && (
                            <button
                                onClick={() => handleDelete(doc.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Delete document"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        {!isEditable && doc.status === 'APPROVED' && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                    </div>
                ))}

                {isEditable && (
                    <div className="mt-4">
                        <CldUploadWidget
                            uploadPreset="skillfind_docs" // Assuming this preset exists
                            onUpload={handleUpload}
                        >
                            {({ open }) => (
                                <Button
                                    onClick={() => open()}
                                    className="w-full"
                                    variant="outline"
                                    disabled={isUploading}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {isUploading ? 'Uploading...' : 'Upload New Document'}
                                </Button>
                            )}
                        </CldUploadWidget>
                    </div>
                )}
            </div>
        </Card>
    );
}
