'use client';

import { getInitials } from '@/lib/utils';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface AvatarProps {
    src?: string | null;
    firstName?: string;
    lastName?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const SIZES = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
};

export function Avatar({ src, firstName = '', lastName = '', size = 'md', className = '' }: AvatarProps) {
    const [imageError, setImageError] = useState(false);
    const initials = getInitials(firstName, lastName);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    if (src && !imageError) {
        return (
            <div className={`relative shrink-0 overflow-hidden rounded-full ${SIZES[size]} ${className}`}>
                <Image
                    src={src}
                    alt={`${firstName} ${lastName}`}
                    fill
                    className="object-cover"
                    onError={() => {
                        // Prevent state update if not mounted
                        if (isMounted.current) {
                            setImageError(true);
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] font-bold text-white shadow-sm ring-2 ring-white ${SIZES[size]} ${className}`}
        >
            {initials}
        </div>
    );
}
