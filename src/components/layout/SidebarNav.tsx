// src/components/layout/SidebarNav.tsx
'use client';

import Link from 'next/link';
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
        <nav className="mt-6 flex flex-col gap-1 text-sm font-medium">
            {links.map((link) => {
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
              flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all duration-200
              ${isActive
                                ? 'bg-[#2563EB]/10 text-[#2563EB] font-semibold border-l-3 border-[#2563EB] shadow-sm'
                                : 'text-[#7C7373] hover:bg-[#F3F4F6] hover:text-[#333333]'
                            }
            `}
                    >
                        {link.icon && <span className="text-base">{link.icon}</span>}
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
