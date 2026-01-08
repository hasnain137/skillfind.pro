'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
    label?: string;
    className?: string;
}

export function BackButton({ label = 'Back', className }: BackButtonProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={`inline-flex items-center text-blue-100 hover:text-white transition-colors group ${className || ''}`}
        >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {label}
        </button>
    );
}
