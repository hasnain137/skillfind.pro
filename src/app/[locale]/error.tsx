'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-surface-50 px-4 text-center">
            <Container>
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-surface-900">Something went wrong!</h1>
                    <p className="text-surface-600 max-w-md mx-auto">
                        An unexpected error has occurred. We apologize for the inconvenience.
                    </p>
                    <div className="pt-6 flex justify-center gap-4">
                        <Button
                            onClick={() => reset()}
                            variant="default"
                            className="shadow-soft"
                        >
                            Try again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                        >
                            Go Home
                        </Button>
                    </div>
                </div>
            </Container>
        </div>
    );
}
