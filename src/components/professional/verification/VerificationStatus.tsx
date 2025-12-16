
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface VerificationStatusProps {
    isVerified: boolean;
    verificationMethod: string;
    documents: any[];
}

export function VerificationStatus({ isVerified, verificationMethod, documents }: VerificationStatusProps) {
    const hasPendingDocs = documents.some(d => d.status === 'PENDING');
    const hasRejectedDocs = documents.some(d => d.status === 'REJECTED');

    if (isVerified) {
        return (
            <Card className="bg-green-50 border-green-200" padding="lg">
                <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-green-900">You are Verified!</h3>
                        <p className="text-green-700 mt-1">
                            Your profile has been verified. You now have the "Verified" badge on your profile
                            and search results, which increases client trust and visibility.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    if (hasPendingDocs) {
        return (
            <Card className="bg-blue-50 border-blue-200" padding="lg">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-blue-900">Verification in Progress</h3>
                        <p className="text-blue-700 mt-1">
                            We have received your documents and they are currently under review.
                            This usually takes 24-48 hours. You will be notified once the review is complete.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    if (hasRejectedDocs) {
        return (
            <Card className="bg-red-50 border-red-200" padding="lg">
                <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-full text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-900">Attention Required</h3>
                        <p className="text-red-700 mt-1">
                            One or more of your documents were rejected. Please check the rejection reason
                            and upload a valid document to proceed with verification.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-50 border-gray-200" padding="lg">
            <div className="flex items-start gap-4">
                <div className="bg-gray-200 p-2 rounded-full text-gray-500">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Profile Not Verified</h3>
                    <p className="text-gray-600 mt-1">
                        Please upload at least one official identity document (ID Card, Passport, or Business License)
                        to verify your account. Verified profiles get 3x more jobs.
                    </p>
                </div>
            </div>
        </Card>
    );
}
