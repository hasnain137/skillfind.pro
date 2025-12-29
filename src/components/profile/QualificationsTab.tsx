'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface QualificationsTabProps {
    professionalId: string;
    documents: Array<{
        id: string;
        type: string;
        fileName: string;
        fileUrl: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        uploadedAt: Date;
        rejectionReason?: string;
    }>;
}

export function QualificationsTab({ professionalId, documents }: QualificationsTabProps) {
    const t = useTranslations('ProProfile.Qualifications');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('File size must be less than 10MB');
            return;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError('Only PDF and image files (JPEG, PNG) are allowed');
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'DIPLOMA'); // or CERTIFICATION, based on user selection

            // Upload to API
            const response = await fetch('/api/professionals/documents', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }

            // Refresh page to show new document
            window.location.reload();
        } catch (error: any) {
            setUploadError(error.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'REJECTED':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-amber-600" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return t('status.approved');
            case 'REJECTED':
                return t('status.rejected');
            default:
                return t('status.pending');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'REJECTED':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-amber-50 border-amber-200 text-amber-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                        {t('description')}
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">{t('acceptedDocuments')}</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• {t('docTypes.diploma')}</li>
                            <li>• {t('docTypes.certificate')}</li>
                            <li>• {t('docTypes.degree')}</li>
                            <li>• {t('docTypes.resume')}</li>
                            <li>• {t('docTypes.portfolio')}</li>
                        </ul>
                    </div>

                    {/* Upload Button */}
                    <div>
                        <input
                            id="document-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                        <label
                            htmlFor="document-upload"
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${uploading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#2563EB] hover:bg-[#1D4FD8] text-white'
                                }`}
                        >
                            <Upload className="h-5 w-5" />
                            <span>{uploading ? t('uploading') : t('uploadButton')}</span>
                        </label>
                        {uploadError && (
                            <p className="text-sm text-red-600 mt-2">{uploadError}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Uploaded Documents */}
            {documents.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('uploadedDocuments')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {documents.map((doc) => (
                                <div key={doc.id} className={`border rounded-lg ${getStatusColor(doc.status)}`}>
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5" />
                                            <div>
                                                <p className="font-medium">{doc.fileName}</p>
                                                <p className="text-xs opacity-75">
                                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(doc.status)}
                                            <span className="text-sm font-medium">{getStatusText(doc.status)}</span>
                                        </div>
                                    </div>
                                    {doc.status === 'REJECTED' && doc.rejectionReason && (
                                        <div className="px-4 pb-4 pt-0">
                                            <div className="text-xs bg-red-100 text-red-700 p-2 rounded">
                                                <span className="font-semibold">{t('rejectionReason')}: </span>
                                                {doc.rejectionReason}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )
            }
        </div >
    );
}
