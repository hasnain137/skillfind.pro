// src/components/layout/SidebarNav.tsx
'use client';

import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';

interface NavLink {
    label: string;
    href: string;
    icon?: string;
}

interface SidebarNavProps {
    links: NavLink[];
}

export function SidebarNav({ links }: SidebarNavProps) {
    const pathname = usePathname();

    return (
        <nav className="mt-6 flex flex-col gap-1.5 text-sm font-medium">
            {links.map((link, index) => {
                // Check if current path matches this link
                // Exact match for dashboard home, startsWith for sub-pages
                const isActive =
                    link.href === pathname ||
                    (link.href !== '/client' && link.href !== '/pro' && pathname.startsWith(link.href));

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`
                            group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 
                            transition-all duration-300 ease-out
                            ${isActive
                                ? 'bg-gradient-to-r from-[#2563EB]/15 via-[#2563EB]/10 to-transparent text-[#2563EB] font-semibold shadow-sm'
                                : 'text-[#6B7280] hover:bg-white/60 hover:text-[#333333] hover:shadow-sm'
                            }
                        `}
                        style={{
                            animationDelay: `${index * 0.05}s`,
                        }}
                    >
                        {/* Active indicator bar */}
                        {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#2563EB] to-[#1D4FD8] rounded-r-full" />
                        )}
                        {link.icon && (
                            <span className={`text-base transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                                {link.icon}
                            </span>
                        )}
                        <span className="relative">
                            {link.label}
                            {isActive && (
                                <span className="absolute -bottom-0.5 left-0 w-full h-px bg-gradient-to-r from-[#2563EB]/50 to-transparent" />
                            )}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
