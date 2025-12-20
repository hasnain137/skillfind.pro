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
    variant?: 'light' | 'dark';
}

export function SidebarNav({ links, variant = 'light' }: SidebarNavProps) {
    const pathname = usePathname();

    const isDark = variant === 'dark';

    return (
        <nav className="mt-6 flex flex-col gap-1.5 text-sm font-medium">
            {links.map((link, index) => {
                // Check if current path matches this link
                // Exact match for dashboard home, startsWith for sub-pages
                // Normalize pathname to remove locale for checking active state
                // e.g. /en/pro/jobs -> /pro/jobs
                const normalizedPathname = pathname.replace(/^\/[a-z]{2}/, '') || '/';

                // Check for exact match first
                const isExactMatch = link.href === normalizedPathname;

                // For prefix matching, ensure we're matching a complete path segment
                // This prevents /client/requests from matching /client/requests/new
                const isPrefixMatch =
                    link.href !== '/client' &&
                    link.href !== '/pro' &&
                    normalizedPathname.startsWith(link.href) &&
                    (normalizedPathname.length === link.href.length || normalizedPathname[link.href.length] === '/');

                // Check if there's a more specific link that matches (to avoid both parent and child being active)
                const hasMoreSpecificMatch = links.some(otherLink =>
                    otherLink.href !== link.href &&
                    otherLink.href.startsWith(link.href) &&
                    (normalizedPathname === otherLink.href || normalizedPathname.startsWith(otherLink.href))
                );

                const isActive = isExactMatch || (isPrefixMatch && !hasMoreSpecificMatch);

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`
                            group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 
                            transition-all duration-300 ease-out
                            ${isDark
                                ? isActive
                                    ? 'bg-white/10 text-white font-semibold shadow-sm'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white hover:shadow-sm'
                                : isActive
                                    ? 'bg-gradient-to-r from-[#2563EB]/15 via-[#2563EB]/10 to-transparent text-[#2563EB] font-semibold shadow-sm'
                                    : 'text-[#6B7280] hover:bg-white/60 hover:text-[#333333] hover:shadow-sm'
                            }
                        `}
                        style={{
                            animationDelay: `${index * 0.05}s`,
                        }}
                    >
                        {/* Active indicator bar - Only for light mode or different style for dark */}
                        {isActive && !isDark && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#2563EB] to-[#1D4FD8] rounded-r-full" />
                        )}
                        {/* Active indicator for dark mode (optional, maybe a glow or left border) */}
                        {isActive && isDark && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                        )}

                        {link.icon && (
                            <span className={`text-base transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                                {link.icon}
                            </span>
                        )}
                        <span className="relative">
                            {link.label}
                            {isActive && !isDark && (
                                <span className="absolute -bottom-0.5 left-0 w-full h-px bg-gradient-to-r from-[#2563EB]/50 to-transparent" />
                            )}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
