// src/components/layout/MobileDashboardNav.tsx
'use client';

import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';

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

    // Take only the first 5 links for the bottom bar
    const visibleLinks = links.slice(0, 5);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E5E7EB] bg-white/95 backdrop-blur-sm lg:hidden safe-area-inset-bottom">
            <div className="flex items-center justify-around px-2 py-2">
                {visibleLinks.map((link) => {
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
            </div>
        </nav>
    );
}
