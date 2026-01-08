'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-red-50 to-white px-4 text-center">
            <Container>
                <div className="max-w-md mx-auto space-y-6">
                    {/* Error Icon */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>

                    {/* Error Message */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-[#333333]">Something went wrong</h1>
                        <p className="text-[#7C7373]">
                            An unexpected error occurred. We apologize for the inconvenience.
                        </p>
                    </div>

                    {/* Error Details (for debugging) */}
                    {error.digest && (
                        <div className="bg-gray-100 rounded-lg px-4 py-2 text-xs text-[#7C7373]">
                            <span className="font-medium">Error ID:</span> {error.digest}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Button
                            onClick={() => reset()}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => window.location.href = '/'}
                            className="gap-2"
                        >
                            <Home className="h-4 w-4" />
                            Home
                        </Button>
                    </div>

                    {/* Help Text */}
                    <p className="text-xs text-[#B0B0B0] pt-4">
                        If this problem persists, please contact support.
                    </p>
                </div>
            </Container>
        </div>
    );
}

