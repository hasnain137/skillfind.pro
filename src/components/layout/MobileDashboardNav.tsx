// src/components/layout/MobileDashboardNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NavLink {
    label: string;
    href: string;
    icon: string;
}

interface MobileDashboardNavProps {
    links: NavLink[];
}

export function MobileDashboardNav({ links }: MobileDashboardNavProps) {
    const pathname = usePathname();
    const t = useTranslations('Sidebar');
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    // If more than 5 links, show 4 + More button
    const showMoreMenu = links.length > 5;
    const primaryLinks = showMoreMenu ? links.slice(0, 4) : links.slice(0, 5);
    const hiddenLinks = showMoreMenu ? links.slice(4) : [];

    return (
        <>
            {/* Overlay Menu for Hidden Links */}
            {isMoreOpen && (
                <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setIsMoreOpen(false)}>
                    <div
                        className="absolute bottom-[80px] right-4 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="py-2">
                            {hiddenLinks.map((link) => {
                                const isActive = link.href === pathname || pathname.startsWith(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMoreOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                                            ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}
                                        `}
                                    >
                                        <span className="text-lg">{link.icon}</span>
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E5E7EB] bg-white/95 backdrop-blur-sm lg:hidden safe-area-inset-bottom">
                <div className="flex items-center justify-around px-2 py-2">
                    {primaryLinks.map((link) => {
                        const isActive =
                            link.href === pathname ||
                            (link.href !== '/client' && link.href !== '/pro' && pathname.startsWith(link.href));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`
                    flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 min-w-[56px] transition-all duration-200
                    ${isActive
                                        ? 'text-[#2563EB]'
                                        : 'text-[#7C7373] active:bg-[#F3F4F6]'
                                    }
                  `}
                            >
                                <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>
                                    {link.icon}
                                </span>
                                <span className={`text-[10px] font-medium truncate ${isActive ? 'font-semibold' : ''}`}>
                                    {link.label}
                                </span>
                                {isActive && (
                                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#2563EB] rounded-full" />
                                )}
                            </Link>
                        );
                    })}

                    {/* More Button */}
                    {showMoreMenu && (
                        <button
                            onClick={() => setIsMoreOpen(!isMoreOpen)}
                            className={`
                                flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 min-w-[56px] transition-all duration-200
                                ${isMoreOpen ? 'text-[#2563EB]' : 'text-[#7C7373] active:bg-[#F3F4F6]'}
                            `}
                        >
                            <span className={`text-xl ${isMoreOpen ? 'scale-110' : ''} transition-transform`}>
                                {isMoreOpen ? <X className="w-6 h-6" /> : <MoreHorizontal className="w-6 h-6" />}
                            </span>
                            <span className={`text-[10px] font-medium truncate ${isMoreOpen ? 'font-semibold' : ''}`}>
                                {t('more')}
                            </span>
                        </button>
                    )}
                </div>
            </nav>
        </>
    );
}
